/* eslint-disable jsx-a11y/anchor-is-valid, no-unused-vars */
import React, { useRef, useEffect, useLayoutEffect } from 'react';

import { makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import Button from '@material-ui/core/Button';
import Link from '@material-ui/core/Link';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';

import InfoIcon from '@material-ui/icons/InfoOutlined';

import MaterialTable, { MTableToolbar, MTableFilterRow } from 'material-table';

import MaterialTableIcons from '../MaterialTableIcons/MaterialTableIcons';
import NeonContext from '../NeonContext/NeonContext';
import Theme, { COLORS } from '../Theme/Theme';

import SiteMapContext from './SiteMapContext';
import {
  getHref,
  VIEWS,
  FEATURES,
  NLCD_CLASSES,
  FEATURE_TYPES,
  MANUAL_LOCATION_TYPES,
  MIN_TABLE_MAX_BODY_HEIGHT,
  PLOT_SAMPLING_MODULES,
  UNSELECTABLE_MARKER_FILTER,
  calculateLocationsInBounds,
} from './SiteMapUtils';

const ucWord = (word = '') => `${word.slice(0, 1).toUpperCase()}${word.slice(1).toLowerCase()}`;

/**
 * Parse an input search string into discrete terms.
 * Supports quoting words together as a single term.
 * Example: '"foo bar" baz' => ['foo bar', 'baz']
 * @param {string} input - string to parse into discrete terms
 */
const parseSearchTerms = (input) => {
  const terms = input
    .replace(/[^\w\s."]/g, '')
    .match(/(".*?"|[^" \s]+)(?=\s* |\s*$)/g);
  return (terms || [])
    .map((term) => term.replace(/"/g, '').toLowerCase());
};

/**
 * Apply a searchString to a list of string attributes; return boolean for a match
 */
const searchOnAttribs = (searchString, searchableAttribs = []) => {
  const searchTerms = parseSearchTerms(searchString);
  if (!searchTerms.length) { return true; }
  return searchTerms.some((term) => (
    searchableAttribs.some((attrib) => (
      (attrib || '').toLowerCase().includes(term)
    ))
  ));
};

const getFeatureName = (featureKey) => {
  if (FEATURES[featureKey]) {
    return (FEATURES[featureKey].nameSingular || FEATURES[featureKey].name || featureKey);
  }
  return featureKey;
};

const calculateMaxBodyHeight = (tableRef) => {
  if (!tableRef || !tableRef.current) { return MIN_TABLE_MAX_BODY_HEIGHT; }
  const containerHeight = tableRef.current.clientHeight || 0;
  const toolbarHeight = tableRef.current.children[0].children[0].clientHeight || 0;
  const pagerHeight = tableRef.current.children[0].children[2].clientHeight || 0;
  return Math.max(containerHeight - toolbarHeight - pagerHeight, MIN_TABLE_MAX_BODY_HEIGHT);
};

const useStyles = makeStyles((theme) => ({
  tableContainer: {
    backgroundColor: 'white',
    overflowWrap: 'normal',
    '& table': {
      margin: '0px !important',
      borderCollapse: 'separate',
      '& tr.MuiTableRow-root:empty': {
        height: '0px !important',
      },
      '& tr.MuiTableRow-head': {
        backgroundColor: theme.palette.primary.main,
        '& th:first-child span.MuiCheckbox-root': {
          margin: theme.spacing(0, 0.5),
          backgroundColor: '#ffffff88',
          '&:hover': {
            backgroundColor: '#ffffffaa',
          },
        },
      },
      '& tbody tr:first-child': {
        backgroundColor: theme.palette.grey[50],
      },
      '& tfoot': {
        paddingRight: '36px',
      },
    },
    '& td.MuiTablePagination-root': {
      borderBottom: 'none',
    },
  },
  tableContainerIntegrated: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  tableContainerStandalone: {
    // ...
  },
  featureIcon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1),
    filter: 'drop-shadow(0px 0px 1.5px #000000bb)',
  },
  linkButton: {
    textAlign: 'left',
  },
  startFlex: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  toolbarContainer: {
    backgroundColor: theme.palette.grey[50],
    [theme.breakpoints.down('xs')]: {
      paddingTop: theme.spacing(4.5),
    },
    '& div.MuiToolbar-root': {
      padding: theme.spacing(0, 2),
      backgroundColor: theme.palette.grey[50],
    },
    // Make the columns button more prominent (really hard to do with component overriding)
    '& button': {
      color: theme.palette.primary.main,
      '&:hover, &:active': {
        color: COLORS.LIGHT_BLUE[400],
        border: `1px solid ${COLORS.LIGHT_BLUE[400]}`,
        backgroundColor: `${COLORS.LIGHT_BLUE[400]}20`,
        padding: '11px',
      },
    },
  },
  toolbarContainerNoSplit: {
    // This hides all but the search input and show columns buttons.
    // No other way to have material table NOT show a selection title in the toolbar.
    '& div.MuiToolbar-root > div:not(:nth-last-child(-n+2))': {
      display: 'none',
    },
  },
  toggleButtonGroup: {
    height: theme.spacing(4),
  },
  toggleButton: {
    height: theme.spacing(4),
    fontWeight: 600,
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    padding: theme.spacing(0, 1.5),
    whiteSpace: 'nowrap',
  },
  // Use !important here to override the Mui-selected class with higher priority
  toggleButtonSelected: {
    color: '#fff !important',
    backgroundColor: `${theme.palette.primary.main} !important`,
  },
  caption: {
    fontFamily: 'monospace',
    fontSize: '1.05em',
    whiteSpace: 'nowrap',
  },
  iconButton: {
    marginTop: theme.spacing(-0.25),
  },
  siteName: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-start',
    margin: theme.spacing(1, 0, 0.5, 0),
    minWidth: '200px',
    textAlign: 'left',
  },
  siteLinksDivider: {
    margin: theme.spacing(0, 1, 0, 1),
  },
  siteDetailsLink: {
    fontSize: '80%',
    fontStyle: 'italic',
  },
  nlcdClassContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  nlcdClass: {
    width: '14px',
    height: '14px',
    border: '1px solid black',
    marginRight: theme.spacing(1.5),
  },
  tableTitle: {
    '& h6': {
      fontSize: '1.2rem',
      fontWeight: 500,
    },
  },
}));

const SiteMapTable = () => {
  const classes = useStyles(Theme);
  const tableRef = useRef(null);

  // Neon Context State
  const [{ isFinal, hasError }] = NeonContext.useNeonContextState();
  const canRender = isFinal && !hasError;

  // Site Map State
  const [state, dispatch] = SiteMapContext.useSiteMapContext();
  const {
    manualLocationData,
    view: { current: view, initialized: viewsInitialized },
  } = state;
  const {
    focus,
    fullHeight,
    maxBodyHeight,
    maxBodyHeightUpdateFromAspectRatio,
  } = state.table;
  const {
    limit: selectionLimit,
    valid: selectionValid,
    set: selection,
    validSet: selectableItems,
    hideUnselectable,
  } = state.selection;
  const selectionActive = state.selection.active === focus;

  /**
    Effect - Initialize table if this is the first time we're seeing it
  */
  useEffect(() => {
    if (
      !tableRef || !tableRef.current
        || view !== VIEWS.TABLE || viewsInitialized[VIEWS.TABLE]
    ) { return; }
    dispatch({ type: 'setViewInitialized' });
    dispatch({ type: 'setTableMaxBodyHeight', height: calculateMaxBodyHeight(tableRef) });
  }, [
    tableRef,
    view,
    viewsInitialized,
    dispatch,
  ]);

  /**
    Effect - Recalculate the max body height from an aspect ratio change (e.g. page resize)
  */
  useEffect(() => {
    if (
      view === VIEWS.TABLE && viewsInitialized[VIEWS.TABLE]
        && maxBodyHeightUpdateFromAspectRatio
    ) {
      dispatch({ type: 'setTableMaxBodyHeight', height: calculateMaxBodyHeight(tableRef) });
    }
  }, [
    tableRef,
    view,
    viewsInitialized,
    dispatch,
    maxBodyHeightUpdateFromAspectRatio,
  ]);

  /**
    Layout Effect - Inject a second horizontal scrollbar above the table linked to the main
  */
  useLayoutEffect(() => {
    const noop = () => {};
    // This all only applies to full height table and/or split view (which behaves as full height)
    if (!fullHeight && view !== VIEWS.SPLIT) { return noop; }
    // Collect the nodes we pay attention to. Each one has a distinct purpose.
    const tableNode = tableRef.current.querySelector('table');
    if (!tableNode) { return noop; }
    const tbodyNode = tableRef.current.querySelector('tbody');
    if (!tbodyNode) { return noop; }
    const scrollingNode = (tableNode.parentElement || {}).parentElement;
    if (!scrollingNode) { return noop; }
    const containerNode = scrollingNode.parentElement;
    if (!containerNode) { return noop; }
    // Initialize the new scrollbar in this scope
    let scrollbar = null;
    // Function to do the initial injection fo the scrollbar node
    const injectScrollbar = () => {
      scrollbar = document.createElement('div');
      scrollbar.appendChild(document.createElement('div'));
      scrollbar.style.overflow = 'auto';
      scrollbar.style.overflowY = 'hidden';
      // eslint-disable-next-line prefer-destructuring
      scrollbar.style.backgroundColor = Theme.palette.grey[50];
      scrollbar.firstChild.style.width = `${tableNode.scrollWidth || 0}px`;
      scrollbar.firstChild.style.paddingTop = '1px';
      scrollbar.onscroll = () => {
        scrollingNode.scrollLeft = scrollbar.scrollLeft;
      };
      scrollingNode.onscroll = () => {
        scrollbar.scrollLeft = scrollingNode.scrollLeft;
      };
      containerNode.parentNode.insertBefore(scrollbar, containerNode);
    };
    // Function to resize the scrollbar. We can't rely on the scrollWidth being accurate when we
    // inject as not-yet-fully-rendered table rows may expand the scrollWidth.
    const resizeScrollbar = () => {
      if (!scrollbar) { return; }
      scrollbar.firstChild.style.width = `${tableNode.scrollWidth || 0}px`;
      scrollbar.scrollLeft = scrollingNode.scrollLeft;
    };
    // Inject the scrollbar one step removed from the initial render cycle (with a 0-sec timeout)
    const timeout = window.setTimeout(injectScrollbar, 0);
    // Observe the childList of the tbody - i.e. rows being added or removed - to trigger a resize
    // of the injected scrollbar
    const observer = new MutationObserver(resizeScrollbar);
    observer.observe(tbodyNode, { childList: true });
    // Clear any pending timeouts and disconnect our observer on unload to avoid memory leaks
    return () => {
      observer.disconnect();
      window.clearTimeout(timeout);
    };
  }, [
    tableRef,
    fullHeight,
    view,
  ]);

  if (!canRender) { return null; }

  // Selection functions
  let rowIsSelected = () => false;
  let rowIsSelectable = () => false;
  let selectRow = () => {};
  switch (focus) {
    case FEATURE_TYPES.SITES.KEY:
      rowIsSelected = (row) => selection.has(row.siteCode);
      rowIsSelectable = (row) => !selectableItems || selectableItems.has(row.siteCode);
      selectRow = (row) => dispatch({ type: 'toggleItemSelected', item: row.siteCode });
      break;
    default:
      break;
  }

  // Jump-To function to turn location names in the table to map navigation
  const jumpTo = (locationCode = '') => {
    dispatch({ type: 'setNewFocusLocation', location: locationCode });
  };

  // While sites keep a state and domain code locations only keep a site code.
  // These helper functions will connect the dots to to get site/state/domain/etc. for a location.
  const getParent = (type, location) => {
    let source = null;
    if (type === 'SITE') {
      let data = state.sites;
      if (Array.isArray(manualLocationData) && manualLocationData.length) {
        data = {};
        manualLocationData.forEach((ml) => {
          const { siteCode } = ml;
          data[siteCode] = Object.keys(state.sites).includes(siteCode) ? state.sites[siteCode] : ml;
        });
      }
      source = { code: 'siteCode', data };
    } else if (type === 'STATE') {
      source = { code: 'stateCode', data: state.featureData.STATES.STATES };
    } else if (type === 'DOMAIN') {
      source = { code: 'domainCode', data: state.featureData.DOMAINS.DOMAINS };
    }
    if (!source) { return null; }
    let code = null;
    if (location[source.code]) {
      code = location[source.code];
    } else if (location.siteCode) {
      code = state.sites[location.siteCode] ? state.sites[location.siteCode][source.code] : null;
    }
    return source.data[code] ? { [source.code]: code, ...source.data[code] } : null;
  };
  const getSite = (location) => getParent('SITE', location);
  const getState = (location) => getParent('STATE', location);
  const getDomain = (location) => getParent('DOMAIN', location);

  const renderFeatureIcon = (featureKey, unselectable = false) => {
    if (!FEATURES[featureKey] || !FEATURES[featureKey].iconSvg) { return null; }
    const { iconSvg } = FEATURES[featureKey];
    const style = unselectable ? { filter: UNSELECTABLE_MARKER_FILTER } : {};
    return (
      <img
        src={iconSvg}
        alt={getFeatureName(featureKey)}
        className={classes.featureIcon}
        style={style}
      />
    );
  };

  const renderCaptionString = (str = '--', ariaLabel = null) => (
    <Typography variant="caption" aria-label={ariaLabel} className={classes.caption}>
      {str}
    </Typography>
  );

  /**
     Calculate rows
  */
  const visibleFeatureKeys = Object.keys(state.featureData[focus])
    .filter((featureKey) => (
      state.filters.features.available[featureKey] && state.filters.features.visible[featureKey]
    ));
  const locations = {};
  visibleFeatureKeys.forEach((featureKey) => {
    Object.keys(state.featureData[focus][featureKey]).forEach((siteCode) => {
      if (focus === FEATURE_TYPES.SITES.KEY) {
        locations[siteCode] = state.featureData[focus][featureKey][siteCode];
      }
      if (focus === FEATURE_TYPES.LOCATIONS.KEY) {
        Object.keys(state.featureData[focus][featureKey][siteCode]).forEach((locationCode) => {
          locations[locationCode] = state.featureData[focus][featureKey][siteCode][locationCode];
        });
      }
    });
  });
  let initialRows = calculateLocationsInBounds(locations, state.map.bounds);
  if (selectionActive && selectableItems && hideUnselectable) {
    initialRows = initialRows.filter((item) => selectableItems.has(item));
  }
  const hasPrototypeSites = (manualLocationData || []).some((ml) => (
    ml.manualLocationType === MANUAL_LOCATION_TYPES.PROTOTYPE_SITE
  ));
  if (hasPrototypeSites) {
    const visibleSites = manualLocationData.map((ml) => ml.siteCode);
    initialRows = initialRows.filter((item) => visibleSites.includes(item));
  }
  const rows = initialRows.map((key) => locations[key]);
  if (selectionActive) {
    rows.forEach((row, idx) => {
      let selected = false;
      if (focus === FEATURE_TYPES.SITES.KEY) { selected = selection.has(row.siteCode); }
      // Implement locations preselection here
      if (!rows[idx].tableData) { rows[idx].tableData = {}; }
      rows[idx].tableData.checked = selected;
    });
  }

  /**
     Unique sites, domains, and states off of rows
  */
  const sitesInMap = Array.from(rows.reduce((acc, cur) => {
    if (cur.siteCode) { acc.add(cur.siteCode); }
    return acc;
  }, new Set()));
  const domainsInMap = new Set();
  const statesInMap = new Set();
  sitesInMap
    .filter((siteCode) => state.sites[siteCode])
    .forEach((siteCode) => {
      domainsInMap.add(state.sites[siteCode].domainCode);
      statesInMap.add(state.sites[siteCode].stateCode);
    });

  // Columns that are visible for more than one feature type
  const commonColumns = {
    site: {
      field: 'siteCode',
      title: 'Site',
      sorting: true,
      defaultSort: 'desc',
      searchable: true,
      lookup: Object.fromEntries(
        Array.from(sitesInMap).map((siteCode) => [siteCode, siteCode]),
      ),
      customFilterAndSearch: (input, row) => {
        if (typeof input === 'string') {
          return searchOnAttribs(input, [row.siteCode, row.description]);
        }
        if (Array.isArray(input)) {
          return input.includes(row.siteCode);
        }
        return false;
      },
      customSort: (rowA, rowB) => {
        const siteA = getSite(rowA);
        const siteB = getSite(rowB);
        const aName = siteA.description;
        const bName = siteB.description;
        return aName > bName ? -1 : 1;
      },
      // eslint-disable-next-line arrow-body-style
      render: (row) => {
        const site = getSite(row);
        if (!site) { return null; }
        const isDecommissioned = site.manualLocationType === MANUAL_LOCATION_TYPES.PROTOTYPE_SITE;
        const featureKey = isDecommissioned
          ? FEATURES.DECOMMISSIONED_SITES.KEY
          : `${site.terrain.toUpperCase()}_${site.type.toUpperCase()}_SITES`;
        const unselectable = selectionActive && !rowIsSelectable(row);
        return (
          <div>
            <Link
              component="button"
              className={classes.siteName}
              onClick={() => jumpTo(row.siteCode)}
              title={`Click to view ${row.siteCode} on the map`}
            >
              {renderFeatureIcon(featureKey, unselectable)}
              <span>{`${site.description || 'Unnamed Site'} (${site.siteCode})`}</span>
            </Link>
            <div className={classes.startFlex}>
              <Link
                className={classes.siteDetailsLink}
                href={`${getHref('SITE_DETAILS', site.siteCode)}`}
              >
                Site Details
              </Link>
              <span className={classes.siteLinksDivider}>|</span>
              <Link
                className={classes.siteDetailsLink}
                href={`${getHref('EXPLORE_DATA_PRODUCTS_BY_SITE', site.siteCode)}`}
              >
                Explore Data
              </Link>
            </div>
          </div>
        );
      },
    },
    domain: {
      field: 'domainCode',
      title: 'Domain',
      sorting: true,
      defaultSort: 'desc',
      searchable: true,
      lookup: Object.fromEntries(
        Array.from(domainsInMap).map((domainCode) => [domainCode, domainCode]),
      ),
      customSort: (rowA, rowB) => {
        const domainA = getDomain(rowA);
        const domainB = getDomain(rowB);
        return domainA.domainCode > domainB.domainCode ? -1 : 1;
      },
      render: (row) => {
        const domain = getDomain(row);
        return !domain ? null : (
          <div>
            <Link
              component="button"
              className={classes.linkButton}
              onClick={() => jumpTo(domain.domainCode)}
              title={`Click to view ${domain.domainCode} on the map`}
            >
              {domain.domainCode}
            </Link>
          </div>
        );
      },
    },
    state: {
      field: 'stateCode',
      title: 'State',
      sorting: true,
      defaultSort: 'desc',
      searchable: true,
      lookup: Object.fromEntries(
        Array.from(statesInMap).map((stateCode) => [
          stateCode,
          state.featureData.STATES.STATES[stateCode].name,
        ]),
      ),
      customSort: (rowA, rowB) => {
        const stateA = getState(rowA);
        const stateB = getState(rowB);
        return stateA.name > stateB.name ? -1 : 1;
      },
      customFilterAndSearch: (input, row) => {
        if (typeof input === 'string') {
          const rowState = getState(row);
          return searchOnAttribs(input, [row.stateCode, rowState.name]);
        }
        if (Array.isArray(input)) {
          return input.includes(row.stateCode);
        }
        return false;
      },
      render: (row) => {
        const usstate = getState(row);
        return !usstate ? null : (
          <div>
            <Link
              component="button"
              className={classes.linkButton}
              onClick={() => jumpTo(row.stateCode)}
              title={`Click to view ${row.stateCode} on the map`}
            >
              {usstate.name}
            </Link>
          </div>
        );
      },
    },
    coordinates: {
      field: 'latitude',
      title: 'Coordinates',
      sorting: false,
      filtering: false,
      searchable: false,
      render: (row) => (
        <>
          {renderCaptionString(row.latitude.toFixed(5), 'Latitude')}
          <br />
          {renderCaptionString(row.longitude.toFixed(5), 'Longitude')}
        </>
      ),
    },
    latitude: {
      field: 'latitude',
      title: 'Latitude',
      sorting: true,
      filtering: false,
      render: (row) => renderCaptionString(row.latitude.toFixed(5), 'Latitude'),
    },
    longitude: {
      field: 'longitude',
      title: 'Longitude',
      sorting: true,
      filtering: false,
      render: (row) => renderCaptionString(row.longitude.toFixed(5), 'Longitude'),
    },
  };

  /**
     Define columns from current focus feature type
  */
  let columns = [];
  if (focus === FEATURE_TYPES.SITES.KEY) {
    columns = [
      commonColumns.site,
      { // Site Type
        field: 'type',
        title: 'Type',
        sorting: true,
        defaultSort: 'desc',
        searchable: true,
        lookup: Object.fromEntries(
          Array.from(
            new Set(rows.map((row) => row.type)),
          ).sort().map((k) => [k, ucWord(k)]),
        ),
        render: (row) => ucWord(row.type),
      },
      { // Site Terrain
        field: 'terrain',
        title: 'Terrain',
        sorting: true,
        defaultSort: 'desc',
        lookup: Object.fromEntries(
          Array.from(
            new Set(rows.map((row) => row.terrain)),
          ).sort().map((k) => [k, ucWord(k)]),
        ),
        render: (row) => ucWord(row.terrain),
      },
      commonColumns.domain,
      commonColumns.state,
      commonColumns.coordinates,
      /*
      commonColumns.latitude,
      commonColumns.longitude,
      */
    ];
  }
  if (focus === FEATURE_TYPES.LOCATIONS.KEY) {
    columns = [
      { // Location Name
        field: 'name',
        title: 'Name',
        sorting: true,
        defaultSort: 'desc',
        searchable: true,
        render: (row) => (
          <Link
            component="button"
            className={classes.linkButton}
            onClick={() => jumpTo(row.name)}
            title={`View ${row.name} on map`}
          >
            {row.name}
          </Link>
        ),
      },
      { // Location Type
        field: 'featureKey',
        title: 'Type',
        sorting: true,
        defaultSort: 'desc',
        searchable: true,
        lookup: Object.fromEntries(
          Array.from(new Set(rows.map((row) => row.featureKey)))
            .sort((a, b) => (getFeatureName(a) > getFeatureName(b) ? 1 : -1))
            .map((featureKey) => [featureKey, getFeatureName(featureKey)]),
        ),
        customSort: (rowA, rowB) => {
          const typeA = getFeatureName(rowA.featureKey);
          const typeB = getFeatureName(rowB.featureKey);
          if (typeA.name === typeB.name) { return 0; }
          return typeA.name > typeB.name ? -1 : 1;
        },
        render: (row) => {
          const { featureKey } = row;
          const featureName = getFeatureName(featureKey);
          return (
            <div className={classes.startFlex}>
              {renderFeatureIcon(featureKey)}
              <span>{featureName}</span>
            </div>
          );
        },
      },
      { // Elevation
        field: 'elevation',
        title: 'Elevation',
        sorting: true,
        defaultSort: 'desc',
        filtering: false,
        render: (row) => renderCaptionString(
          Number.isFinite(row.elevation) ? `${row.elevation.toFixed(2)}m` : '--',
          'Elevation',
        ),
      },
      { // NLCD Class
        field: 'nlcdClass',
        title: 'NLCD Class',
        sorting: true,
        deafultSort: 'asc',
        searchable: true,
        lookup: Object.fromEntries(
          Object.keys(NLCD_CLASSES)
            .filter((classKey) => rows.some((row) => row.nlcdClass === classKey))
            .map((classKey) => [classKey, NLCD_CLASSES[classKey].name]),
        ),
        render: (row) => {
          if (!row.nlcdClass) {
            return renderCaptionString();
          }
          if (!NLCD_CLASSES[row.nlcdClass]) {
            return renderCaptionString(row.nlcdClass, 'NLCD Class');
          }
          const { name: title, color: backgroundColor } = NLCD_CLASSES[row.nlcdClass];
          return (
            <div className={classes.nlcdClassContainer}>
              <div className={classes.nlcdClass} title={title} style={{ backgroundColor }} />
              {renderCaptionString(title, 'NLCD Class')}
            </div>
          );
        },
      },
      { // Plot Size
        field: 'plotSize',
        title: 'Plot Size',
        sorting: true,
        deafultSort: 'asc',
        filtering: false,
        render: (row) => (row.plotDimensions ? (
          <>
            {renderCaptionString(`${row.plotDimensions}`, 'Plot Size (Dimensions)')}
            {Number.isFinite(row.plotSize) ? (
              <>
                <br />
                {renderCaptionString(`(${row.plotSize.toFixed(0)}m\u00b2)`, 'Plot Size (Area)')}
              </>
            ) : null}
          </>
        ) : renderCaptionString()),
      },
      { // Plot Slope Aspect
        field: 'slopeAspect',
        title: 'Slope Aspect',
        sorting: true,
        deafultSort: 'asc',
        filtering: false,
        render: (row) => renderCaptionString(
          Number.isFinite(row.slopeAspect) ? `${row.slopeAspect.toFixed(2)}\u00b0` : '--',
          'Slope Aspect',
        ),
      },
      { // Plot Slope Gradient
        field: 'slopeGradient',
        title: 'Slope Gradient',
        sorting: true,
        deafultSort: 'asc',
        filtering: false,
        render: (row) => renderCaptionString(
          Number.isFinite(row.slopeGradient) ? `${row.slopeGradient.toFixed(2)}%` : '--',
          'Slope Gradient',
        ),
      },
      { // Sampling Module Count
        field: 'samplingModules',
        title: 'Potential Sampling Modules',
        filtering: false,
        sorting: true,
        deafultSort: 'asc',
        searchable: true,
        customSort: (rowA, rowB) => {
          const a = Array.isArray(rowA.samplingModules) ? rowA.samplingModules.length : null;
          const b = Array.isArray(rowB.samplingModules) ? rowB.samplingModules.length : null;
          if (a === b) { return 0; }
          if (a === null && b !== null) { return 1; }
          if (a !== null && b === null) { return -1; }
          return a > b ? 1 : -1;
        },
        render: (row) => (
          Array.isArray(row.samplingModules) ? (
            <Tooltip
              interactive
              placement="left"
              title={
                row.samplingModules.length ? (
                  <ul style={{ marginLeft: Theme.spacing(-1) }}>
                    {row.samplingModules.map((m) => (
                      <li key={m}>{PLOT_SAMPLING_MODULES[m]}</li>
                    ))}
                  </ul>
                ) : <i>none</i>
              }
            >
              <div className={classes.startFlex}>
                {renderCaptionString(row.samplingModules.length, 'Potential Sampling Modules')}
                <IconButton
                  size="small"
                  className={classes.iconButton}
                  aria-label="Potential Sampling Modules"
                >
                  <InfoIcon fontSize="inherit" />
                </IconButton>
              </div>
            </Tooltip>
          ) : (
            renderCaptionString()
          )
        ),
      },
      commonColumns.site,
      commonColumns.domain,
      commonColumns.state,
      commonColumns.coordinates,
      /*
      commonColumns.latitude,
      commonColumns.longitude,
      */
    ];
  }

  const toolbarClassName = view === VIEWS.SPLIT
    ? classes.toolbarContainer
    : `${classes.toolbarContainer} ${classes.toolbarContainerNoSplit}`;
  const components = {
    Container: Box,
    Toolbar: (toolbarProps) => (
      <div className={toolbarClassName} data-selenium="sitemap-table-toolbar">
        <MTableToolbar {...toolbarProps} classes={{ title: classes.tableTitle }} />
      </div>
    ),
    FilterRow: (filterRowProps) => (
      <MTableFilterRow
        {...filterRowProps}
        filterCellStyle={{ padding: '8px', backgroundColor: Theme.palette.grey[50] }}
      />
    ),
  };
  const localization = {
    toolbar: {
      searchPlaceholder: `Search ${focus.toLowerCase()} in view`,
    },
    body: {
      emptyDataSourceMessage: `No ${focus.toLowerCase()} in current map view match the current filters.`,
    },
  };

  /**
     Render Table
  */
  const tableOptions = {
    padding: 'dense',
    filtering: true,
    columnsButton: true,
    headerStyle: {
      position: 'sticky',
      top: 0,
      backgroundColor: Theme.palette.grey[50],
    },
    pageSize: 100,
    pageSizeOptions: [100, 200, 500],
    rowStyle: (row) => {
      if (selectionActive) {
        if (!rowIsSelectable(row)) {
          return { opacity: 0.65 };
        }
        if (rowIsSelected(row)) {
          return { backgroundColor: COLORS.LIGHT_BLUE[50] };
        }
      }
      return {};
    },
    selection: selectionActive,
    selectionProps: !selectionActive ? null : (row) => ({
      style: { margin: Theme.spacing(0, 0.5) },
      disabled: !rowIsSelectable(row),
    }),
  };
  if (!fullHeight && view !== VIEWS.SPLIT) {
    tableOptions.maxBodyHeight = `${maxBodyHeight || MIN_TABLE_MAX_BODY_HEIGHT}px`;
  }
  let containerClassName = `${classes.tableContainer} ${classes.tableContainerIntegrated}`;
  let containerStyle = {};
  if (view === VIEWS.TABLE && fullHeight) {
    containerStyle = { position: 'relative' };
  }
  if (view === VIEWS.SPLIT) {
    containerClassName = `${classes.tableContainer} ${classes.tableContainerStandalone}`;
  }
  return (
    <div
      ref={tableRef}
      className={containerClassName}
      style={containerStyle}
      data-selenium="sitemap-content-table"
    >
      <MaterialTable
        title={`${ucWord(focus)} in view`}
        icons={MaterialTableIcons}
        components={components}
        columns={columns}
        data={rows}
        localization={localization}
        options={tableOptions}
        onSelectionChange={!selectionActive ? null : (newRows) => {
          const action = { type: 'updateSelectionSet', selection: new Set() };
          newRows.filter((row) => row.tableData.checked).forEach((row) => {
            if (focus === FEATURE_TYPES.SITES.KEY) {
              action.selection.add(row.siteCode);
            }
          });
          dispatch(action);
        }}
      />
    </div>
  );
};

export default SiteMapTable;

// Additional items exported for unit testing
export const getTestableItems = () => (
  process.env.NODE_ENV !== 'test' ? {} : {
    ucWord,
    parseSearchTerms,
    searchOnAttribs,
    calculateMaxBodyHeight,
    getFeatureName,
  }
);
