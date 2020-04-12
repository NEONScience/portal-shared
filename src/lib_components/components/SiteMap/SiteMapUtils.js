import PropTypes from 'prop-types';

import iconCoreTerrestrialSVG from './icon-core-terrestrial.svg';
import iconCoreTerrestrialSelectedSVG from './icon-core-terrestrial-selected.svg';
import iconCoreAquaticSVG from './icon-core-aquatic.svg';
import iconCoreAquaticSelectedSVG from './icon-core-aquatic-selected.svg';
import iconCoreShadowSVG from './icon-core-shadow.svg';
import iconCoreShadowSelectedSVG from './icon-core-shadow-selected.svg';
import iconRelocatableTerrestrialSVG from './icon-relocatable-terrestrial.svg';
import iconRelocatableTerrestrialSelectedSVG from './icon-relocatable-terrestrial-selected.svg';
import iconRelocatableAquaticSVG from './icon-relocatable-aquatic.svg';
import iconRelocatableAquaticSelectedSVG from './icon-relocatable-aquatic-selected.svg';
import iconRelocatableShadowSVG from './icon-relocatable-shadow.svg';
import iconRelocatableShadowSelectedSVG from './icon-relocatable-shadow-selected.svg';

export const MAP_ZOOM_RANGE = [1, 16];

// For consistency in expressing the sort direction for the table
export const SORT_DIRECTIONS = { ASC: 'ASC', DESC: 'DESC' };

// For consistency in denoting distinct selection modes (what "things" a user can select, if any)
export const SELECTIONS = { SITES: 'SITES' }; // TODO: add 'PLOTS'

// For consistency in denoting whether all or some of a region's selectable children are selected
export const SELECTION_PORTIONS = { PARTIAL: 'PARTIAL', TOTAL: 'TOTAL' };

// For consistency in denoting which dinstinct user interfaces are available and which is visible
export const VIEWS = { MAP: 'MAP', TABLE: 'TABLE' };

// Importable data structure containing all imported SVGs for map and legend icons
export const ICON_SVGS = {
  SITE_MARKERS: {
    CORE: {
      AQUATIC: {
        BASE: iconCoreAquaticSVG,
        SELECTED: iconCoreAquaticSelectedSVG,
      },
      TERRESTRIAL: {
        BASE: iconCoreTerrestrialSVG,
        SELECTED: iconCoreTerrestrialSelectedSVG,
      },
      SHADOW: {
        BASE: iconCoreShadowSVG,
        SELECTED: iconCoreShadowSelectedSVG,
      },
    },
    RELOCATABLE: {
      AQUATIC: {
        BASE: iconRelocatableAquaticSVG,
        SELECTED: iconRelocatableAquaticSelectedSVG,
      },
      TERRESTRIAL: {
        BASE: iconRelocatableTerrestrialSVG,
        SELECTED: iconRelocatableTerrestrialSelectedSVG,
      },
      SHADOW: {
        BASE: iconRelocatableShadowSVG,
        SELECTED: iconRelocatableShadowSelectedSVG,
      },
    },
  },
};

/**
   FEATURES
   A data structure describing all descrete boundaries or sets of icons that can be shown on the map
*/
/*
const FEATURE_ATTRIBUTES = {
  SITE: {
    type: ['core', 'relocatable'],
    terrain: ['aquatic', 'terrestrial'],
  },
  PLOT: {
    type: ['base', 'phenology', 'bird', 'mammal', 'tick', 'mosquito'],
    location: ['tower', 'distributed'],
  },
};
*/
export const FEATURES = {
  TOWER_LOCATION: {
    name: 'Tower Location',
    minZoom: 13,
    description: '',
  },
  TOWER_AIRSHED_BOUNDARY: {
    name: 'Tower Airshed Boundary',
    minZoom: 13,
    description: '',
  },
  TOWER_PLOTS: {
    name: 'Tower Plots',
    isParent: true,
    minZoom: 13,
    description: 'Tower plots provide a direct link between NEON’s Terrestrial Observation System and Terrestrial Instrument System. Tower Plots are located in and around the NEON tower primary and secondary airsheds.',
  },
  TOWER_BASE_PLOT: {
    name: 'Tower Base Plot',
    description: 'Tower plots support a variety of plant productivity, plant diversity, soil, biogeochemistry and microbe sampling. The number and size of Tower Base Plots is determined by the vegetation of the tower airshed. In forested sites, twenty 40m x 40m plots are established. In herbaceous sites, thirty 20m x 20m plots are established.  Of these thirty tower plots, four have additional space to support soil sampling.',
    parent: 'TOWER_PLOTS',
    hasAttributes: 'PLOT',
    attributes: { type: 'base', location: 'tower' },
  },
  TOWER_PHENOLOGY_PLOT: {
    name: 'Tower Phenology Plot',
    description: 'Plant phenology observations are made along a transect loop or plot in or around the primary airshed. When possible, one plot is established north of the tower to calibrate phenology camera images captured from sensors on the tower. If there is insufficient space north of the tower for a 200m x 200m plot or if the vegetation does not match the primary airshed an additional plot is established.',
    parent: 'TOWER_PLOTS',
    hasAttributes: 'PLOT',
    attributes: { type: 'phenology', location: 'tower' },
  },
  DISTRIBUTED_PLOTS: {
    name: 'Distributed Plots',
    isParent: true,
    minZoom: 10,
    description: 'Distributed Plots are located throughout the TOS Sampling boundary in an effort to describe organisms and process with plot, point, and grid sampling. Plots were established according to a stratified-random and spatially balanced design.',
  },
  DISTRIBUTED_BASE_PLOTS: {
    name: 'Distributed Base Plots',
    description: 'Distributed Base Plots support a variety of plant productivity, plant diversity, soil, biogeochemistry, microbe and beetle sampling. Distributed Base Plots are 40m x 40m.',
    parent: 'DISTRIBUTED_PLOTS',
    hasAttributes: 'PLOT',
    attributes: { type: 'base', location: 'distributed' },
  },
  DISTRIBUTED_BIRD_GRIDS: {
    name: 'Distributed Bird Grids',
    description: 'Bird Grids consist of 9 sampling points within a 500m x 500m square. Each point is 250m apart. Where possible, Bird Grids are colocated with Distributed Base Plots by placing the Bird Grid center (B2) in close proximity to the center of the Base Plot. At smaller sites, a single point count is done at the south-west corner (point 21) of the Distributed Base Plot.',
    parent: 'DISTRIBUTED_PLOTS',
    hasAttributes: 'PLOT',
    attributes: { type: 'bird', location: 'distributed' },
  },
  DISTRIBUTED_MAMMAL_GRIDS: {
    name: 'Distributed Mammal Grids',
    description: 'Mammal Grids are 90m x 90m and include 100 trapping locations at 10m spacing. Where possible, these grids are colocated with Distributed Base Plots by placing them a specified distance (150m +/- 50m) and random direction from the center of the Base Plot.',
    parent: 'DISTRIBUTED_PLOTS',
    hasAttributes: 'PLOT',
    attributes: { type: 'mammal', location: 'distributed' },
  },
  DISTRIBUTED_MOSQUITO_PLOTS: {
    name: 'Distributed Mosquito Plots',
    description: 'At each Mosquito Point, one CO2 trap is established. Due to the frequency of sampling and temporal sampling constraints, Mosquito Points are located within 45m of roads.',
    parent: 'DISTRIBUTED_PLOTS',
    hasAttributes: 'PLOT',
    attributes: { type: 'mosquito', location: 'distributed' },
  },
  DISTRIBUTED_TICK_PLOTS: {
    name: 'Distributed Tick Plots',
    description: 'Tick Plots are sampled by conducting cloth dragging or flagging around the perimeter of a 40m x 40m plot. Tick plots are colocated with Distributed Base Plots by placing them a specified distance (150m +/- 15m) and random direction from the center of the Base Plot.',
    parent: 'DISTRIBUTED_PLOTS',
    hasAttributes: 'PLOT',
    attributes: { type: 'tick', location: 'distributed' },
  },
  SITE_SAMPLING_BOUNDARIES: {
    name: 'Site Sampling Boundaries',
    minZoom: 7,
    description: '',
  },
  SITE_MARKERS: {
    name: 'NEON Site Markers',
    isParent: true,
    maxZoom: 9,
    description: '',
  },
  TERRESTRIAL_CORE_SITES: {
    name: 'Terrestrial Core Sites',
    description: 'Land-based; fixed location',
    iconSvg: ICON_SVGS.SITE_MARKERS.CORE.TERRESTRIAL,
    parent: 'SITE_MARKERS',
    hasAttributes: 'SITE',
    attributes: { type: 'core', terrain: 'terrestrial' },
  },
  TERRESTRIAL_RELOCATABLE_SITES: {
    name: 'Terrestrial Relocatable Sites',
    description: 'Land-based; location may change',
    iconSvg: ICON_SVGS.SITE_MARKERS.RELOCATABLE.TERRESTRIAL,
    parent: 'SITE_MARKERS',
    hasAttributes: 'SITE',
    attributes: { type: 'relocatable', terrain: 'terrestrial' },
  },
  AQUATIC_CORE_SITES: {
    name: 'Aquatic Core Sites',
    description: 'Water-based; fixed location',
    iconSvg: ICON_SVGS.SITE_MARKERS.CORE.AQUATIC,
    parent: 'SITE_MARKERS',
    hasAttributes: 'SITE',
    attributes: { type: 'core', terrain: 'aquatic' },
  },
  AQUATIC_RELOCATABLE_SITES: {
    name: 'Aquatic Relocatable Sites',
    description: 'Water-based; location may change',
    iconSvg: ICON_SVGS.SITE_MARKERS.RELOCATABLE.AQUATIC,
    parent: 'SITE_MARKERS',
    hasAttributes: 'SITE',
    attributes: { type: 'relocatable', terrain: 'aquatic' },
  },
  NEON_DOMAINS: {
    name: 'NEON Domains',
    description: '',
    hideByDefault: true,
  },
  US_STATES: {
    name: 'US States',
    description: '',
    hideByDefault: true,
  },
};

// Where the map should go when it links out to other pages
export const SITE_DETAILS_URL_BASE = 'https://www.neonscience.org/field-sites/field-sites-map/';
export const EXPLORE_DATA_PRODUCTS_URL_BASE = 'https://data.neonscience.org/data-products/explore?site=';

// Available tile layers - third party services providing tiles for different earth views
// (topographic, satellite, etc.) with attributions.
export const TILE_LAYERS = {
  NATGEO_WORLD_MAP: {
    name: 'National Geographic',
    shortAttribution: '© Natl. Geographic et al.',
    fullAttribution: '© National Geographic, Esri, Garmin, HERE, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}',
  },
  WORLD_IMAGERY: {
    name: 'Satellite Imagery',
    shortAttribution: '© Esri et al.',
    fullAttribution: '© Esri, DigitalGlobe, GeoEye, Earthstar Geographics, CNES/Airbus DS, USDA, USGS, AeroGRID, IGN, GIS Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
  },
  WORLD_STREET_MAP: {
    name: 'Streets',
    shortAttribution: '© Esri et al.',
    fullAttribution: '© Esri, HERE, Garmin, USGS, Intermap, INCREMENT P, NRCan, Esri Japan, METI, Esri China (Hong Kong), Esri Korea, Esri (Thailand), NGCC, OSM contributors, GIS Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
  },
  WORLD_TOPO_MAP: {
    name: 'Topographic',
    shortAttribution: '© Esri et al.',
    fullAttribution: '© Esri, HERE, Garmin, Intermap, iPC, GEBCO, USGS, FAO, NPS, NRCAN, GeoBase, IGN, Kadaster NL, Ordnance Survey, Esri Japan, METI, Esri China (Hong Kong), OSM contributors, GIS Community',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
  },
};
export const TILE_LAYERS_BY_NAME = {};
Object.keys(TILE_LAYERS).forEach((key) => {
  TILE_LAYERS_BY_NAME[TILE_LAYERS[key].name] = key;
});

export const DEFAULT_STATE = {
  view: null,
  aspectRatio: {
    currentValue: 0.75, // Aspect ratio of the Site Map component content area (table and/or map)
    isDynamic: true, // Whether currentValue should set itself dynamically from viewport size
  },
  table: { // Settings that ONLY apply to the table
    sortColumn: 'siteName',
    sortDirection: SORT_DIRECTIONS.ASC,
  },
  map: { // Settings that ONLY apply to the map
    zoom: null,
    tileLayer: null,
  },
  selection: {
    sites: {
      enabled: false,
      maxSelectable: 0, // 0 is interpreted as unlimited, all other values are discrete limits
      sites: new Set(),
      states: {}, // Mapping of stateCodes to a SELECTION_PORTIONS key; derived when sites changes
      domains: {}, // Mapping of domainCodes to a SELECTION_PORTIONS key; derived when sites changes
    },
    plots: {
      enabled: false,
      maxSelectable: 0, // 0 is interpreted as unlimited, all other values are discrete limits
      plots: new Set(),
    },
  },
  filterOptions: {
    features: new Set(), // All features visible at the current zoom level
  },
  filters: {
    search: null,
    hiddenFeatures: new Set(Object.keys(FEATURES).filter(f => f.hideByDefault)),
  },
};

export const SITE_MAP_PROP_TYPES = {
  // Top-level Props
  view: PropTypes.oneOf(Object.keys(VIEWS)),
  aspectRatio: PropTypes.number,
  // Map Props
  mapCenter: PropTypes.arrayOf(PropTypes.number),
  mapZoom: PropTypes.number,
  mapTileLayer: PropTypes.oneOf(Object.keys(TILE_LAYERS)),
  mapOverlays: PropTypes.arrayOf(PropTypes.oneOf(Object.keys(FEATURES))),
  // Selection Props
  selection: PropTypes.oneOf(Object.keys(SELECTIONS)),
  maxSelectable: PropTypes.number,
};

export const SITE_MAP_DEFAULT_PROPS = {
  view: VIEWS.MAP,
  aspectRatio: null,
  mapCenter: [52.68, -110.75],
  mapTileLayer: Object.keys(TILE_LAYERS)[0],
  mapZoom: null,
  selection: null,
  maxSelectable: null,
};

const dynamicAspectRatios = [
  '1:2', '9:16', '2:3', '5:7', '4:5', '1:1', '5:4', '7:5', '3:2', '16:9', '2:1', '2.5:1', '3:1',
].map((ratio) => {
  const parts = /^([\d.]+):([\d.]+)$/.exec(ratio) || ['', '1', '1'];
  return parseFloat(parts[2]) / parseFloat(parts[1]);
});

export const getDynamicAspectRatio = () => {
  const windowAspectRatio = Math.max(window.innerHeight - 40, 0) / window.innerWidth;
  const arIdx = dynamicAspectRatios.findIndex(ar => ar < windowAspectRatio);
  return arIdx === -1
    ? dynamicAspectRatios[dynamicAspectRatios.length - 1]
    : dynamicAspectRatios[arIdx];
};
