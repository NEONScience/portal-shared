/* eslint-disable no-underscore-dangle */
import React from 'react';
import PropTypes from 'prop-types';

import Typography from '@material-ui/core/Typography';

import tinycolor from 'tinycolor2';

import 'leaflet/dist/leaflet.css';
import {
  FeatureGroup,
  Marker,
  Polygon,
  Popup,
  Rectangle,
} from 'react-leaflet';

import SiteMapContext from '../SiteMapContext';
import { FEATURES, FEATURE_TYPES, KM2_TO_ACRES } from '../SiteMapUtils';

// Convert latitude, longitude, and plotSize (in square meters) to an array of two points
// representing diagonally opposite corners of a rectangle. Use a fixed earth radius in meters
// because our centers are all far enough from the poles and our distances small enough that
// the error is negligible (max plot size used for this is 500m x 500m)
const EARTH_RADIUS = 6378000;
const getBounds = (lat, lon, area) => {
  const offsetMeters = (area ** 0.5) / 2;
  const dLat = (offsetMeters / EARTH_RADIUS) * (180 / Math.PI);
  const dLon = (offsetMeters / EARTH_RADIUS) * (180 / Math.PI) / Math.cos(lat * Math.PI / 180);
  return [
    [lat - dLat, lon - dLon],
    [lat + dLat, lon + dLon],
  ];
};

const SiteBasedFeature = (props) => {
  const {
    classes,
    featureKey,
  } = props;

  const {
    type: featureType,
    style: featureStyle = {},
    iconSvg,
    minPolygonZoom,
  } = FEATURES[featureKey];

  /**
     Extract feature data from SiteMapContext state
  */
  const [state] = SiteMapContext.useSiteMapContext();
  const {
    neonContextHydrated,
    map: { zoom },
    featureData: {
      [featureType]: {
        [featureKey]: featureData,
      },
    },
  } = state;
  if (!neonContextHydrated || !Object.keys(featureData)) { return null; }

  /**
     Render - Popups
  */
  const renderPopupFunctions = {
    AQUATIC_REACHES: (siteCode) => {
      const { areaKm2 } = featureData[siteCode].properties;
      const areaAcres = KM2_TO_ACRES * areaKm2;
      return (
        <Popup className={classes.popup} autoPan>
          <Typography variant="h6" gutterBottom>
            {`${siteCode} Aquatic Reach`}
          </Typography>
          <Typography variant="body1">
            {`Area: ${areaKm2.toFixed(2)} km2 (${areaAcres.toFixed(2)} acres)`}
          </Typography>
        </Popup>
      );
    },
    DISTRIBUTED_MAMMAL_GRIDS: (siteCode, location) => (
      <Popup className={classes.popup} autoPan>
        <Typography variant="h6" gutterBottom>
          {`${siteCode} Distributed Mammal Grid ${location}`}
        </Typography>
      </Popup>
    ),
    DISTRIBUTED_TICK_PLOTS: (siteCode, location) => (
      <Popup className={classes.popup} autoPan>
        <Typography variant="h6" gutterBottom>
          {`${siteCode} Distributed Tick Plot ${location}`}
        </Typography>
      </Popup>
    ),
    FLIGHT_BOX_BOUNDARIES: siteCode => (
      <Popup className={classes.popup} autoPan>
        <Typography variant="h6" gutterBottom>
          {`${siteCode} AOP Flight Box`}
        </Typography>
      </Popup>
    ),
    SAMPLING_BOUNDARIES: (siteCode) => {
      const { areaKm2 } = featureData[siteCode].properties;
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
    },
    TOWER_AIRSHEDS: siteCode => (
      <Popup className={classes.popup} autoPan>
        <Typography variant="h6" gutterBottom>
          {`${siteCode} Tower Airshed Boundary`}
        </Typography>
      </Popup>
    ),
    TOWERS: siteCode => (
      <Popup className={classes.popup} autoPan>
        <Typography variant="h6" gutterBottom>
          {`${siteCode} Tower`}
        </Typography>
      </Popup>
    ),
    WATERSHED_BOUNDARIES: (siteCode) => {
      const { areaKm2 } = featureData[siteCode].properties;
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
    },
  };
  const renderPopup = (siteCode, location = null) => {
    if (
      typeof renderPopupFunctions[featureKey] !== 'function'
        || !featureData[siteCode]
        || (location !== null && !featureData[siteCode][location])
    ) { return null; }
    return renderPopupFunctions[featureKey](siteCode, location);
  };

  /**
     Render a single shape (marker, rectangle, or polygon)
  */
  const hoverColor = `#${tinycolor(featureStyle.color || '#666666').lighten(10).toHex()}`;
  const polygonProps = {
    ...featureStyle,
    onMouseOver: (e) => {
      e.target._path.setAttribute('stroke', hoverColor);
      e.target._path.setAttribute('fill', hoverColor);
    },
    onMouseOut: (e) => {
      e.target._path.setAttribute('stroke', featureStyle.color);
      e.target._path.setAttribute('fill', featureStyle.color);
    },
  };
  const renderShape = (siteCode, location = null) => {
    const shapeData = location && featureData[siteCode][location]
      ? featureData[siteCode][location]
      : featureData[siteCode];
    const key = location ? `${siteCode} - ${location}` : siteCode;
    const renderedPopup = location ? renderPopup(siteCode, location) : renderPopup(siteCode);
    const shapeKeys = Object.keys(shapeData);
    let shape = null;
    if (shapeKeys.includes('geometry')) {
      shape = 'Polygon';
    } else if (shapeKeys.includes('latitude') && shapeKeys.includes('longitude')) {
      shape = 'Marker';
      // Some features prefer to render as a marker icon until a high enough zoom level
      if (shapeKeys.includes('plotSize') && iconSvg && minPolygonZoom && minPolygonZoom >= zoom) {
        shape = 'Rectangle';
      }
    }
    switch (shape) {
      case 'Marker':
        return (
          <Marker
            key={key}
            position={[shapeData.latitude, shapeData.longitude]}
            icon={state.map.zoomedIcons.PLACEHOLDER}
          >
            {renderedPopup}
          </Marker>
        );
      case 'Rectangle':
        return (
          <Rectangle
            key={key}
            bounds={getBounds(shapeData.latitude, shapeData.longitude, shapeData.plotSize)}
            {...polygonProps}
          >
            {renderedPopup}
          </Rectangle>
        );
      case 'Polygon':
        return (
          <Polygon
            key={key}
            positions={shapeData.geometry.coordinates || []}
            {...polygonProps}
          >
            {renderedPopup}
          </Polygon>
        );
      default:
        return null;
    }
  };

  /**
     Main Render
  */
  return (
    <FeatureGroup>
      {Object.keys(featureData).flatMap((siteCode) => {
        if (featureType === FEATURE_TYPES.LOCATIONS) {
          return Object.keys(featureData[siteCode]).map(loc => renderShape(siteCode, loc));
        }
        return renderShape(siteCode);
      })}
    </FeatureGroup>
  );
};

SiteBasedFeature.propTypes = {
  classes: PropTypes.objectOf(PropTypes.string).isRequired,
  featureKey: PropTypes.oneOf(Object.keys(FEATURES)).isRequired,
};

export default SiteBasedFeature;
