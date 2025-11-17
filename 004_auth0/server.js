// Servidor Express principal: sirve la SPA, gestiona Cookies de consentimiento y redirige si es necesario
// -----------------------------------------------------------------------------------------------
// Dependencias externas
// express........... Framework web minimalista para Node.js
// path join......... Para construir rutas de forma segura entre SO.
// morgan............ Logger HTTP en modo desarrollo.
// helmet............ Cabeceras de seguridad recomendadas.
// cookie-parser..... Middleware para leer cookies entrantes.
require("dotenv").config();
const express = require("express");
const { join } = require("path");
const morgan = require("morgan");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const app = express();

// Detectar si estamos en producción usando la variable ENVIRONMENT definida en .env
const isProd = process.env.ENVIRONMENT === "production";

// Helper para logs verbosos solo en desarrollo
const logDev = (...args) => {
  if (!isProd) console.log(...args);
};

// === Middlewares globales ===
// 1. morgan: registra las peticiones en consola (solo en dev)
// 2. helmet: añade cabeceras de seguridad (HSTS, CSP, etc.)
// 3. cookieParser: hace disponible req.cookies
// 4. express.urlencoded: parsea cuerpos de formularios x-www-form-urlencoded
if (!isProd) {
  app.use(morgan("dev"));
}
app.use(helmet());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Comprueba si existe la cookie "cookie_consent". Si no existe y la URL solicitada
// no está en la lista blanca, se envía la página /public/consent.html en su lugar.
app.use((req, res, next) => {
  const consent = req.cookies.cookie_consent; // "accepted" si el usuario ya aceptó

  // Rutas públicas que no requieren consentimiento previo
  const allowed = [
    "/consent.html",   // propia página de consentimiento
    "/cookie-policy.html",    // política de cookies
    "/cookie-reject.html",    // aviso de rechazo
    "/accept-cookies", // endpoint que crea la cookie
    "/auth_config.json", // config que necesita la SPA
    "/api/validate-token" // endpoint para auth_request de nginx (CRÍTICO)
  ];

  // Directorios estáticos permitidos (CSS, JS, imágenes...) que la página de
  // consentimiento necesita para mostrarse correctamente.
  const startsWithAllowed = ["/css/", "/js/", "/images/", "/favicon", "/fonts/"];

  const isAllowed =
    allowed.includes(req.path) ||
    startsWithAllowed.some((p) => req.path.startsWith(p));

  // Si no hay consentimiento y la ruta no es pública, muestra consent.html
  if (!consent && !isAllowed) {
    return res.sendFile(join(__dirname, "public/consent.html"));
  }
  next();
});

// === Archivos estáticos ===
// Se sirven todos los recursos dentro de /public una vez superada la verificación anterior.
app.use(express.static(join(__dirname, "public")));


// === Endpoint para aceptar cookies ===
// Crea la cookie "cookie_consent" con duración de 1 año y redirige al home.
app.post("/accept-cookies", (req, res) => {
  res.cookie("cookie_consent", "accepted", {
    maxAge: 1000 * 60 * 60 * 24 * 365, // 1 año en milisegundos
    sameSite: "lax",                   // protege contra CSRF básico
    secure: isProd // solo HTTPS en prod
  });
  res.redirect("/");
});

// === Rutas adicionales ===
// Config de Auth0 para la SPA
app.get("/auth_config.json", (req, res) => {
  const domain = process.env.DOMAIN_AUTH0;
  const clientId = process.env.CLIENT_ID_AUTH0;
  const environment = process.env.ENVIRONMENT || "production";
  if (!domain || !clientId) {
    return res.status(500).json({ error: "Auth0 env vars not set" });
  }
  res.json({ domain, clientId, environment });
});

// === Endpoint de debug para verificar el estado de autenticación ===
if (!isProd) {
  app.get("/debug/auth-status", (req, res) => {
    logDev("=== Debug Auth Status ===");

    const allCookies = req.cookies;
    const allHeaders = req.headers;

    const debugInfo = {
      environment: process.env.ENVIRONMENT,
      timestamp: new Date().toISOString(),
      hostname: req.hostname,
      originalUrl: req.originalUrl,
      cookies: allCookies,
      hasIdToken: !!allCookies.id_token,
      idTokenPreview: allCookies.id_token ? allCookies.id_token.substring(0, 50) + '...' : null,
      hasCookieConsent: !!allCookies.cookie_consent,
      userAgent: allHeaders['user-agent'],
      forwardedFor: allHeaders['x-forwarded-for'],
      forwarded: allHeaders['x-forwarded-proto']
    };

    logDev("Debug info:", JSON.stringify(debugInfo, null, 2));

    res.json(debugInfo);
  });
}

// === Endpoint para validación de tokens (usado por Nginx auth_request) ===
app.get("/api/validate-token", (req, res) => {
  logDev("=== Token Validation Request ===");
  logDev("Original URI:", req.headers['x-original-uri']);

  // Obtener el token del header enviado por Nginx
  const authHeader = req.headers['x-forwarded-access-token'];
  logDev("Auth header:", authHeader ? `Present: ${authHeader.substring(0, 50)}...` : "Missing");

  // Verificar si hay cookie id_token directamente
  const cookies = req.headers.cookie;
  let idTokenFromCookie = null;
  if (cookies) {
    const match = cookies.match(/id_token=([^;]+)/);
    idTokenFromCookie = match ? match[1] : null;
    logDev("id_token cookie:", idTokenFromCookie ? `Present: ${idTokenFromCookie.substring(0, 50)}...` : "Missing");
  }

  if (!authHeader && !idTokenFromCookie) {
    logDev("❌ No auth header found and no id_token cookie");
    return res.status(401).json({ error: "No token provided" });
  }

  // Usar el token del header primero, luego de la cookie
  let token;
  if (authHeader) {
    token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader;
  } else {
    token = idTokenFromCookie;
  }

  if (!token) {
    logDev("❌ No token found");
    return res.status(401).json({ error: "Invalid token format" });
  }

  try {
    // Decodificar el JWT para validación básica (sin verificar firma por ahora)
    const parts = token.split('.');
    if (parts.length !== 3) {
      logDev("❌ Invalid JWT format");
      return res.status(401).json({ error: "Invalid JWT format" });
    }

    const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString());
    logDev("Token payload:", JSON.stringify(payload, null, 2));

    // Verificar expiración
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      logDev("❌ Token expired");
      logDev("Current time:", now, "Token exp:", payload.exp);
      return res.status(401).json({ error: "Token expired" });
    }

    logDev("✅ Token validation successful");
    logDev("User:", payload.sub || "Unknown");
    logDev("Expires:", new Date(payload.exp * 1000).toISOString());

    // Respuesta exitosa para Nginx
    res.set('X-User', payload.sub || 'unknown');
    res.status(200).json({
      valid: true,
      user: payload.sub,
      exp: payload.exp
    });

  } catch (error) {
    logDev("❌ Token validation failed:", error.message);
    if (!isProd) {
      logDev("Token received:", token.substring(0, 100) + "...");
    }
    res.status(401).json({ error: "Invalid token" });
  }
});

// Catch-all: cualquier otra ruta devuelve index.html (SPA routing)
app.get("/*", (_, res) => {
  res.sendFile(join(__dirname, "index.html"));
});

// Manejo de SIGINT para cerrar servidor (útil al usar nodemon)
process.on("SIGINT", function() {
  process.exit();
});

module.exports = app;
