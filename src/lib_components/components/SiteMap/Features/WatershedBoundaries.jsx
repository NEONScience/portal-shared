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
const WatershedBoundaries = (props) => {
  const { classes } = props;

  const { KEY: featureKey } = FEATURES.WATERSHED_BOUNDARIES;

  // Extract feature data from SiteMapContext State
  const [state] = SiteMapContext.useSiteMapContext();
  const {
    neonContextHydrated,
    featureData: {
      [FEATURE_TYPES.BOUNDARIES]: {
        [featureKey]: featureData,
      },
    },
  } = state;
  if (!neonContextHydrated || !Object.keys(featureData)) { return null; }

  /**
     Render Method: Popup
  */
  const renderPopup = (siteCode) => {
    if (!featureData[siteCode]) { return null; }
    const watershedBoundary = featureData[siteCode];
    const { areaKm2 } = watershedBoundary.properties;
    let area = null;
    if (areaKm2) {
      const areaAcres = KM2_TO_ACRES * areaKm2;
      area = (
        <Typography variant="body1">
          {`Area: ${areaKm2.toFixed(2)} km2 (${areaAcres.toFixed(2)} acres)`}
        </Typography>
      );
    }
    return (
      <Popup className={classes.popup} autoPan>
        <Typography variant="h6" gutterBottom>
          {`${siteCode} Watershed Boundary`}
        </Typography>
        {area}
      </Popup>
    );
  };

  /**
     Main Render
  */
  return (
    <FeatureGroup>
      {Object.keys(featureData).map((siteCode) => {
        const watershedBoundary = featureData[siteCode];
        const featureColor = BOUNDARY_COLORS[featureKey];
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
            positions={watershedBoundary.geometry.coordinates}
            {...interactionProps}
          >
            {renderPopup(siteCode)}
          </Polygon>
        );
      })}
    </FeatureGroup>
  );
};

WatershedBoundaries.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default WatershedBoundaries;
