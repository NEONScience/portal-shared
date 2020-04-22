import React from 'react';
import PropTypes from 'prop-types';

import tinycolor from 'tinycolor2';

import Typography from '@material-ui/core/Typography';

import 'leaflet/dist/leaflet.css';
import { FeatureGroup, Polygon, Popup } from 'react-leaflet';

import SiteMapContext from '../SiteMapContext';
import {
  FEATURES,
  FEATURE_TYPES,
  BOUNDARY_COLORS,
  KM2_TO_ACRES,
} from '../SiteMapUtils';

/**
   Main Component
*/
const SamplingBoundaries = (props) => {
  const { classes } = props;

  // State and Dispatch from SiteMapContext
  const [state] = SiteMapContext.useSiteMapContext();
  const { neonContextHydrated } = state;

  // Don't render if not all loaded
  if (!neonContextHydrated) { return null; }

  // Extract feature data
  const {
    [FEATURES.SAMPLING_BOUNDARIES.KEY]: featureData,
  } = state.featureData[FEATURE_TYPES.BOUNDARIES];

  /**
     Render Method: Popup
  */
  const renderPopup = (siteCode) => {
    if (!featureData[siteCode]) { return null; }
    const samplingBoundary = featureData[siteCode];
    const { areaKm2 } = samplingBoundary.properties;
    const areaAcres = KM2_TO_ACRES * areaKm2;
    return (
      <Popup className={classes.popup} autoPan>
        <Typography variant="h6" gutterBottom>
          {`${siteCode} Sampling Boundary`}
        </Typography>
        <Typography variant="body1">
          {`Area: ${areaKm2.toFixed(2)} km2 (${areaAcres.toFixed(2)} acres)`}
        </Typography>
      </Popup>
    );
  };

  /**
     Main Render
  */
  return (
    <FeatureGroup>
      {Object.keys(featureData).map((siteCode) => {
        const samplingBoundary = featureData[siteCode];
        const featureColor = BOUNDARY_COLORS[FEATURES.SAMPLING_BOUNDARIES.KEY];
        const hoverColor = `#${tinycolor(featureColor).lighten(10).toHex()}`;
        /* eslint-disable no-underscore-dangle */
        const interactionProps = {
          onMouseOver: (e) => {
            e.target._path.setAttribute('stroke', hoverColor);
            e.target._path.setAttribute('fill', hoverColor);
          },
          onMouseOut: (e) => {
            e.target._path.setAttribute('stroke', featureColor);
            e.target._path.setAttribute('fill', featureColor);
          },
        };
        /* eslint-enable no-underscore-dangle */
        return (
          <Polygon
            key={siteCode}
            color={featureColor}
            positions={samplingBoundary.geometry.coordinates}
            {...interactionProps}
          >
            {renderPopup(siteCode)}
          </Polygon>
        );
      })}
    </FeatureGroup>
  );
};

SamplingBoundaries.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default SamplingBoundaries;
