export default AvailabilityContext;
export function getTestableItems(): {
    DEFAULT_STATE?: undefined;
    calculateRows?: undefined;
    extractTables?: undefined;
    hydrateNeonContextData?: undefined;
    reducer?: undefined;
} | {
    DEFAULT_STATE: {
        sites: never[];
        tables: {};
        rows: {};
        rowTitles: {};
        rowLabels: never[];
        breakouts: never[];
        validBreakouts: string[];
        sortDirection: string;
        neonContextHydrated: boolean;
        reference: {
            sites: {};
            states: {};
            domains: {};
        };
    };
    calculateRows: (state: any) => any;
    extractTables: (state: any) => {};
    hydrateNeonContextData: (state: any, neonContextData: any) => any;
    reducer: (state: any, action: any) => any;
};
declare namespace AvailabilityContext {
    export { Provider };
    export { useAvailabilityState };
    export { SORT_DIRECTIONS };
}
/**
   Context Provider
*/
declare function Provider(props: any): JSX.Element;
declare namespace Provider {
    namespace propTypes {
        const sites: PropTypes.Requireable<(PropTypes.InferProps<{
            siteCode: PropTypes.Validator<string>;
            tables: PropTypes.Validator<(PropTypes.InferProps<{
                name: PropTypes.Validator<string>;
                description: PropTypes.Validator<string>;
                waitInterval: PropTypes.Validator<string>;
                months: PropTypes.Validator<{
                    [x: string]: string | null | undefined;
                }>;
            }> | null | undefined)[]>;
        }> | null | undefined)[]>;
        const children: PropTypes.Validator<string | number | boolean | {} | PropTypes.ReactElementLike | PropTypes.ReactNodeArray>;
    }
    namespace defaultProps {
        const sites_1: never[];
        export { sites_1 as sites };
    }
}
declare function useAvailabilityState(): any[] | {
    sites: never[];
    tables: {};
    rows: {};
    rowTitles: {};
    rowLabels: never[];
    breakouts: never[];
    validBreakouts: string[];
    sortDirection: string;
    neonContextHydrated: boolean;
    reference: {
        sites: {};
        states: {};
        domains: {};
    };
};
declare namespace SORT_DIRECTIONS {
    const ASC: string;
    const DESC: string;
}
import PropTypes from "prop-types";
