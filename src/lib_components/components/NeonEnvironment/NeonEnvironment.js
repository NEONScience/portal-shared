/* eslint-disable no-restricted-globals */
import { AuthSilentType } from '../../types/core';

// Default hosts
const defaultHost = 'www.neonscience.org';
const defaultPublicApiHost = 'https://data.neonscience.org';
const validHostsRegex = new RegExp(/^(data|cert-data|int-data)\.neonscience\.org$/);

// Names of all environment variables that MUST be explicitly defined for the
// environment to be reported as "valid". These are evnironment variables
// that are expected to be referenced by all apps. Standard vars present in all
// node environments (e.g. PORT, NODE_ENV, etc.) are not listed here.
export const requiredEnvironmentVars = [
  'REACT_APP_NEON_API_HOST',
  'REACT_APP_NEON_API_NAME',
  'REACT_APP_NEON_API_VERSION',
  'REACT_APP_NEON_AUTH_API',
  'REACT_APP_NEON_AUTH_WS_API',
  'REACT_APP_NEON_AUTH_WS_TOPIC_AUTH0_API',
  'REACT_APP_NEON_AUTH_LOGIN',
  'REACT_APP_NEON_AUTH_LOGOUT',
  'REACT_APP_NEON_AUTH_USERINFO',
  'REACT_APP_NEON_PATH_MENU_API',
  'REACT_APP_NEON_PATH_PUBLIC_GRAPHQL',
  'REACT_APP_NEON_ROUTER_BASE',
  'REACT_APP_NEON_ROUTER_BASE_HOME',
  'REACT_APP_NEON_USE_GRAPHQL',
];

// Names of additional environment variables that may be referenced by
// this module depending on a given app's use case. Along with the above
// required list this makes a complete set of all environment variables
// this module will ever reference.
export const optionalEnvironmentVars = [
  'REACT_APP_NEON_PATH_LD_API',
  'REACT_APP_NEON_PATH_LD_REPO_API',
  'REACT_APP_NEON_PATH_AOP_DOWNLOAD_API',
  'REACT_APP_NEON_PATH_DATA_API',
  'REACT_APP_NEON_PATH_DOCUMENTS_API',
  'REACT_APP_NEON_PATH_DOWNLOAD_API',
  'REACT_APP_NEON_PATH_MANIFEST_API',
  'REACT_APP_NEON_PATH_PRODUCTS_API',
  'REACT_APP_NEON_PATH_PROTOTYPE_DATA_API',
  'REACT_APP_NEON_PATH_RELEASES_API',
  'REACT_APP_NEON_PATH_SITES_API',
  'REACT_APP_NEON_PATH_LOCATIONS_API',
  'REACT_APP_NEON_PATH_FILE_NAMING_CONVENTIONS',
  'REACT_APP_NEON_SHOW_AOP_VIEWER',
  'REACT_APP_NEON_VISUS_PRODUCTS_BASE_URL',
  'REACT_APP_NEON_VISUS_IFRAME_BASE_URL',
  'REACT_APP_NEON_HOST_OVERRIDE',
  'REACT_APP_NEON_WS_HOST_OVERRIDE',
  'REACT_APP_NEON_AUTH_DISABLE_WS',
  'REACT_APP_NEON_ROUTER_NEON_HOME',
  'REACT_APP_NEON_ROUTER_NEON_MYACCOUNT',
];

// Temporary paths that shouldn't need to propogate to environment files until made more permanent
const REACT_APP_NEON_PATH_ARCGIS_ASSETS_API = '/arcgis-assets';

const EnvType = {
  DEV: 'development',
  PROD: 'production',
};

const NeonEnvironment = {
  isValid: requiredEnvironmentVars.every((envVar) => typeof process.env[envVar] !== 'undefined'),
  isDevEnv: process.env.NODE_ENV === EnvType.DEV,
  isProdEnv: process.env.NODE_ENV === EnvType.PROD,
  useGraphql: process.env.REACT_APP_NEON_USE_GRAPHQL === 'true',
  showAopViewer: process.env.REACT_APP_NEON_SHOW_AOP_VIEWER === 'true',
  authDisableWs: process.env.REACT_APP_NEON_AUTH_DISABLE_WS === 'true',

  getApiName: () => process.env.REACT_APP_NEON_API_NAME,
  getApiVersion: () => process.env.REACT_APP_NEON_API_VERSION,
  getRootApiPath: () => `/${process.env.REACT_APP_NEON_API_NAME}/${process.env.REACT_APP_NEON_API_VERSION}`,
  getRootGraphqlPath: () => process.env.REACT_APP_NEON_PATH_PUBLIC_GRAPHQL,
  getRootJsonLdPath: () => `${NeonEnvironment.getRootApiPath()}${process.env.REACT_APP_NEON_PATH_LD_API}`,
  getRootAuthApiPath: () => process.env.REACT_APP_NEON_AUTH_API,

  getApiPath: {
    aopDownload: () => process.env.REACT_APP_NEON_PATH_AOP_DOWNLOAD_API,
    data: () => process.env.REACT_APP_NEON_PATH_DATA_API,
    prototype: () => process.env.REACT_APP_NEON_PATH_PROTOTYPE_DATA_API,
    documents: () => process.env.REACT_APP_NEON_PATH_DOCUMENTS_API,
    download: () => process.env.REACT_APP_NEON_PATH_DOWNLOAD_API,
    manifest: () => process.env.REACT_APP_NEON_PATH_MANIFEST_API,
    menu: () => process.env.REACT_APP_NEON_PATH_MENU_API,
    products: () => process.env.REACT_APP_NEON_PATH_PRODUCTS_API,
    releases: () => process.env.REACT_APP_NEON_PATH_RELEASES_API,
    sites: () => process.env.REACT_APP_NEON_PATH_SITES_API,
    locations: () => process.env.REACT_APP_NEON_PATH_LOCATIONS_API,
    arcgisAssets: () => REACT_APP_NEON_PATH_ARCGIS_ASSETS_API,
  },

  getApiLdPath: {
    repo: () => process.env.REACT_APP_NEON_PATH_LD_REPO_API,
  },

  getPagePath: {
    fileNamingConventions: () => process.env.REACT_APP_NEON_PATH_FILE_NAMING_CONVENTIONS,
  },

  getAuthPath: {
    login: () => process.env.REACT_APP_NEON_AUTH_LOGIN,
    logout: () => process.env.REACT_APP_NEON_AUTH_LOGOUT,
    userInfo: () => process.env.REACT_APP_NEON_AUTH_USERINFO,
    seamlessLogin: () => `${NeonEnvironment.getAuthPath.login()}?seamless=true`,
    silentLogin: () => `${NeonEnvironment.getAuthPath.login()}?silent=true`,
    silentLogout: () => `${NeonEnvironment.getAuthPath.logout()}?silent=true`,
  },
  getAuthApiPath: {
    ws: () => process.env.REACT_APP_NEON_AUTH_WS_API,
  },
  authTopics: {
    getAuth0: () => process.env.REACT_APP_NEON_AUTH_WS_TOPIC_AUTH0_API,
  },

  getVisusProductsBaseUrl: () => process.env.REACT_APP_NEON_VISUS_PRODUCTS_BASE_URL,
  getVisusIframeBaseUrl: () => process.env.REACT_APP_NEON_VISUS_IFRAME_BASE_URL,

  getRouterBasePath: () => process.env.REACT_APP_NEON_ROUTER_BASE,
  getRouterBaseHomePath: () => process.env.REACT_APP_NEON_ROUTER_BASE_HOME,
  getHostOverride: () => process.env.REACT_APP_NEON_HOST_OVERRIDE,
  getWsHostOverride: () => process.env.REACT_APP_NEON_WS_HOST_OVERRIDE,

  route: {
    home: () => process.env.REACT_APP_NEON_ROUTER_NEON_HOME || '/home',
    account: () => process.env.REACT_APP_NEON_ROUTER_NEON_MYACCOUNT || '/myaccount',
    getFullRoute: (route = '') => `${NeonEnvironment.getRouterBasePath()}${route}`,
    buildRouteFromHost: (route = '') => (
      `${NeonEnvironment.getHost()}${NeonEnvironment.route.getFullRoute(route)}`
    ),
    buildHomeRoute: () => (
      `${NeonEnvironment.getHost()}${NeonEnvironment.route.home()}`
    ),
    buildAccountRoute: () => (
      `${NeonEnvironment.getHost()}${NeonEnvironment.route.account()}`
    ),
  },

  /**
   * Gets the window.NEON_SERVER_DATA injected from the server environment.
   * @return {Object} The structured server data object
   */
  getNeonServerData: () => {
    /* eslint-disable */
    if (typeof WorkerGlobalScope === 'function') {
      return self.NEON_SERVER_DATA ? self.NEON_SERVER_DATA : null;
    }
    /* eslint-enable */
    if (typeof window === 'object') {
      return window.NEON_SERVER_DATA ? window.NEON_SERVER_DATA : null;
    }
    return null;
  },

  getHost: () => {
    if ((NeonEnvironment.isDevEnv)
      && NeonEnvironment.getHostOverride()) {
      return NeonEnvironment.getHostOverride();
    }
    /* eslint-disable */
    if (typeof WorkerGlobalScope === 'function' && typeof self.location === 'object') {
      if (NeonEnvironment.isHostValid(self.location.host)) {
        return `${self.location.protocol}//${self.location.host}`;
      }
      return `${self.location.protocol}//${defaultHost}`;
    }
    /* eslint-enable */
    if (NeonEnvironment.isHostValid(window.location.host)) {
      return `${window.location.protocol}//${window.location.host}`;
    }
    return `${window.location.protocol}//${defaultHost}`;
  },

  getWebSocketHost: () => {
    if (NeonEnvironment.getApiName) {
      return NeonEnvironment.getApiName;
    }
    if (
      (NeonEnvironment.isDevEnv)
      && NeonEnvironment.getWsHostOverride()) {
      return NeonEnvironment.getWsHostOverride();
    }
    return window.location.protocol.startsWith('https')
      ? `wss://${window.location.host}`
      : `ws://${window.location.host}`;
  },

  /**
   * Valid host names include localhost and known NEON hosts
   * @returns boolean, true if valid
   */
  isHostValid: (host) => {
    if ((typeof host !== 'string') || (host.length <= 0)) {
      return false;
    }
    if (host.match('localhost') !== null) {
      return true;
    }
    if (!validHostsRegex) return false;
    const matches = validHostsRegex.exec(host);
    if (!matches) return false;
    return (matches.length > 0);
  },

  /**
  * Gets the Neon public API host
  * @return {string} The API host
  */
  getPublicApiHost: () => {
    const serverData = NeonEnvironment.getNeonServerData();
    if (serverData && (typeof serverData.NeonPublicAPIHost === 'string')) {
      const apiHost = serverData.NeonPublicAPIHost;
      if (NeonEnvironment.isHostValid(new URL(apiHost).hostname)) {
        return apiHost;
      }
    }
    return defaultPublicApiHost;
  },

  /**
   * Gets the API token header name
   * @return {string} The API token header name
   */
  getApiTokenHeader: () => {
    const serverData = NeonEnvironment.getNeonServerData();
    if (serverData && (typeof serverData.NeonPublicAPITokenHeader === 'string')) {
      return serverData.NeonPublicAPITokenHeader;
    }
    return '';
  },

  /**
   * Gets the API token value
   * @return {string} The API token value
   */
  getApiToken: () => {
    const serverData = NeonEnvironment.getNeonServerData();
    if (serverData && (typeof serverData.NeonPublicAPIToken === 'string')) {
      return serverData.NeonPublicAPIToken;
    }
    return '';
  },

  /**
   * Determines if the silent authentication process should be prevented
   * based on environment or browser as external dependencies are required.
   * @return {AuthSilentType}
   */
  getAuthSilentType: () => {
    const serverData = NeonEnvironment.getNeonServerData();
    if (serverData
      && (typeof serverData.NeonAuthSilentType === 'string')
      && (serverData.NeonAuthSilentType.length > 0)) {
      return serverData.NeonAuthSilentType;
    }
    return AuthSilentType.DISABLED;
  },

  getFullApiPath: (path = '') => {
    const host = NeonEnvironment.getPublicApiHost();
    // Root path (e.g. '/api/v0') doesn't apply to legacy download and manifest related paths.
    const root = ['aopDownload', 'download', 'manifest'].includes(path) ? '' : NeonEnvironment.getRootApiPath();
    return NeonEnvironment.getApiPath[path]
      ? `${host}${root}${NeonEnvironment.getApiPath[path]()}`
      : `${host}${root}`;
  },

  getFullJsonLdApiPath: (path = '') => {
    const host = NeonEnvironment.getHost();
    const root = NeonEnvironment.getRootJsonLdPath();
    let appliedPath = '';
    if (['products', 'prototype'].includes(path)) {
      appliedPath = NeonEnvironment.getApiPath[path]();
    } else if (typeof NeonEnvironment.getApiLdPath[path] === 'function') {
      appliedPath = NeonEnvironment.getApiLdPath[path]();
    }
    return appliedPath
      ? `${host}${root}${appliedPath}`
      : `${host}${root}`;
  },

  getFullPagePath: (path = '') => {
    const host = NeonEnvironment.getHost();
    return NeonEnvironment.getPagePath[path]
      ? `${host}${NeonEnvironment.getPagePath[path]()}`
      : `${host}`;
  },

  /**
   * Creates the full auth path from the host and path.
   * Auth path refers to /auth0.
   * @param {string} path - The path to build from
   */
  getFullAuthPath: (path = '') => {
    const host = NeonEnvironment.getHost();
    return NeonEnvironment.getAuthPath[path]
      ? `${host}${NeonEnvironment.getAuthPath[path]()}`
      : `${host}`;
  },

  /**
   * Creates the full auth API path from the host and path.
   * Auth API path refers to /api/auth/v0.
   * @param {string} path - The path to build from
   * @param {boolean} useWs - Option to build a websocket path
   */
  getFullAuthApiPath: (path = '', useWs = false) => {
    const host = useWs
      ? NeonEnvironment.getWebSocketHost()
      : NeonEnvironment.getHost();
    const root = NeonEnvironment.getRootAuthApiPath();
    const appliedPath = Object.keys(NeonEnvironment.getAuthApiPath).includes(path)
      ? NeonEnvironment.getAuthApiPath[path]()
      : '';
    return appliedPath
      ? `${host}${root}${appliedPath}`
      : `${host}${root}`;
  },

  getFullGraphqlPath: () => {
    const host = NeonEnvironment.getHost();
    return `${host}${NeonEnvironment.getRootGraphqlPath()}`;
  },
};

Object.freeze(NeonEnvironment);

export default NeonEnvironment;
