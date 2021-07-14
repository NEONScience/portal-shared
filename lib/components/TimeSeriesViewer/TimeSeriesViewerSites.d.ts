/**
   Primary Component
*/
declare function TimeSeriesViewerSites(props: any): JSX.Element;
declare namespace TimeSeriesViewerSites {
    export { TabComponentPropTypes as propTypes };
}
export default TimeSeriesViewerSites;
export function getTestableItems(): {
    ucWord?: undefined;
    PositionHistoryButton?: undefined;
    PositionDetail?: undefined;
    SelectedPosition?: undefined;
    SelectPositionsButton?: undefined;
    SitesControl?: undefined;
    SiteOption?: undefined;
    SelectedSite?: undefined;
} | {
    ucWord: (word: any) => string;
    PositionHistoryButton: typeof PositionHistoryButton;
    PositionDetail: typeof PositionDetail;
    SelectedPosition: typeof SelectedPosition;
    SelectPositionsButton: typeof SelectPositionsButton;
    SitesControl: typeof SitesControl;
    SiteOption: typeof SiteOption;
    SelectedSite: typeof SelectedSite;
};
import { TabComponentPropTypes } from "./TimeSeriesViewerContext";
/**
   PositionHistoryButton - button that opens a dialog to show all history for a given position
*/
declare function PositionHistoryButton(props: any): JSX.Element;
declare namespace PositionHistoryButton {
    export namespace propTypes {
        export const siteCode: PropTypes.Validator<string>;
        export const position: PropTypes.Validator<string>;
        export const history: PropTypes.Validator<(PropTypes.InferProps<{
            'HOR.VER': PropTypes.Validator<string>;
            azimuth: PropTypes.Validator<string>;
            pitch: PropTypes.Validator<string>;
            roll: PropTypes.Validator<string>;
            start: PropTypes.Requireable<string>;
            end: PropTypes.Requireable<string>;
            xOffset: PropTypes.Validator<string>;
            yOffset: PropTypes.Validator<string>;
            zOffset: PropTypes.Validator<string>;
            referenceStart: PropTypes.Requireable<string>;
            referenceEnd: PropTypes.Requireable<string>;
            referenceLatitude: PropTypes.Validator<string>;
            referenceLongitude: PropTypes.Validator<string>;
            referenceElevation: PropTypes.Validator<string>;
        }> | null | undefined)[]>;
    }
}
/**
   PositionDetail - Component to display neatly-formatted position content
*/
declare function PositionDetail(props: any): JSX.Element;
declare namespace PositionDetail {
    export namespace propTypes_1 {
        const siteCode_1: PropTypes.Validator<string>;
        export { siteCode_1 as siteCode };
        const position_1: PropTypes.Validator<string>;
        export { position_1 as position };
        export const wide: PropTypes.Requireable<boolean>;
    }
    export { propTypes_1 as propTypes };
    export namespace defaultProps {
        const wide_1: boolean;
        export { wide_1 as wide };
    }
}
/**
   Selected Position - Component for a single deletable position paper to show within a SelectedSite
*/
declare function SelectedPosition(props: any): JSX.Element;
declare namespace SelectedPosition {
    export namespace propTypes_2 {
        const siteCode_2: PropTypes.Validator<string>;
        export { siteCode_2 as siteCode };
        const position_2: PropTypes.Validator<string>;
        export { position_2 as position };
        export const disabled: PropTypes.Requireable<boolean>;
    }
    export { propTypes_2 as propTypes };
    export namespace defaultProps_1 {
        const disabled_1: boolean;
        export { disabled_1 as disabled };
    }
    export { defaultProps_1 as defaultProps };
}
/**
   SelectPositionsButton - button that opens a dialog for position selection
*/
declare function SelectPositionsButton(props: any): JSX.Element;
declare namespace SelectPositionsButton {
    export namespace propTypes_3 {
        export const selectedSite: PropTypes.Validator<PropTypes.InferProps<{
            siteCode: PropTypes.Validator<string>;
            positions: PropTypes.Validator<(string | null | undefined)[]>;
        }>>;
    }
    export { propTypes_3 as propTypes };
}
/**
   SitesControl - Component for the top-level Sites search field
*/
declare function SitesControl(props: any): JSX.Element;
declare namespace SitesControl {
    export { ControlPropTypes as propTypes };
}
/**
   SiteOption - Component for a single site as it appears in the drop-down menu
*/
declare function SiteOption(props: any): JSX.Element;
declare namespace SiteOption {
    export { OptionPropTypes as propTypes };
    export { OptionDefaultProps as defaultProps };
}
/**
   Selected Site - Component for a single deletable site paper to show below the search box
*/
declare function SelectedSite(props: any): JSX.Element;
declare namespace SelectedSite {
    const propTypes_4: {
        setSelectedTab: PropTypes.Validator<(...args: any[]) => any>;
        TAB_IDS: PropTypes.Validator<{
            [x: string]: string | null | undefined;
        }>;
        site: PropTypes.Validator<PropTypes.InferProps<{
            siteCode: PropTypes.Validator<string>;
            positions: PropTypes.Validator<(string | null | undefined)[]>;
        }>>;
        disabled: PropTypes.Requireable<boolean>;
    };
    export { propTypes_4 as propTypes };
    export namespace defaultProps_2 {
        const disabled_2: boolean;
        export { disabled_2 as disabled };
    }
    export { defaultProps_2 as defaultProps };
}
import PropTypes from "prop-types";
declare namespace ControlPropTypes {
    export const children: PropTypes.Validator<string | number | boolean | {} | PropTypes.ReactElementLike | PropTypes.ReactNodeArray>;
    export const innerProps: PropTypes.Validator<PropTypes.InferProps<{
        onMouseDown: PropTypes.Validator<(...args: any[]) => any>;
    }>>;
    export const innerRef: PropTypes.Validator<((...args: any[]) => any) | PropTypes.InferProps<{
        current: PropTypes.Validator<any>;
    }>>;
    export const selectProps: PropTypes.Validator<object>;
}
declare namespace OptionPropTypes {
    const children_1: PropTypes.Requireable<PropTypes.ReactNodeLike>;
    export { children_1 as children };
    const innerProps_1: PropTypes.Requireable<PropTypes.InferProps<{
        id: PropTypes.Validator<string>;
        key: PropTypes.Requireable<string>;
        onClick: PropTypes.Requireable<(...args: any[]) => any>;
        onMouseMove: PropTypes.Requireable<(...args: any[]) => any>;
        onMouseOver: PropTypes.Requireable<(...args: any[]) => any>;
        tabIndex: PropTypes.Validator<number>;
    }>>;
    export { innerProps_1 as innerProps };
    const innerRef_1: PropTypes.Requireable<((...args: any[]) => any) | PropTypes.InferProps<{
        current: PropTypes.Validator<any>;
    }>>;
    export { innerRef_1 as innerRef };
    export const isFocused: PropTypes.Validator<boolean>;
    export const isSelected: PropTypes.Validator<boolean>;
    export const isDisabled: PropTypes.Requireable<boolean>;
    export const data: PropTypes.Validator<object>;
}
declare namespace OptionDefaultProps {
    const children_2: null;
    export { children_2 as children };
    const innerProps_2: null;
    export { innerProps_2 as innerProps };
    const innerRef_2: null;
    export { innerRef_2 as innerRef };
    const isDisabled_1: boolean;
    export { isDisabled_1 as isDisabled };
}
