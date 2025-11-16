// The Auth0 client, initialized in configureClient()
let auth0Client = null;

// Detect environment (localhost = development) and helper for dev logs
if (typeof window.IS_DEV === 'undefined') {
  window.IS_DEV = false;
}

if (!window.logDev) {
  window.logDev = (...args) => { if (window.IS_DEV) console.log(...args); };
}
var logDev = window.logDev;

/**
 * Inicia el flujo de autenticación utilizando Auth0 Universal Login.
 * @param {string} [targetUrl] Ruta de retorno deseada tras hacer login.
 */
const login = async (targetUrl) => {
  try {
    logDev("Logging in", targetUrl);

    const options = {
      authorizationParams: {
        redirect_uri: window.location.origin
      }
    };

    if (targetUrl) {
      options.appState = { targetUrl };
    }

    await auth0Client.loginWithRedirect(options);
  } catch (err) {
    console.log("Log in failed", err);
  }
};

/**
 * Cierra la sesión del usuario y redirige al origen de la aplicación.
 */
const logout = async () => {
  try {
    logDev("Logging out");
    deleteTokenCookie();
    await auth0Client.logout({
      logoutParams: {
        returnTo: window.location.origin
      }
    });
  } catch (err) {
    console.log("Log out failed", err);
  }
};

/**
 * Descarga el fichero de configuración generado en el servidor con dominio y clientId.
 * Se mantiene separado para que la SPA no incluya hard-coded las credenciales.
 */
const fetchAuthConfig = () => fetch("/auth_config.json");

/**
 * Crea (o reutiliza) la instancia de Auth0 y la almacena en auth0Client.
 * Se configura el almacenamiento en localStorage para que la sesión persista entre páginas.
 */
const configureClient = async () => {
  const response = await fetchAuthConfig();
  const config = await response.json();

  const resolvedClientId = config.clientId || config.ClientId;
  auth0Client = await auth0.createAuth0Client({
    domain: config.domain,
    clientId: resolvedClientId,
    cacheLocation: "localstorage"
  });

  // Actualizar flag de entorno según config recibida
  if (typeof config.environment === 'string') {
    window.IS_DEV = config.environment !== 'production';
  }
};

/**
 * Garantiza que el usuario esté autenticado en la página actual.
 * Si no lo está, redirige a la URL indicada (por defecto "/").
 * Devuelve true si está autenticado, false si se desencadenó la redirección.
 */
const ensureAuthenticatedOrRedirect = async (redirectUrl = "/") => {
  await configureClient();
  const isAuthenticated = await auth0Client.isAuthenticated();
  if (!isAuthenticated) {
    window.location.replace(redirectUrl);
    return false;
  }
  return true;
};

/**
 * Crea una cookie con el id_token.
 * @param {string} token - El ID Token de Auth0.
 */
const setTokenCookie = (token) => {
  // Codifica el token para que sea seguro en una cookie
  const encodedToken = token;
  // Crea la cookie. secure: true en producción.
  // domain: .tonilogar.com para que sea accesible en subdominios.
  const domain = window.location.hostname.includes('localhost') ? 'localhost' : '.tonilogar.com';
  const isProduction = !window.location.hostname.includes('localhost');

  document.cookie = `id_token=${encodedToken}; path=/; domain=${domain}; max-age=86400; SameSite=Lax${isProduction ? '; Secure' : ''}`;
  logDev('Cookie id_token creada (preview):', encodedToken.slice(0, 50) + '…');
  logDev('Dominio:', domain, 'Prod:', isProduction);

  // Test para verificar que la cookie se creó correctamente
  setTimeout(() => {
    const cookies = document.cookie.split(';');
    const idTokenCookie = cookies.find(c => c.trim().startsWith('id_token='));
    logDev('Verificación cookie id_token:', idTokenCookie ? 'Encontrada' : 'NO encontrada');
  }, 100);
};

/**
 * Elimina la cookie del id_token.
 */
const deleteTokenCookie = () => {
  const domain = window.location.hostname.includes('localhost') ? 'localhost' : '.tonilogar.com';
  const isProduction = !window.location.hostname.includes('localhost');

  document.cookie = `id_token=; path=/; domain=${domain}; max-age=0; SameSite=Lax${isProduction ? '; Secure' : ''}`;
  logDev('Cookie id_token eliminada para el dominio:', domain);
  logDev('Producción:', isProduction);
};

// Inicialización específica para tools.html
window.onload = async () => {
  await configureClient();

  const query = window.location.search;
  const shouldParseResult = query.includes("code=") && query.includes("state=");

  if (shouldParseResult) {
    logDev("> Parsing redirect");
    try {
      const result = await auth0Client.handleRedirectCallback();

      // Después de procesar el callback, obtenemos el id_token y lo guardamos en una cookie.
      const claims = await auth0Client.getIdTokenClaims();
      if (claims && claims.__raw) {
        setTokenCookie(claims.__raw);
      }

      logDev("Logged in!");
      // Limpiar la URL después del callback
      window.history.replaceState({}, document.title, "/tools.html");

      // Recargar la página para mostrar el contenido autenticado
      window.location.reload();
      return;
    } catch (err) {
      console.log("Error parsing redirect:", err);
    }
  }

  // Verificar autenticación para tools.html
  const isAuthenticated = await auth0Client.isAuthenticated();

  if (!isAuthenticated) {
    logDev("> User not authenticated, redirecting to login");
    window.location.replace("/");
    return;
  }

  logDev("> User is authenticated, tools.html ready");

  // Inicializar funcionalidades de la página
  initializeToolsPage();
};

// Función para detectar el entorno
function getCurrentEnvironment() {
  // Detectar si estamos en desarrollo (localhost) o producción
  return window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' ? 'dev' : 'prod';
}

// Función para manejar clicks en enlaces de herramientas
function handleToolClick(event) {
  event.preventDefault();
  const link = event.currentTarget;
  const environment = getCurrentEnvironment();

  let url;
  if (environment === 'dev') {
    url = link.getAttribute('data-dev');
  } else {
    url = link.getAttribute('data-prod');
  }

  if (url) {
    // Abrir en nueva pestaña/ventana
    window.open(url, '_blank');
  }
}

// Función para inicializar las funcionalidades de la página tools.html
function initializeToolsPage() {
  // Configurar el botón de logout
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", logout);
  }

  // Configurar los enlaces de herramientas
  const toolLinks = document.querySelectorAll('.tool-link');
  toolLinks.forEach(link => {
    link.addEventListener('click', handleToolClick);
  });
}
