import { AuthSilentType, Undef } from '../../types/core';
export declare const DEFAULT_API_HOST = "https://data.neonscience.org";
export declare const DEFAULT_WEB_HOST = "https://www.neonscience.org";
export declare const API_HOST_REGEX: RegExp;
export declare const WEB_HOST_REGEX: RegExp;
export declare const DATA_CITE_API_HOST_REGEX: RegExp;
export declare const requiredEnvironmentVars: string[];
export declare const optionalEnvironmentVars: string[];
export interface NeonServerData {
    NeonPublicAPIHost: Undef<string>;
    NeonWebHost: Undef<string>;
    NeonPublicAPITokenHeader: Undef<string>;
    NeonPublicAPIToken: Undef<string>;
    NeonAuthSilentType: Undef<string>;
    DataCiteAPIHost: Undef<string>;
}
export interface INeonEnvironment {
    isValid: boolean;
    isDevEnv: boolean;
    isProdEnv: boolean;
    useGraphql: boolean;
    showAopViewer: boolean;
    authDisableWs: boolean;
    getApiName: () => Undef<string>;
    getApiVersion: () => Undef<string>;
    getRootApiPath: () => string;
    getRootGraphqlPath: () => Undef<string>;
    getRootJsonLdPath: () => string;
    getRootAuthApiPath: () => Undef<string>;
    getApiPath: Record<string, () => string>;
    getApiLdPath: Record<string, () => string>;
    getAuthApiPath: Record<string, () => string>;
    getAuthPath: Record<string, () => string>;
    authTopics: Record<string, () => string>;
    getVisusProductsBaseUrl: () => Undef<string>;
    getVisusIframeBaseUrl: () => Undef<string>;
    getDataCiteApiHostDefault: () => string;
    getRouterBasePath: () => string;
    getRouterBaseHomePath: () => string;
    getApiHostOverride: () => string;
    getWebHostOverride: () => string;
    getWsHostOverride: () => string;
    getDataCiteApiHostOverride: () => Undef<string>;
    route: Record<string, (p?: string) => string>;
    getNeonServerData: () => NeonServerData | null;
    getNeonServerDataWebHost: () => string | null;
    getNeonServerDataApiHost: () => string | null;
    getNeonServerDataDataCiteApiHost: () => string | null;
    getWebHost: () => string;
    getApiHost: () => string;
    getWebSocketHost: () => string;
    getDataCiteApiHost: () => string;
    isApiHostValid: (host: string) => boolean;
    isWebHostValid: (host: string) => boolean;
    isDataCiteApiHostValid: (host: string) => boolean;
    getApiTokenHeader: () => string;
    getApiToken: () => string;
    getAuthSilentType: () => AuthSilentType;
    getFullApiPath: (path: string) => string;
    getFullJsonLdApiPath: (path: string) => string;
    getFullAuthApiPath: (path: string, useWs: boolean) => string;
    getFullGraphqlPath: () => string;
    getFullAuthPath: (path: string) => string;
}
declare const NeonEnvironment: INeonEnvironment;
export default NeonEnvironment;
