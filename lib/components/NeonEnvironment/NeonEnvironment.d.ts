import { AuthSilentType, Undef } from '../../types/core';
export declare const DEFAULT_API_HOST = "https://data.neonscience.org";
export declare const DEFAULT_WEB_HOST = "https://www.neonscience.org";
interface IHostRegexService {
    getApiHostRegex: () => RegExp;
    getWebHostRegex: () => RegExp;
}
export declare const HostRegexService: IHostRegexService;
export declare const requiredEnvironmentVars: string[];
export declare const optionalEnvironmentVars: string[];
export interface NeonServerData {
    NeonPublicAPIHost: Undef<string>;
    NeonWebHost: Undef<string>;
    NeonPublicAPITokenHeader: Undef<string>;
    NeonPublicAPIToken: Undef<string>;
    NeonAuthSilentType: Undef<string>;
}
export interface INeonEnvironment {
    isValid: boolean;
    isDevEnv: boolean;
    isProdEnv: boolean;
    useGraphql: boolean;
    showAopViewer: boolean;
    authDisableWs: boolean;
    enableGlobalSignInState: boolean;
    fetchDrupalAssets: boolean;
    getRootApiPath: () => string;
    getRootGraphqlPath: () => string;
    getRootJsonLdPath: () => string;
    getRootAuthApiPath: () => string;
    getRootAuth0ApiPath: () => string;
    getRootDownloadApiPath: () => string;
    getApiPath: Record<string, () => string>;
    getApiLdPath: Record<string, () => string>;
    getAuthApiPath: Record<string, () => string>;
    getDownloadApiPath: Record<string, () => string>;
    getDataProductTaxonTypesPath: () => string;
    getTaxonTypeDataProductsPath: () => string;
    getAuthPath: Record<string, () => string>;
    authTopics: Record<string, () => string>;
    getVisusProductsBaseUrl: () => Undef<string>;
    getVisusIframeBaseUrl: () => Undef<string>;
    getRouterBasePath: () => string;
    getRouterBaseHomePath: () => string;
    getApiHostOverride: () => string;
    getWebHostOverride: () => string;
    getWsHostOverride: () => string;
    route: Record<string, (p?: string) => string>;
    getNeonServerData: () => NeonServerData | null;
    getNeonServerDataWebHost: () => string | null;
    getNeonServerDataApiHost: () => string | null;
    getWebHost: () => string;
    getApiHost: () => string;
    getWebSocketHost: () => string;
    isApiHostValid: (host: string) => boolean;
    isWebHostValid: (host: string) => boolean;
    getApiTokenHeader: () => string;
    getApiToken: () => string;
    getAuthSilentType: () => AuthSilentType;
    getFullApiPath: (path: string) => string;
    getFullJsonLdApiPath: (path: string) => string;
    getFullAuthApiPath: (path: string, useWs: boolean) => string;
    getFullGraphqlPath: () => string;
    getFullDownloadApiPath: (path: string) => string;
    getFullAuthPath: (path: string) => string;
    requireCors: () => boolean;
}
declare const NeonEnvironment: INeonEnvironment;
export default NeonEnvironment;
