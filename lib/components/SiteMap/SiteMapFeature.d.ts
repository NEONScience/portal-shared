export default SiteMapFeature;
declare function SiteMapFeature(props: any): JSX.Element | null;
declare namespace SiteMapFeature {
    namespace propTypes {
        const mapRef: PropTypes.Validator<PropTypes.InferProps<{
            current: PropTypes.Requireable<any>;
        }>>;
        const featureKey: PropTypes.Validator<string>;
    }
}
import PropTypes from "prop-types";
