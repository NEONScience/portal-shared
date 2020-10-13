/* eslint-disable no-underscore-dangle */
import React, {
  useRef,
  useEffect,
  useLayoutEffect,
} from 'react';
import ReactDOMServer from 'react-dom/server';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import CircularProgress from '@material-ui/core/CircularProgress';
import IconButton from '@material-ui/core/IconButton';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import MapPanIcon from '@material-ui/icons/PanTool';
import MapAreaSelectIcon from '@material-ui/icons/CropFree';
import ObservatoryIcon from '@material-ui/icons/Public';

import 'leaflet/dist/leaflet.css';
import './SiteMap.css';

import {
  LayerGroup,
  Map,
  ScaleControl,
  TileLayer,
  WMSTileLayer,
} from 'react-leaflet';

import { ReactLeafletGroupedLayerControl } from 'react-leaflet-grouped-layer-control';

import Theme from '../Theme/Theme';

import SiteMapContext from './SiteMapContext';
import SiteMapFeature from './SiteMapFeature';
import {
  VIEWS,
  BASE_LAYERS,
  OVERLAYS,
  OVERLAY_GROUPS,
  MAP_ZOOM_RANGE,
  FEATURES,
  FEATURE_TYPES,
  FETCH_STATUS,
  MAP_MOUSE_MODES,
  UNSELECTABLE_MARKER_FILTER,
  deriveFullObservatoryZoomLevel,
} from './SiteMapUtils';

const useStyles = makeStyles(theme => ({
  map: {
    width: '100%',
    height: '0px', // Necessary to set a fixed aspect ratio from props (using paddingBottom)
    overflow: 'hidden',
    background: theme.palette.grey[50],
    '& div.rlglc-wrap': {
      boxShadow: 'unset',
      margin: '0px',
      left: '8px',
      top: '8px',
      '& .rlglc': {
        border: `1px solid ${Theme.colors.LIGHT_BLUE[500]}`,
        borderRadius: '2px',
      },
      '& .rlglc-active': {
        border: `1px solid ${Theme.palette.grey[300]}`,
      },
      '& .rlglc:not(.rlglc-active) .rlglc-a': {
        width: '36px',
        height: '36px !important',
      },
      '& .rlglc.rlglc-active .rlglc-a': {
        width: 'auto !important',
        height: 'auto !important',
        padding: '12px',
      },
      '& .rlglc-open': {
        '& .rlglc-input': {
          width: '14px',
          height: '14px',
          margin: '3px 0px 0px 0px',
          cursor: 'pointer',
        },
        '& .rlglc-title': {
          fontFamily: '"Inter",Helvetica,Arial,sans-serif',
        },
        '& .rlglc-groupTitle': {
          fontFamily: '"Inter",Helvetica,Arial,sans-serif',
          fontSize: '13px',
        },
      },
    },
    '& div.leaflet-control-zoom': {
      border: 'none',
    },
    '& div.leaflet-top.leaflet-right': {
      right: 'unset !important',
      left: '0px',
    },
    '& div.leaflet-bar': {
      top: '54px',
      left: '8px',
      margin: '0px',
      borderRadius: '2px',
      boxShadow: 'unset',
      '& a': {
        color: Theme.colors.LIGHT_BLUE[500],
        border: `1px solid ${Theme.colors.LIGHT_BLUE[500]}`,
        width: '26px',
        height: '26px',
        lineHeight: '26px',
        fontSize: '18px',
        '&:hover, &:active': {
          color: Theme.colors.LIGHT_BLUE[400],
          borderColor: Theme.colors.LIGHT_BLUE[400],
        },
        '&:first-child': {
          borderTopLeftRadius: '2px',
          borderTopRightRadius: '2px',
        },
        '&:last-child': {
          borderTop: 'none',
          borderBottomLeftRadius: '2px',
          borderBottomRightRadius: '2px',
        },
      },
    },
    '& div.leaflet-control-attribution': {
      borderTopLeftRadius: '2px',
      marginRight: '26px',
      height: '26px',
      padding: '4px 8px',
    },
    '& div.leaflet-control-attribution a': {
      color: theme.palette.primary.main,
    },
    '& .leaflet-container a': {
      color: theme.palette.primary.main,
    },
    '& input[type="radio"]': {
      cursor: 'pointer',
    },
  },
  mapFullscreen: {
    '& div.leaflet-control-attribution': {
      marginRight: '0px',
    },
  },
  attribution: {
    color: theme.palette.secondary.main,
    fontSize: '11.5px',
    cursor: 'help',
    display: 'inline',
  },
  startFlex: {
    display: 'flex',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  endFlex: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  progress: {
    zIndex: 900,
    position: 'absolute',
    top: '12px',
    left: '56px',
  },
  observatoryButton: {
    backgroundColor: '#fff',
    position: 'absolute',
    zIndex: 999,
    margin: '0px',
    top: '114px',
    left: '8px',
    width: '26px',
    height: '26px',
    padding: 'unset',
    borderRadius: '2px 0px 2px 0px',
    border: `1px solid ${theme.colors.LIGHT_BLUE[500]}`,
    '&:hover, &:active': {
      color: theme.colors.LIGHT_BLUE[400],
      borderColor: theme.colors.LIGHT_BLUE[400],
      backgroundColor: theme.palette.grey[50],
    },
    '& svg': {
      fontSize: '1.15rem !important',
    },
  },
  mouseModeToggleButtonGroup: {
    borderRadius: '2px',
    backgroundColor: 'white',
    position: 'absolute',
    zIndex: 999,
    margin: '0px',
    top: '8px',
    left: '56px',
    '& button': {
      width: '26px',
      height: '26px',
      padding: 'unset !important',
      '& svg': {
        fontSize: '0.9rem',
      },
    },
  },
}));

/**
   Main Component
*/
const SiteMapLeaflet = () => {
  const classes = useStyles(Theme);
  const mapRef = useRef(null);

  // State, Dispatch, and other stuff from SiteMapContext
  const [state, dispatch] = SiteMapContext.useSiteMapContext();
  let canRender = state.neonContextHydrated;
  if (
    state.focusLocation.current
      && state.focusLocation.fetch.status !== FETCH_STATUS.SUCCESS
  ) { canRender = false; }

  /**
     Effect
     If zoom was not set as a prop then attempt to set the initial zoom such that
     all sites are visible. This depends on the client dimensions of the map
     and whether height or width is the deciding factor depends on the aspect ratio.
  */
  useEffect(() => {
    if (
      !canRender || state.map.zoom !== null
        || !mapRef || !mapRef.current || !mapRef.current.container
    ) { return; }
    dispatch({
      type: 'setMapZoom',
      zoom: deriveFullObservatoryZoomLevel(mapRef),
    });
  }, [
    canRender,
    state.map.zoom,
    mapRef,
    dispatch,
  ]);

  /**
    Effect
    If map bounds are null (as they will be when setting a focus location) then fill them in
    We have to do it this way as only the Leaflet Map instance can give us bounds
  */
  useEffect(() => {
    if (state.map.bounds !== null || mapRef.current === null) { return; }
    const bounds = mapRef.current.leafletElement.getBounds();
    dispatch({
      type: 'setMapBounds',
      bounds: {
        lat: [bounds._southWest.lat, bounds._northEast.lat],
        lng: [bounds._southWest.lng, bounds._northEast.lng],
      },
    });
  }, [state.map.bounds, dispatch]);

  /**
    Effect
    Visually distinguish unselectable markers in the marker pane while also changing the draw order
    of marker icons to put unselectable ones behind selectable ones. Use a 0-length setTimeout to
    allow the map to complete one render cycle first.
  */
  useLayoutEffect(() => {
    const timeout = window.setTimeout(() => {
      if (
        !mapRef.current || !mapRef.current.leafletElement
          || !mapRef.current.leafletElement._panes || !mapRef.current.leafletElement._layers
          || !state.selection.active || !state.selection.validSet
          || state.view.current !== VIEWS.MAP
      ) { return; }
      const { markerPane } = mapRef.current.leafletElement._panes;
      if (markerPane && markerPane.children && markerPane.children.length) {
        // Unselectables: apply CSS filters to appear ghosted
        [...markerPane.children]
          .filter(marker => !state.selection.validSet.has(marker.title))
          .forEach((marker) => {
            // eslint-disable-next-line no-param-reassign
            marker.style.filter = UNSELECTABLE_MARKER_FILTER;
          });
        // Selecatbles: Uniformly bump the zIndexOffset to put them all on top
        state.selection.validSet.forEach((item) => {
          const layerIdx = Object.keys(mapRef.current.leafletElement._layers).find(k => (
            mapRef.current.leafletElement._layers[k].options
              && mapRef.current.leafletElement._layers[k].options.title === item
          ));
          if (layerIdx !== -1) {
            const zIndex = (mapRef.current.leafletElement._layers[layerIdx] || {})._zIndex || 0;
            mapRef.current.leafletElement._layers[layerIdx].setZIndexOffset(zIndex + 1000);
          }
        });
      }
    }, 0);
    return () => window.clearTimeout(timeout);
  }, [
    state.selection.active,
    state.selection.validSet,
    state.selection.hideUnselectable,
    state.map.bounds,
    state.view,
  ]);

  /**
    Effect
    Force a redraw when switching to the map for the first time from another view
  */
  useEffect(() => {
    if (
      !mapRef || !mapRef.current || !mapRef.current.leafletElement
        || state.view.current !== VIEWS.MAP || state.view.initialized[VIEWS.MAP]
    ) { return; }
    mapRef.current.leafletElement.invalidateSize();
    dispatch({ type: 'setViewInitialized' });
  }, [mapRef, state.view, dispatch]);

  /**
    Effect
    Create masks for DOMAINS and/or STATES.
    These features intentionally have extra-wide strokes. When combined with a mask it creates
    the effect of stroke "only on the inside" so that strokes of adjacent domains/states never
    overlap along shared borders. This is especially useful for visual differentiation of different
    selection statuses for adjacent states/domains.
  */
  useLayoutEffect(() => {
    // setTimeout of 0 to fire after map render cycle completes
    window.setTimeout(() => {
      // Only continue if the map is in a ready / fully rendered state.
      if (
        !mapRef || !mapRef.current || !mapRef.current.leafletElement
          || !mapRef.current._ready || mapRef.current._updating
          || !mapRef.current.leafletElement._panes
          || !mapRef.current.leafletElement._panes.overlayPane
          || !mapRef.current.leafletElement._panes.overlayPane.children.length
          || mapRef.current.leafletElement._panes.overlayPane.children[0].nodeName !== 'svg'
      ) { return; }
      // Only continue if DOMAINS and/or STATES are showing
      if (
        !state.filters.features.visible[FEATURES.DOMAINS.KEY]
          && !state.filters.features.visible[FEATURES.STATES.KEY]
      ) { return; }
      // Only continue if the overlay pane has child nodes (rendered feature data)
      const svg = mapRef.current.leafletElement._panes.overlayPane.children[0];
      if (!svg.children.length) { return; }
      // Remove any existing <defs> node (it's only created by this effect, never by Leaflet)
      if (svg.children[0].nodeName.toLowerCase() === 'defs') {
        svg.removeChild(svg.children[0]);
      }
      // Only continue if there is one child node and it's a non-empty <g>
      if (svg.children.length !== 1
        || svg.children[0].nodeName.toLowerCase() !== 'g'
        || !svg.children[0].children.length
      ) { return; }
      const paths = [...svg.children[0].children];
      const svgNS = 'http://www.w3.org/2000/svg';
      const defs = document.createElementNS(svgNS, 'defs');
      let defCount = 0;
      paths
        .filter(path => path.attributes.class && path.attributes.class.value.includes('#mask'))
        .forEach((path) => {
          defCount += 1;
          const baseId = path.attributes.class.value.split(' ')[0];
          const defMaskId = baseId.replace('#', '');
          // Create a new <mask> element
          const defMask = document.createElementNS(svgNS, 'mask');
          defMask.setAttributeNS(null, 'id', defMaskId);
          // Create a new <path> element with the same coordinates and append it to the mask
          const defPath = document.createElementNS(svgNS, 'path');
          defPath.setAttributeNS(null, 'd', path.attributes.d.value);
          defPath.setAttributeNS(null, 'fill', 'white');
          defPath.setAttributeNS(null, 'stroke', 'rgba(255, 255, 255, 0.5)');
          defPath.setAttributeNS(null, 'stroke-width', '1.5');
          defMask.appendChild(defPath);
          // Append the <mask> to <defs>
          defs.appendChild(defMask);
          // Set the mask-path attribute on the <path> in the overlay pane
          path.setAttributeNS(null, 'mask', `url(${baseId})`);
        });
      if (defCount === 0) { return; }
      svg.prepend(defs);
    }, 0);
  });

  if (!canRender) { return null; }

  /**
     Render - Zoom to Observatory Button
  */
  const renderShowFullObservatoryButton = () => (
    <Tooltip placement="right" title="Show the full NEON Observatory">
      <IconButton
        type="button"
        className={classes.observatoryButton}
        onClick={() => { dispatch({ type: 'showFullObservatory', mapRef }); }}
      >
        <ObservatoryIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  );

  /**
     Render - Mouse Mode Buttoms (Pan / Select)
   */
  const renderMouseModeToggleButtonGroup = () => {
    if (!state.selection.active) { return null; }
    const units = state.selection.active === FEATURE_TYPES.SITES ? 'sites' : 'locations';
    const mouseModeTooltips = {
      [MAP_MOUSE_MODES.PAN]: 'Click and drag on map to move the map center; shift+drag to zoom to an area',
      [MAP_MOUSE_MODES.AREA_SELECT]: `Click and drag on map to select ${units} in an area; shift+drag to add onto selection`,
    };
    const mouseModeIcons = {
      [MAP_MOUSE_MODES.PAN]: MapPanIcon,
      [MAP_MOUSE_MODES.AREA_SELECT]: MapAreaSelectIcon,
    };
    return (
      <ToggleButtonGroup
        exclusive
        color="primary"
        variant="outlined"
        value={state.map.mouseMode}
        onChange={(event, newMouseMode) => {
          dispatch({ type: 'setMapMouseMode', mouseMode: newMouseMode });
        }}
        className={classes.mouseModeToggleButtonGroup}
      >
        {Object.keys(MAP_MOUSE_MODES).map((key) => {
          const Icon = mouseModeIcons[key];
          return (
            <Tooltip
              key={key}
              title={mouseModeTooltips[key]}
              enterDelay={500}
              enterNextDelay={200}
              placement="bottom-start"
            >
              <ToggleButton
                value={key}
                selected={state.map.mouseMode === key}
                data-selenium={`sitemap-mouseMode-${key}`}
                area-label={mouseModeTooltips[key]}
              >
                <Icon />
              </ToggleButton>
            </Tooltip>
          );
        })}
      </ToggleButtonGroup>
    );
  };

  /**
     Render: Base Layer
  */
  const renderBaseLayer = () => {
    if (!state.map.baseLayer) { return <TileLayer url="" attribution="" />; }
    const baseLayer = BASE_LAYERS[state.map.baseLayer];
    const attributionNode = (
      <div title={baseLayer.fullAttribution} className={classes.attribution}>
        {baseLayer.shortAttribution}
      </div>
    );
    const attributionString = ReactDOMServer.renderToStaticMarkup(attributionNode);
    return (
      <TileLayer url={baseLayer.url} attribution={attributionString} />
    );
  };

  /**
     Render: Overlay
  */
  const renderOverlay = (key) => {
    const overlay = OVERLAYS[key];
    const group = OVERLAY_GROUPS[overlay.group] || {};
    const commonProps = {
      ...(group.commonProps || {}),
      ...(overlay.commonProps || {}),
    };
    return (
      <LayerGroup key={key}>
        {overlay.components.map((node) => {
          let Component = null;
          if (node.type === 'WMSTileLayer') { Component = WMSTileLayer; }
          if (!Component) { return null; }
          return (
            <Component key={node.key} {...{ ...commonProps, ...node.props }} />
          );
        })}
      </LayerGroup>
    );
  };

  /**
     Interaction Handlers
  */
  const handleMoveEnd = (event) => {
    const center = event.target.getCenter();
    const bounds = event.target.getBounds();
    dispatch({
      type: 'setMapCenter',
      center: [center.lat, center.lng],
      bounds: {
        lat: [bounds._southWest.lat, bounds._northEast.lat],
        lng: [bounds._southWest.lng, bounds._northEast.lng],
      },
    });
    if (typeof state.map.repositionOpenPopupFunc === 'function') {
      state.map.repositionOpenPopupFunc();
    }
  };
  const handleZoomEnd = (event) => {
    const center = event.target.getCenter();
    const bounds = event.target.getBounds();
    dispatch({
      type: 'setMapZoom',
      zoom: event.target.getZoom(),
      center: [center.lat, center.lng],
      bounds: {
        lat: [bounds._southWest.lat, bounds._northEast.lat],
        lng: [bounds._southWest.lng, bounds._northEast.lng],
      },
    });
    if (typeof state.map.repositionOpenPopupFunc === 'function') {
      state.map.repositionOpenPopupFunc();
    }
  };
  const handleBaseLayerChange = (key) => {
    if (key !== null && !BASE_LAYERS[key]) { return; }
    dispatch({ type: 'setMapBaseLayer', baseLayer: key });
  };
  const handleOverlayChange = (overlays) => {
    dispatch({
      type: 'setMapOverlays',
      overlays: overlays.filter(o => o.checked).map(o => o.name),
    });
  };

  /**
     Render: Loading / Progress
  */
  const renderProgress = () => {
    if (state.overallFetch.expected === state.overallFetch.completed) { return null; }
    const style = state.selection.active ? { left: '48px', top: '48px' } : null;
    if (state.overallFetch.pendingHierarchy !== 0) {
      return (
        <Box className={classes.progress} style={style}>
          <CircularProgress size={32} />
        </Box>
      );
    }
    const progress = state.overallFetch.expected === 0 ? 0
      : Math.floor((state.overallFetch.completed / state.overallFetch.expected) * 10) * 10;
    const progressProps = progress < 60 ? {
      size: 32,
    } : {
      size: 32,
      variant: 'static',
      value: progress,
    };
    return (
      <Box className={classes.progress} style={style}>
        <CircularProgress {...progressProps} />
        <Box
          top={0}
          left={0}
          bottom={8}
          right={0}
          position="absolute"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Typography variant="caption" component="div">
            {`${Math.round(progress)}%`}
          </Typography>
        </Box>
      </Box>
    );
  };

  /**
     Render: Map
  */
  const groupedLayerControlBaseLayers = Object.keys(BASE_LAYERS).map(key => ({
    name: key,
    title: BASE_LAYERS[key].title,
  })).concat([{
    name: null,
    title: <span style={{ color: Theme.palette.grey[300], fontStyle: 'italic' }}>none</span>,
  }]);
  const groupedLayerControlOverlays = Object.keys(OVERLAYS).map((key) => {
    const { KEY: name, title, group } = OVERLAYS[key];
    const checked = state.map.overlays.has(key);
    let groupTitle = null;
    if (group && OVERLAY_GROUPS[group]) { groupTitle = OVERLAY_GROUPS[group].title; }
    return { name, title, groupTitle, checked }; // eslint-disable-line object-curly-newline
  });
  const canRenderGroupedLayerControl = mapRef && mapRef.current && mapRef.current.leafletElement;
  const mouseModeCursors = {
    [MAP_MOUSE_MODES.PAN]: 'grab',
    [MAP_MOUSE_MODES.AREA_SELECT]: 'crosshair',
  };
  const mouseModeProps = state.map.mouseMode === MAP_MOUSE_MODES.PAN ? {
    boxZoom: true, dragging: true,
  } : {
    boxZoom: false, dragging: false, touchZoom: false,
  };
  return (
    <React.Fragment>
      <Map
        ref={mapRef}
        className={state.fullscreen ? `${classes.map} ${classes.mapFullscreen}` : classes.map}
        style={{
          paddingBottom: `${(state.aspectRatio.currentValue || 0.75) * 100}%`,
          cursor: mouseModeCursors[state.map.mouseMode],
        }}
        center={state.map.center}
        zoom={state.map.zoom}
        minZoom={MAP_ZOOM_RANGE[0]}
        maxZoom={MAP_ZOOM_RANGE[1]}
        onMoveEnd={handleMoveEnd}
        onZoomEnd={handleZoomEnd}
        onBaseLayerChange={handleBaseLayerChange}
        worldCopyJump
        data-component="SiteMap"
        data-selenium="sitemap-content-map"
        {...mouseModeProps}
      >
        <ScaleControl imperial metric updateWhenIdle />
        {renderBaseLayer()}
        {Array.from(state.map.overlays).map(renderOverlay)}
        {!canRenderGroupedLayerControl ? null : (
          <ReactLeafletGroupedLayerControl
            position="topright"
            baseLayers={groupedLayerControlBaseLayers}
            checkedBaseLayer={state.map.baseLayer}
            exclusiveGroups={[]}
            overlays={groupedLayerControlOverlays}
            onBaseLayerChange={handleBaseLayerChange}
            onOverlayChange={handleOverlayChange}
            leaflet={{ map: mapRef.current.leafletElement }}
          />
        )}
        {Object.keys(FEATURES)
          .filter(key => state.filters.features.available[key])
          .filter(key => state.filters.features.visible[key])
          .map(key => <SiteMapFeature key={key} featureKey={key} mapRef={mapRef} />)}
      </Map>
      {renderShowFullObservatoryButton()}
      {renderMouseModeToggleButtonGroup()}
      {renderProgress()}
    </React.Fragment>
  );
};

export default SiteMapLeaflet;
