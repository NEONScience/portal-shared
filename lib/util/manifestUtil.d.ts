import { Nullable } from '../types/core';
import { ManifestConfig, ManifestRequest, ManifestSelection } from '../types/manifest';
export declare const buildManifestConfig: (selection: ManifestSelection, defaultPackageType?: string, isAop?: boolean) => ManifestConfig;
export declare const buildManifestRequestUrl: (config: ManifestConfig, useBody?: boolean) => string;
export declare const buildManifestRequestBody: (config: ManifestConfig) => ManifestRequest;
export declare const buildS3FilesRequestUrl: (productCode: string, site: string, yearMonth: string, release: Nullable<string>) => string;
export declare const downloadManifest: (manifest: ManifestRequest) => void;
export declare const downloadAopManifest: (config: ManifestConfig, s3Files: Record<string, unknown>, documentation?: string) => void;
export declare const MAX_POST_BODY_SIZE: number;
export declare const DOWNLOAD_SIZE_WARN = 42949672960;
export declare const formatBytes: (bytes: number) => string;
export declare const getSizeEstimateFromManifestResponse: (response: any) => any;
export declare const getSizeEstimateFromManifestRollupResponse: (response: any) => any;
export default buildManifestRequestUrl;
