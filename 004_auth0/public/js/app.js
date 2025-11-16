// The Auth0 client, initialized in configureClient()
let auth0Client = null;

// Flag global para saber si estamos en desarrollo. Se decide tras leer /auth_config.json
if (typeof window.IS_DEV === 'undefined') {
  window.IS_DEV = false; // valor provisional hasta recibir configuración
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

  // Actualizar flag de entorno según configuración recibida del backend
  if (typeof config.environment === 'string') {
    window.IS_DEV = config.environment !== 'production';
  }
};

/**
 * Comprueba si el usuario está autenticado. Si lo está, ejecuta la función fn.
 * En caso contrario inicia el login y redirige.
 */
const requireAuth = async (fn, targetUrl) => {
  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    return fn();
  }

  return login(targetUrl);
};

/**
 * Comprueba el estado de autenticación y lo muestra por consola, sin redireccionar.
 */
const checkAuthStatus = async () => {
  if (!auth0Client) {
    console.warn("Auth0 client not initialized yet.");
    return;
  }
  const isAuthenticated = await auth0Client.isAuthenticated();
  console.log(
    isAuthenticated
      ? "El usuario está autenticado"
      : "El usuario NO está autenticado"
  );
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


// Will run when page finishes loading
window.onload = async () => {
  await configureClient();

  // If unable to parse the history hash, default to the root URL
  if (!showContentFromUrl(window.location.pathname)) {
    showContentFromUrl("/");
    window.history.replaceState({ url: "/" }, {}, "/");
  }

  const bodyElement = document.getElementsByTagName("body")[0];

  // Listen out for clicks on any hyperlink that navigates to a #/ URL
  bodyElement.addEventListener("click", (e) => {
    if (isRouteLink(e.target)) {
      const url = e.target.getAttribute("href");

      if (showContentFromUrl(url)) {
        e.preventDefault();
        window.history.pushState({ url }, {}, url);
      }
    }
  });

  const isAuthenticated = await auth0Client.isAuthenticated();

  if (isAuthenticated) {
    logDev("> User is authenticated");
    // Si estamos en la página raíz, redirigimos directamente a tools.html
    if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
      window.location.replace("/tools.html");
      return;
    }
    window.history.replaceState({}, document.title, window.location.pathname);
    updateUI();
    return;
  }

  logDev("> User not authenticated");

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

      if (result.appState && result.appState.targetUrl) {
        showContentFromUrl(result.appState.targetUrl);
      }

      logDev("Logged in!");
      // Tras procesar callback redirigimos a tools si estamos en la raíz
      if (window.location.pathname === "/" || window.location.pathname === "/index.html") {
        window.location.replace("/tools.html");
        return;
      }
    } catch (err) {
      console.error("Error parsing redirect:", err);
    }

    window.history.replaceState({}, document.title, "/");
  }

  updateUI();
};
