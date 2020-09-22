import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
} from 'react';
import PropTypes from 'prop-types';

import debounce from 'lodash/debounce';
import uniqueId from 'lodash/uniqueId';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
import Checkbox from '@material-ui/core/Checkbox';
import CircularProgress from '@material-ui/core/CircularProgress';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Paper from '@material-ui/core/Paper';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import Zoom from '@material-ui/core/Zoom';

import WarningIcon from '@material-ui/icons/Warning';
import ErrorIcon from '@material-ui/icons/Error';
import ExpandUpIcon from '@material-ui/icons/ExpandLess';
import ExpandDownIcon from '@material-ui/icons/ExpandMore';
import HideIcon from '@material-ui/icons/VisibilityOff';
import ShowIcon from '@material-ui/icons/Visibility';
import DownArrowIcon from '@material-ui/icons/ArrowDropDown';
import LeftArrowIcon from '@material-ui/icons/ArrowLeft';
import VertResizeIcon from '@material-ui/icons/Height';
import LegendIcon from '@material-ui/icons/Toc';
import UnselectableIcon from '@material-ui/icons/NotInterested';
import DoneIcon from '@material-ui/icons/Done';
import CancelIcon from '@material-ui/icons/Cancel';
import NoneSelectedIcon from '@material-ui/icons/Remove';
import DeleteIcon from '@material-ui/icons/Delete';

import NeonContext from '../NeonContext/NeonContext';
import Theme from '../Theme/Theme';

import SiteMapContext from './SiteMapContext';
import SiteMapLeaflet from './SiteMapLeaflet';
import SiteMapTable from './SiteMapTable';
import {
  VIEWS,
  FEATURES,
  FEATURE_TYPES,
  MIN_CONTAINER_HEIGHT,
  getDynamicAspectRatio,
} from './SiteMapUtils';

const progressId = `sitemap-progress-${uniqueId()}`;

const boxShadow = '0px 2px 1px -1px rgba(0,0,0,0.2), 0px 1px 1px 0px rgba(0,0,0,0.14), 0px 1px 3px 0px rgba(0,0,0,0.12)';
const useStyles = makeStyles(theme => ({
  outerContainer: {
    zIndex: 0,
    width: '100%',
    position: 'relative',
  },
  contentContainer: {
    width: '100%',
    height: '0px', // Necessary to set a fixed aspect ratio from props (using paddingBottom)
    position: 'relative',
    backgroundColor: theme.colors.NEON_BLUE[200],
    overflow: 'hidden',
    display: 'flex',
    justifyContent: 'center',
    boxShadow,
  },
  contentPaper: {
    position: 'absolute',
    width: '70%',
    top: '50%',
    transform: 'translate(0%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: theme.spacing(3),
    borderRadius: '2px',
  },
  featuresContainer: {
    backgroundColor: theme.palette.grey[100],
    height: 'calc(100% - 84px)',
    borderBottomLeftRadius: '4px',
    borderTopLeftRadius: '4px',
    position: 'absolute',
    zIndex: 1000,
    top: '48px',
    right: '0px',
    boxShadow: '-3px 0 5px 0px rgba(0,0,0,0.5)',
    padding: theme.spacing(1),
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    overflowY: 'auto',
  },
  featuresContainerFullscreen: {
    top: '56px',
    height: 'calc(100% - 92px)',
  },
  featureIcon: {
    width: '28px',
    height: '28px',
    marginRight: theme.spacing(1),
  },
  featureOptionFormControlLabel: {
    width: '100%',
    paddingRight: theme.spacing(1),
    margin: 0,
    '& > span:nth-child(2)': {
      width: '100%',
    },
    '&:hover, &:focus': {
      backgroundColor: theme.palette.grey[100],
    },
  },
  featureOptionLabel: {
    display: 'flex',
    alignItems: 'center',
  },
  resizeButton: {
    backgroundColor: '#fff',
    position: 'absolute',
    zIndex: 999,
    bottom: '0px',
    right: '0px',
    width: '26px',
    height: '26px',
    padding: 'unset',
    borderRadius: '2px 0px 2px 0px',
    border: `1px solid ${theme.colors.LIGHT_BLUE[500]}`,
    cursor: 'grab',
    '&:hover, &:active': {
      color: theme.colors.LIGHT_BLUE[400],
      borderColor: theme.colors.LIGHT_BLUE[400],
      backgroundColor: theme.palette.grey[50],
    },
    '&:active': {
      cursor: 'row-resize !important',
    },
    '& svg': {
      fontSize: '1.15rem !important',
    },
  },
  resizeBorder: {
    position: 'absolute',
    border: `3px solid ${theme.colors.LIGHT_BLUE[500]}`,
    top: '0px',
    left: '0px',
    width: '100%',
    zIndex: 998,
    display: 'none',
  },
  viewLegendButtonsContainer: {
    display: 'flex',
    position: 'absolute',
    zIndex: 401,
    top: '0px',
    right: '0px',
  },
  viewLegendButtonsContainerFullscreen: {
    top: '8px',
    right: '8px',
  },
  mapTableToggleButtonGroup: {
    borderRadius: '0px 0px 2px 2px',
    backgroundColor: 'white',
    '& button': {
      borderTopLeftRadius: '0px !important',
      borderTopRightRadius: '0px !important',
    },
  },
  mapTableToggleButtonGroupFullscreen: {
    borderRadius: '2px',
    backgroundColor: 'white',
  },
  legendButton: {
    border: `1px solid ${Theme.palette.primary.main}`,
    borderRadius: '0px 0px 0px 2px',
  },
  legendButtonFullscreen: {
    border: `1px solid ${Theme.palette.primary.main}`,
  },
  unselectablesButton: {
    border: `1px solid ${Theme.palette.primary.main}`,
    borderRadius: '0px 0px 2px 2px',
  },
  unselectablesButtonFullscreen: {
    border: `1px solid ${Theme.palette.primary.main}`,
  },
  selectionSummaryContainer: {
    position: 'absolute',
    left: '8px',
    bottom: '8px',
    zIndex: 400,
  },
  selectionSummary: {
    position: 'absolute',
    bottom: theme.spacing(6),
    overflowY: 'auto',
    borderRadius: theme.spacing(2.5),
    '& .MuiListItemText-primary': {
      fontWeight: 600,
    },
    '& .MuiListItem-secondaryAction': {
      paddingRight: theme.spacing(9),
    },
    '& .MuiListItemIcon-root': {
      minWidth: 'unset',
    },
    '& .MuiListItemSecondaryAction-root': {
      right: theme.spacing(3),
    },
  },
  selectionSummaryValid: {
    border: `1px solid ${theme.palette.secondary.main}`,
    backgroundColor: theme.palette.grey[50],
  },
  selectionSummaryInvalid: {
    border: `1px solid ${theme.palette.error.light}`,
    backgroundColor: theme.palette.error.light,
  },
  summaryFeatureIcon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    marginRight: theme.spacing(1.5),
    filter: 'drop-shadow(0px 0px 1.5px #000000bb)',
  },
  selectionChip: {
    opacity: 1,
    fontSize: theme.spacing(2),
    height: theme.spacing(5),
    borderRadius: theme.spacing(2.5),
    padding: theme.spacing(0, 1),
    '& .MuiChip-label': {
      padding: theme.spacing(0, 2),
    },
  },
  selectionChipError: {
    backgroundColor: theme.palette.error.light,
    fontWeight: 600,
    '& .MuiChip-icon': {
      color: theme.palette.error.dark,
    },
  },
}));

const SiteMapContainer = (props) => {
  const classes = useStyles(Theme);
  const { unusableVerticalSpace = 0 } = props;

  const [neonContextState] = NeonContext.useNeonContextState();

  const [state, dispatch] = SiteMapContext.useSiteMapContext();

  // console.log('SITEMAP STATE:', state);
  const isLoading = state.overallFetch.expected !== state.overallFetch.completed;

  const {
    filters,
    fullscreen,
    aspectRatio,
    featureData,
    view: { current: view },
    selection: {
      set: selection,
      active: selectionActive,
      validSet: selectableItems,
      valid: selectionValid,
      limit: selectionLimit,
      hideUnselectable,
      showSummary,
    },
  } = state;

  const contentDivProps = {
    className: classes.contentContainer,
    style: { paddingBottom: `${(aspectRatio.currentValue || 0.75) * 100}%` },
  };

  const featuresRef = useRef(null);
  const containerDivRef = useRef(null);
  const contentDivRef = useRef(null);
  const resizeBorderRef = useRef(null);
  const resizeButtonRef = useRef(null);

  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));

  /**
     Vertical Resize Hooks
  */
  const [resizeDragging, setResizeDragging] = useState(false);
  const [dragStartY, setDragStartY] = useState(null);
  const dragDeltaY = useRef(null);
  const resizeVerticallyDragStart = useCallback((event) => {
    if (!resizeBorderRef.current || !contentDivRef.current) { return; }
    setDragStartY(event.clientY);
    setResizeDragging(true);
    dragDeltaY.current = 0;
    resizeBorderRef.current.style.display = 'block';
    resizeBorderRef.current.style.height = `${contentDivRef.current.clientHeight}px`;
  }, [setDragStartY, setResizeDragging, dragDeltaY]);
  const resizeVerticallyDrag = useCallback((event) => {
    if (
      !resizeDragging || !resizeBorderRef.current
        || dragStartY === null || event.clientY === 0
    ) { return; }
    dragDeltaY.current = event.clientY - dragStartY;
    const newHeight = Math.max(
      contentDivRef.current.clientHeight + dragDeltaY.current,
      MIN_CONTAINER_HEIGHT,
    );
    resizeBorderRef.current.style.height = `${newHeight}px`;
  }, [resizeDragging, dragStartY, dragDeltaY]);
  const resizeVerticallyDragEnd = useCallback(() => {
    const finalHeight = Math.max(
      contentDivRef.current.clientHeight + dragDeltaY.current,
      MIN_CONTAINER_HEIGHT,
    );
    setDragStartY(null);
    setResizeDragging(false);
    dragDeltaY.current = null;
    resizeBorderRef.current.style.display = 'none';
    resizeButtonRef.current.blur();
    const newAspectRatio = finalHeight / aspectRatio.widthReference;
    dispatch({
      type: 'setAspectRatio',
      aspectRatio: newAspectRatio,
      widthReference: aspectRatio.widthReference,
    });
  }, [
    aspectRatio.widthReference,
    dispatch,
    setDragStartY,
    setResizeDragging,
    dragDeltaY,
  ]);

  /**
     Effect - Register event listener to dynamically adjust aspect ratio from viewport dimensions
  */
  useLayoutEffect(() => {
    const handleResize = debounce(() => {
      let newAspectRatio = aspectRatio.isDynamic
        ? getDynamicAspectRatio(unusableVerticalSpace)
        : aspectRatio.currentValue;
      if (fullscreen && containerDivRef.current && contentDivRef.current) {
        const boundingClientRect = contentDivRef.current.getBoundingClientRect();
        const targetHeight = Math.max(window.innerHeight - boundingClientRect.y - 1, 0);
        const targetWidth = boundingClientRect.height + boundingClientRect.y > window.innerHeight
          ? window.innerWidth
          : contentDivRef.current.clientWidth;
        newAspectRatio = targetHeight / targetWidth;
        containerDivRef.current.style.height = `calc(100vh - ${boundingClientRect.y}px)`;
        containerDivRef.current.style.overflowY = 'hidden';
      }
      dispatch({
        type: 'setAspectRatio',
        aspectRatio: newAspectRatio,
        widthReference: contentDivRef.current ? contentDivRef.current.clientWidth : 0,
      });
    }, 10);
    if (
      (!aspectRatio.isDynamic || aspectRatio.currentValue !== null) && !fullscreen
    ) { return () => {}; }
    handleResize();
    if (
      (!aspectRatio.isDynamic || aspectRatio.resizeEventListenerInitialized) && !fullscreen
    ) { return () => {}; }
    window.addEventListener('resize', handleResize);
    dispatch({ type: 'setAspectRatioResizeEventListenerInitialized' });
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [
    unusableVerticalSpace,
    aspectRatio,
    fullscreen,
    dispatch,
  ]);

  /**
     Effect - Monitor all click events and close the features pane if open and clicked outside
     and not in the content area (map or table)
  */
  useEffect(() => {
    if (!state.filters.features.open || !featuresRef.current) { return () => {}; }
    const handleClick = (event) => {
      if (
        featuresRef.current && !featuresRef.current.contains(event.target)
          && contentDivRef.current && !contentDivRef.current.contains(event.target)
      ) {
        dispatch({ type: 'setFilterFeaturesOpen', open: false });
      }
    };
    document.addEventListener('click', handleClick);
    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [
    state.filters.features.open,
    featuresRef,
    contentDivRef,
    dispatch,
  ]);

  /**
     Effect - If NeonContext Data is now available and has not been hydrated into state then do so.
  */
  useEffect(() => {
    if (state.neonContextHydrated || !(neonContextState.isFinal && !neonContextState.hasError)) {
      return;
    }
    dispatch({
      type: 'hydrateNeonContextData',
      neonContextData: neonContextState.data,
    });
  }, [
    state.neonContextHydrated,
    neonContextState.isFinal,
    neonContextState.hasError,
    neonContextState.data,
    dispatch,
  ]);

  const containerProps = {
    ref: containerDivRef,
    className: classes.outerContainer,
    'aria-busy': isLoading ? 'true' : 'false',
    'data-selenium': 'siteMap-container',
  };

  /**
     Render - Loading Sites
  */
  if (!neonContextState.isFinal) {
    return (
      <div {...containerProps}>
        <div ref={contentDivRef} {...contentDivProps}>
          <Paper className={classes.contentPaper}>
            <Typography variant="h6" component="h3" gutterBottom>
              Loading Sites...
            </Typography>
            <CircularProgress />
          </Paper>
        </div>
      </div>
    );
  }

  /**
     Render - Error (sites did not loaded)
  */
  if (neonContextState.hasError) {
    return (
      <div {...containerProps}>
        <div ref={contentDivRef} {...contentDivProps}>
          <Paper className={classes.contentPaper}>
            <WarningIcon fontSize="large" color="error" />
            <Typography variant="h6" component="h3" style={{ marginTop: Theme.spacing(1) }}>
              {`Unable to load sites: ${neonContextState.fetches.sites.error}`}
            </Typography>
          </Paper>
        </div>
      </div>
    );
  }

  /**
     Render - Map/Table Toggle Button Group
  */
  const renderMapTableToggleButtonGroup = () => {
    const viewTooltips = {
      [VIEWS.MAP]: 'Show the observatory map',
      [VIEWS.TABLE]: 'Show a table of all locations currently visible in the map',
    };
    return (
      <ToggleButtonGroup
        exclusive
        color="primary"
        variant="outlined"
        value={view}
        onChange={(event, newView) => dispatch({ type: 'setView', view: newView })}
        className={(
          fullscreen
            ? classes.mapTableToggleButtonGroupFullscreen
            : classes.mapTableToggleButtonGroup
        )}
      >
        {Object.keys(VIEWS).map(key => (
          <Tooltip
            key={key}
            title={viewTooltips[key]}
            enterDelay={500}
            enterNextDelay={200}
            placement={fullscreen ? 'bottom-end' : 'top-end'}
          >
            <ToggleButton
              value={key}
              selected={state.view.current === key}
              data-selenium={`sitemap-viewButton-${key}`}
            >
              {key}
            </ToggleButton>
          </Tooltip>
        ))}
      </ToggleButtonGroup>
    );
  };

  /**
     Render - Legend Button
  */
  const renderLegendButton = () => {
    const buttonStyle = filters.features.open ? {} : { backgroundColor: 'white' };
    return (
      <div style={{ borderRadius: '2px', marginLeft: Theme.spacing(1) }}>
        <Tooltip
          enterDelay={500}
          enterNextDelay={200}
          title={`${filters.features.open ? 'Hide' : 'Show'} the legend`}
          placement={fullscreen ? 'bottom-end' : 'top-end'}
        >
          <Button
            color="primary"
            style={buttonStyle}
            variant={filters.features.open ? 'contained' : 'outlined'}
            endIcon={filters.features.open ? <ExpandUpIcon /> : <ExpandDownIcon />}
            data-selenium="sitemap-legendButton"
            className={fullscreen ? classes.legendButtonFullscreen : classes.legendButton}
            onClick={() => {
              dispatch({ type: 'setFilterFeaturesOpen', open: !filters.features.open });
            }}
          >
            {belowMd ? <LegendIcon style={{ fontSize: '20px' }} /> : 'Legend'}
          </Button>
        </Tooltip>
      </div>
    );
  };

  /**
     Render - Unselectables Button
  */
  const renderUnselectablesButton = () => {
    if (!selectionActive || !selectableItems) { return null; }
    const buttonStyle = hideUnselectable ? { backgroundColor: 'white' } : {};
    const items = selectionActive.toLowerCase().replace('_', '');
    const title = `Click to ${hideUnselectable ? 'show' : 'hide'} ${items} that are not selectable`;
    return (
      <div style={{ borderRadius: '2px', marginRight: Theme.spacing(1) }}>
        <Tooltip
          enterDelay={500}
          enterNextDelay={200}
          title={title}
          placement={fullscreen ? 'bottom-end' : 'top-end'}
        >
          <Button
            color="primary"
            style={buttonStyle}
            variant={hideUnselectable ? 'outlined' : 'contained'}
            startIcon={hideUnselectable ? <HideIcon /> : <ShowIcon />}
            data-selenium="sitemap-unselectablesButton"
            aria-label={title}
            className={(
              fullscreen
                ? classes.unselectablesButtonFullscreen
                : classes.unselectablesButton
            )}
            onClick={() => {
              dispatch({ type: 'setHideUnselectable', hideUnselectable: !hideUnselectable });
            }}
          >
            {belowMd ? <UnselectableIcon style={{ fontSize: '20px' }} /> : 'Unselectable'}
          </Button>
        </Tooltip>
      </div>
    );
  };

  /**
     Helper Functions - Selection Summary
  */
  const getSelectedItemFeatureKey = (item) => {
    if (!selectionActive) { return null; }
    return Object.keys(featureData[selectionActive]).find(key => (
      Object.keys(featureData[selectionActive][key]).includes(item)
    )) || null;
  };

  const getSelectedItemIcon = (item) => {
    if (!selectionActive) { return null; }
    const featureKey = getSelectedItemFeatureKey(item);
    if (!featureKey) { return null; }
    return FEATURES[featureKey].iconSvg || null;
  };

  const getSelectedItemDescription = (item) => {
    if (!selectionActive) { return null; }
    const featureKey = getSelectedItemFeatureKey(item);
    if (!featureKey) { return null; }
    if (selectionActive === FEATURE_TYPES.SITES) {
      return featureData[selectionActive][featureKey][item].description;
    }
    return null;
  };

  /**
     Render - Selection Summary
  */
  const renderSelectionSummary = () => {
    if (!selectionActive) { return null; }
    const unit = selectionActive === FEATURE_TYPES.SITES ? 'site' : 'location';
    const s = selection.size === 1 ? '' : 's';
    const title = `${selection.size ? selection.size.toString() : 'No'} ${unit}${s} selected`;
    let icon = <NoneSelectedIcon />;
    let color = 'default';
    if (selection.size) {
      if (selectionValid) {
        icon = <DoneIcon />;
        color = 'secondary';
      } else {
        icon = <ErrorIcon />;
      }
    }
    let limit = null;
    if (Number.isFinite(selectionLimit)) {
      limit = `${selectionLimit} required`;
    }
    if (Array.isArray(selectionLimit)) {
      if (selectionLimit[0] === 1) {
        limit = `select up to ${selectionLimit[1]}`;
      } else {
        limit = `min ${selectionLimit[0]}; max ${selectionLimit[1]}`;
      }
    }
    const summaryContainerStyle = {};
    if (view === VIEWS.MAP) { summaryContainerStyle.left = '108px'; }
    const chipClassName = !selection.size || selectionValid
      ? classes.selectionChip
      : `${classes.selectionChip} ${classes.selectionChipError}`;
    const summaryValidClass = selection.size && selectionValid
      ? classes.selectionSummaryValid
      : classes.selectionSummaryInvalid;
    const summaryClass = `${classes.selectionSummary} ${summaryValidClass}`;
    let maxHeight = 72 * 3;
    if (contentDivRef && contentDivRef.current) {
      maxHeight = Math.max((contentDivRef.current.clientHeight || 0) - 72 * 2, 72 * 3);
      maxHeight -= (maxHeight % 72);
    }
    maxHeight = Math.min(maxHeight, selection.size * 72);
    const summaryStyle = { maxHeight: `${maxHeight}px` };
    return (
      <div className={classes.selectionSummaryContainer} style={summaryContainerStyle}>
        <Zoom in={showSummary} mountOnEnter unmountOnExit>
          <div className={summaryClass} style={summaryStyle}>
            <List dense>
              {[...selection].map((selectedItem) => {
                const src = getSelectedItemIcon(selectedItem);
                const remove = `Remove ${selectedItem} from selection`;
                return (
                  <ListItem key={selectedItem}>
                    {!src ? null : (
                      <ListItemIcon>
                        <img alt={selectedItem} src={src} className={classes.summaryFeatureIcon} />
                      </ListItemIcon>
                    )}
                    <ListItemText
                      primary={selectedItem}
                      secondary={getSelectedItemDescription(selectedItem)}
                    />
                    <ListItemSecondaryAction>
                      <Tooltip title={remove} placement="right">
                        <IconButton
                          edge="end"
                          aria-label={remove}
                          onClick={() => dispatch({ type: 'toggleSiteSelected', site: selectedItem })}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </ListItemSecondaryAction>
                  </ListItem>
                );
              })}
            </List>
          </div>
        </Zoom>
        <Chip
          icon={icon}
          color={color}
          label={limit ? `${title} (${limit})` : title}
          aria-label="Current selection status"
          className={chipClassName}
          onClick={() => dispatch({ type: 'toggleSelectionSummary', showSummary: !showSummary })}
          deleteIcon={(
            <Tooltip title="Deselect all">
              <CancelIcon />
            </Tooltip>
          )}
          onDelete={(
            selection.size
              ? () => dispatch({ type: 'updateSitesSelection', selection: new Set() })
              : () => {}
          )}
        />
      </div>
    );
  };

  /**
     Render - Vertical resize Elements
  */
  const renderVerticalResizeButton = () => (fullscreen ? null : (
    <Tooltip placement="left" title={`Resize ${view === VIEWS.MAP ? 'map' : 'table'} vertically`}>
      <IconButton
        draggable
        type="button"
        ref={resizeButtonRef}
        className={classes.resizeButton}
        onDragStart={resizeVerticallyDragStart}
        onDrag={resizeVerticallyDrag}
        onDragEnd={resizeVerticallyDragEnd}
      >
        <VertResizeIcon fontSize="small" />
      </IconButton>
    </Tooltip>
  ));

  /**
     Render - Single Feature Option
  */
  const renderFeatureOption = (key) => {
    if (!FEATURES[key]) { return null; }
    const feature = FEATURES[key];
    const {
      name: featureName,
      iconSvg,
      featureShape,
      style: featureStyle = {},
      description,
      descriptionFromParentDataFeatureKey,
      parentDataFeatureKey,
    } = feature;
    const handleChange = (event) => {
      dispatch({
        type: 'setFilterFeatureVisibility',
        feature: key,
        visible: event.target.checked,
      });
    };
    let icon = null;
    if (iconSvg) {
      icon = <img alt={featureName} src={iconSvg} className={classes.featureIcon} />;
    } else if (featureShape === 'Circle') {
      const circleProps = {
        cx: 14,
        cy: 14,
        r: 8,
        style: {
          fill: featureStyle.color ? `${featureStyle.color}88` : 'none',
          stroke: featureStyle.color || null,
          strokeWidth: 3,
        },
      };
      icon = (
        <svg width="28" height="28" className={classes.featureIcon}>
          <circle {...circleProps} />
        </svg>
      );
    } else if (featureShape === 'Polyline') {
      const polylineProps = {
        points: '1.5,21.5 15,18.5 13,9.5 26.5,6.5',
        style: {
          fill: 'none',
          stroke: featureStyle.color || null,
          strokeWidth: 3,
          strokeLinejoin: 'bevel',
        },
      };
      icon = (
        <svg width="28" height="28" className={classes.featureIcon}>
          <polyline {...polylineProps} />
        </svg>
      );
    } else if (featureShape === 'Polygon') {
      const rectProps = {
        width: 25,
        height: 15,
        x: 1.5,
        y: 6.5,
        rx: 3,
        style: {
          fill: featureStyle.color || null,
          stroke: featureStyle.color || null,
          strokeWidth: 2.5,
          fillOpacity: 0.2,
          strokeOpacity: 0.85,
          strokeLinecap: 'round',
          strokeDasharray: featureStyle.dashArray || null,
        },
      };
      icon = (
        <svg width="28" height="28" className={classes.featureIcon}>
          <rect {...rectProps} />
        </svg>
      );
    }
    let allChildren = [];
    let visibleChildren = [];
    let indeterminate = false;
    let collapsed = false;
    let label = null;
    let tooltip = null;
    if (description) { tooltip = description; }
    if (
      descriptionFromParentDataFeatureKey
        && parentDataFeatureKey && FEATURES[parentDataFeatureKey]
    ) {
      tooltip = FEATURES[parentDataFeatureKey].description || null;
    }
    if (feature.type === FEATURE_TYPES.GROUP) {
      collapsed = state.filters.features.collapsed.has(key);
      const collapseTitle = `${collapsed ? 'Expand' : 'Collapse'} ${feature.name}`;
      allChildren = Object.keys(FEATURES).filter(f => FEATURES[f].parent === key);
      allChildren.sort((a, b) => {
        const { type: aType, name: aName } = FEATURES[a];
        const { type: bType, name: bName } = FEATURES[b];
        if (aType !== bType && (aType === FEATURE_TYPES.GROUP || bType === FEATURE_TYPES.GROUP)) {
          return (bType === FEATURE_TYPES.GROUP ? -1 : 1);
        }
        return (aName < bName ? -1 : 1);
      });
      visibleChildren = allChildren.filter(f => state.filters.features.visible[f]);
      indeterminate = visibleChildren.length > 0 && visibleChildren.length < allChildren.length;
      label = (
        <div className={classes.featureOptionLabel} style={{ justifyContent: 'space-between' }}>
          <span style={{ fontWeight: 600 }}>
            {feature.name}
          </span>
          <Tooltip title={collapseTitle}>
            <IconButton
              size="small"
              aria-label={collapseTitle}
              style={{ marginLeft: Theme.spacing(1) }}
              onClick={(event) => {
                event.preventDefault();
                // We use setTimeout here so the icon doesn't change before the click event bubbles.
                // Without it the target of the click event is an SVG that no longer exists in the
                // DOM tree (thus not contained in the features container, thus seen as a click
                // outside that will close the features container, when we know it's not).
                window.setTimeout(() => {
                  dispatch({
                    type: `setFilterFeature${collapsed ? 'Expanded' : 'Collapsed'}`,
                    feature: key,
                  });
                }, 0);
              }}
            >
              {collapsed ? (
                <LeftArrowIcon fontSize="inherit" />
              ) : (
                <DownArrowIcon fontSize="inherit" />
              )}
            </IconButton>
          </Tooltip>
        </div>
      );
    } else {
      label = (
        <div className={classes.featureOptionLabel}>
          {icon}
          <span>
            {feature.name}
          </span>
        </div>
      );
    }
    const formControl = (
      <FormControlLabel
        key={key}
        label={label}
        aria-label={tooltip}
        className={classes.featureOptionFormControlLabel}
        control={(
          <Checkbox
            checked={state.filters.features.visible[key]}
            onChange={handleChange}
            color="primary"
            indeterminate={indeterminate}
          />
        )}
      />
    );
    return (
      <div key={key} style={{ width: '100%' }}>
        {tooltip ? (
          <Tooltip
            title={tooltip}
            placement="bottom-start"
            TransitionComponent={({ children }) => children} // set no transition by mock component
          >
            {formControl}
          </Tooltip>
        ) : formControl}
        {!allChildren.length ? null : (
          <div style={{ marginLeft: Theme.spacing(3), display: collapsed ? 'none' : 'block' }}>
            {allChildren
              .filter(f => state.filters.features.available[f])
              .map(renderFeatureOption)}
          </div>
        )}
      </div>
    );
  };

  /**
     Render - Full Component
  */
  let featuresContainerClassName = classes.featuresContainer;
  let viewLegendButtonsContainerClassName = classes.viewLegendButtonsContainer;
  if (fullscreen) {
    /* eslint-disable max-len */
    featuresContainerClassName = `${classes.featuresContainer} ${classes.featuresContainerFullscreen}`;
    viewLegendButtonsContainerClassName = `${classes.viewLegendButtonsContainer} ${classes.viewLegendButtonsContainerFullscreen}`;
    /* eslint-enable max-len */
  }
  return (
    <div {...containerProps} aria-describedby={progressId}>
      <div ref={contentDivRef} {...contentDivProps}>
        {view === VIEWS.MAP ? <SiteMapLeaflet /> : null }
        {view === VIEWS.TABLE ? <SiteMapTable /> : null }
        {renderVerticalResizeButton()}
        <div
          ref={featuresRef}
          className={featuresContainerClassName}
          style={{ display: state.filters.features.open ? 'flex' : 'none' }}
        >
          {Object.keys(FEATURES)
            .filter(f => state.filters.features.available[f] && !FEATURES[f].parent)
            .map(renderFeatureOption)}
        </div>
        <div className={viewLegendButtonsContainerClassName}>
          {renderUnselectablesButton()}
          {renderMapTableToggleButtonGroup()}
          {renderLegendButton()}
        </div>
        {renderSelectionSummary()}
      </div>
      {fullscreen ? null : <div ref={resizeBorderRef} className={classes.resizeBorder} />}
    </div>
  );
};

SiteMapContainer.propTypes = {
  unusableVerticalSpace: PropTypes.number,
};

SiteMapContainer.defaultProps = {
  unusableVerticalSpace: 0,
};

export default SiteMapContainer;
