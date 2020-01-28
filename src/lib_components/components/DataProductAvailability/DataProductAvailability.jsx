import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react';
import PropTypes from 'prop-types';

import { uniqueId } from 'lodash';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';

import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import Grid from '@material-ui/core/Grid';
import Hidden from '@material-ui/core/Hidden';
import MenuItem from '@material-ui/core/MenuItem';
import OutlinedInput from '@material-ui/core/OutlinedInput';
import Select from '@material-ui/core/Select';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import Typography from '@material-ui/core/Typography';

import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import AscIcon from '@material-ui/icons/ArrowDownward';
import DescIcon from '@material-ui/icons/ArrowUpward';

import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import moment from 'moment';

import { AvailabilityGrid, SVG } from './AvailabilityGrid';
import AvailabilityLegend from './AvailabilityLegend';

import Theme from '../Theme/Theme';
import SiteChip from '../SiteChip/SiteChip';
import FullWidthVisualization from '../FullWidthVisualization/FullWidthVisualization';
import DownloadDataContext from '../DownloadDataContext/DownloadDataContext';

/**
   Setup: Chart y-range values
   All possible sites, states, and domains, independent of product
   **
   Currently loaded from static JSON since API response is
   enormous, containing lots of data we don't need.
   TODO: get this lean data from a GraphQL request
*/
import allSites from '../../static/sites/sites.json';
import allStates from '../../static/states/states.json';
import allDomains from '../../static/domains/domains.json';

const getYearMonthMoment = yearMonth => moment(`${yearMonth}-01`);

/**
   Setup: CSS classes
*/
const svgMinWidth = (SVG.CELL_WIDTH + SVG.CELL_PADDING) * SVG.MIN_CELLS
  + Math.floor(SVG.MIN_CELLS / 12) * SVG.YEAR_PADDING;
const svgMinHeight = (SVG.CELL_HEIGHT + SVG.CELL_PADDING) * (SVG.MIN_ROWS + 1);
const useStyles = makeStyles(theme => ({
  viewButtonGroup: {
    height: theme.spacing(4),
  },
  viewButtonGroupXsmall: {
    height: theme.spacing(3),
  },
  viewButton: {
    height: theme.spacing(4),
    fontWeight: 700,
    color: theme.palette.primary.main,
    borderColor: theme.palette.primary.main,
    padding: theme.spacing(0, 2),
    whiteSpace: 'nowrap',
  },
  viewButtonXsmall: {
    height: theme.spacing(3),
    fontWeight: 600,
    padding: theme.spacing(0, 1.5),
  },
  // Use !important here to override the Mui-selected class with higher priority
  viewButtonSelected: {
    color: '#fff !important',
    backgroundColor: `${theme.palette.primary.main} !important`,
  },
  svg: {
    minWidth: `${svgMinWidth}px`,
    minHeight: `${svgMinHeight}px`,
  },
  topFormHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  h5Small: {
    fontSize: '1.075rem',
  },
  h6Small: {
    fontSize: '0.95rem',
  },
  xsSelect: {
    '& div': {
      padding: Theme.spacing(1, 3, 1, 1.5),
    },
  },
  sortSelect: {
    height: theme.spacing(6),
    '& div': {
      paddingRight: Theme.spacing(4.5),
    },
  },
  sortToggleButtonGroup: {
    marginLeft: theme.spacing(2),
  },
}));

const useSiteChipStyles = makeStyles(theme => ({
  deleteIcon: {
    marginLeft: theme.spacing(-0.25),
  },
}));

const SORT_METHODS = {
  states: {
    label: 'by State',
    getSortFunction: ret => (a, b) => {
      const aState = allStates[allSites[a].stateCode].name;
      const bState = allStates[allSites[b].stateCode].name;
      if (aState === bState) { return (a < b ? ret[0] : ret[1]); }
      return aState < bState ? ret[0] : ret[1];
    },
  },
  domains: {
    label: 'by Domain',
    getSortFunction: ret => (a, b) => {
      const aDomain = allSites[a].domainCode;
      const bDomain = allSites[b].domainCode;
      if (aDomain === bDomain) { return (a < b ? ret[0] : ret[1]); }
      return aDomain < bDomain ? ret[0] : ret[1];
    },
  },
  sites: {
    label: 'by Site',
    getSortFunction: ret => (a, b) => (a < b ? ret[0] : ret[1]),
  },
};
const SORT_DIRECTIONS = ['ASC', 'DESC'];

/**
   Main Function
*/
export default function DataProductAvailability(props) {
  const classes = useStyles(Theme);
  const siteChipClasses = useSiteChipStyles(Theme);
  const { ...other } = props;
  const belowSm = useMediaQuery(Theme.breakpoints.down('sm'));

  /**
     State: Views
     Contain and sort the availability data.
     Afford different methods for presenting/grouping data along the y-axis (geospatial)
  */
  const views = {
    summary: {
      view: 'summary',
      name: 'Summary',
      selectable: true,
      rows: {
        summary: {},
      },
      getLabel: {
        text: () => 'ALL ',
        title: () => 'All Sites',
      },
    },
    sites: {
      view: 'sites',
      name: 'Site',
      selectable: true,
      rows: {},
      getLabel: {
        text: key => key,
        title: key => allSites[key].description,
      },
    },
    states: {
      view: 'states',
      name: 'State',
      selectable: true,
      rows: {},
      getLabel: {
        text: key => ` ${key} `,
        title: key => allStates[key].name,
      },
    },
    domains: {
      view: 'domains',
      name: 'Domain',
      selectable: true,
      rows: {},
      getLabel: {
        text: key => `${key} `,
        title: key => allDomains[key].name,
      },
    },
    ungrouped: {
      view: 'ungrouped',
      name: 'Ungrouped',
      selectable: false,
      getLabel: {
        text: key => `${allSites[key].stateCode}-${allSites[key].domainCode}-${key}`,
        title: (key) => {
          const siteTitle = allSites[key].description;
          const domainTitle = allDomains[allSites[key].domainCode].name;
          const stateTitle = allStates[allSites[key].stateCode].name;
          return `${stateTitle} - ${domainTitle} - ${siteTitle}`;
        },
      },
    },
  };
  views.ungrouped.rows = views.sites.rows;
  const selectableViewKeys = Object.keys(views).filter(key => views[key].selectable);

  /**
     State: Context-Derived Stuff
  */
  const [
    {
      downloadContextIsActive,
      requiredSteps,
      productData,
      sites,
      dateRange,
      availabilityView: contextView,
      availabilitySortMethod: contextSortMethod,
      availabilitySortDirection: contextSortDirection,
      availabilitySelectionExpanded: selectionExpanded,
    },
    dispatchSelection,
  ] = DownloadDataContext.useDownloadDataState();

  const { disableSelection } = props;
  const selectionEnabled = !disableSelection
    && requiredSteps.some(step => step.key === 'sitesAndDateRange');

  /**
     State: Current View
     Track the current view as local state and feed its initial value from the
     initialView prop. This covers the use case when the availability chart does
     NOT appear inside a Download Data Context. When in a context, however, the
     context overrides the current view as it is keeping track of the broader
     download workflow state.
  */
  const { view: propsView } = props;
  const initialView = downloadContextIsActive ? contextView : propsView;
  const [currentView, setCurrentView] = useState(initialView);

  /**
     State: Current Sort Method and Sort Direction
     Only applies for "ungrouped" view mode.
  */
  const { sortMethod: propsSortMethod } = props;
  const initialSortMethod = (
    downloadContextIsActive ? contextSortMethod : propsSortMethod
  ) || 'states';
  const [currentSortMethod, setCurrentSortMethod] = useState(initialSortMethod);
  const { sortDirection: propsSortDirection } = props;
  const initialSortDirection = (
    downloadContextIsActive ? contextSortDirection : propsSortDirection
  ) || 'ASC';
  const [currentSortDirection, setCurrentSortDirection] = useState(initialSortDirection);

  const setSitesValue = useCallback(sitesValue => dispatchSelection({
    type: 'setValidatableValue',
    key: 'sites',
    value: sitesValue,
  }), [dispatchSelection]);
  const setDateRangeValue = useCallback(dateRangeValue => dispatchSelection({
    type: 'setValidatableValue',
    key: 'dateRange',
    value: dateRangeValue,
  }), [dispatchSelection]);
  const handleSelectAllSites = () => {
    setSitesValue(sites.validValues);
  };
  const handleSelectNoneSites = () => {
    setSitesValue([]);
  };
  const handleSelectAllDateRange = () => {
    setDateRangeValue(dateRange.validValues);
  };
  const handleSelectLatestYearDateRange = () => {
    const start = getYearMonthMoment(dateRange.validValues[1]).subtract(11, 'months').format('YYYY-MM');
    setDateRangeValue([
      start < dateRange.validValues[0] ? dateRange.validValues[0] : start,
      dateRange.validValues[1],
    ]);
  };
  const handleChangeStartDate = (newStartDate) => {
    setDateRangeValue([
      newStartDate.format('YYYY-MM'),
      dateRange.value[1],
    ]);
  };
  const handleChangeEndDate = (newEndDate) => {
    setDateRangeValue([
      dateRange.value[0],
      newEndDate.format('YYYY-MM'),
    ]);
  };
  const handleToggleSelectionExpanded = currentSelectionExpanded => dispatchSelection({
    type: 'setAvailabilitySelectionExpanded',
    value: !currentSelectionExpanded,
  });
  const handleChangeView = (event, newView) => {
    if (
      !selectableViewKeys.includes(newView)
      || currentView === newView
    ) { return; }
    if (downloadContextIsActive) {
      dispatchSelection({
        type: 'setAvailabilityView',
        value: newView,
      });
    }
    setCurrentView(newView);
  };

  let sortedSites = [];
  const applySort = () => {
    if (currentView !== 'ungrouped') { return; }
    const sortReturns = [
      currentSortDirection === 'ASC' ? -1 : 1,
      currentSortDirection === 'ASC' ? 1 : -1,
    ];
    sortedSites = Object.keys(views.ungrouped.rows);
    sortedSites.sort(SORT_METHODS[currentSortMethod].getSortFunction(sortReturns));
  };
  const handleChangeSortMethod = (event) => {
    const newSortMethod = event.target.value;
    if (
      !Object.keys(SORT_METHODS).includes(newSortMethod)
      || currentSortMethod === newSortMethod
    ) { return; }
    if (downloadContextIsActive) {
      dispatchSelection({
        type: 'setAvailabilitySortMethod',
        value: newSortMethod,
      });
    }
    setCurrentSortMethod(newSortMethod);
    applySort();
  };
  const handleChangeSortDirection = (event, newSortDirection) => {
    if (
      !SORT_DIRECTIONS.includes(newSortDirection)
      || currentSortDirection === newSortDirection
    ) { return; }
    if (downloadContextIsActive) {
      dispatchSelection({
        type: 'setAvailabilitySortDirection',
        value: newSortDirection,
      });
    }
    setCurrentSortDirection(newSortDirection);
    applySort();
  };

  /**
     Product Data: Map to Views
     Statically loaded in via props or pulled from context. If both, props wins.
     Should not change in render lifecycle.
     Create mappings of the shape row => year-month => status for
     all aggregation views.
     TODO: Add other statuses. Currently the only status is "available".
  */
  let siteCodes = [];
  const { siteCodes: propsSiteCodes } = props;
  const { siteCodes: contextSiteCodes } = productData;
  if (propsSiteCodes && propsSiteCodes.length) {
    siteCodes = propsSiteCodes;
  } else if (contextSiteCodes && contextSiteCodes.length) {
    siteCodes = contextSiteCodes;
  }
  siteCodes.forEach((site) => {
    const { siteCode, availableMonths } = site;
    const { stateCode, domainCode } = allSites[siteCode];
    if (!selectionEnabled) { sites.validValues.push(siteCode); }
    views.sites.rows[siteCode] = {};
    views.states.rows[stateCode] = views.states.rows[stateCode] || {};
    views.domains.rows[domainCode] = views.domains.rows[domainCode] || {};
    availableMonths.forEach((month) => {
      views.summary.rows.summary[month] = 'available';
      views.sites.rows[siteCode][month] = 'available';
      views.states.rows[stateCode][month] = 'available';
      views.domains.rows[domainCode][month] = 'available';
    });
  });
  if (!selectionEnabled) {
    const summaryMonths = Object.keys(views.summary.rows.summary).sort();
    dateRange.validValues[0] = summaryMonths[0]; // eslint-disable-line prefer-destructuring
    dateRange.validValues[1] = summaryMonths.pop();
  }

  /**
     Selection Collapse
  */
  const { disableSelectionCollapse } = props;
  const absoluteSelectionExpanded = selectionExpanded || disableSelectionCollapse;

  /**
     Redraw setup
  */
  const svgRef = useRef(null);

  const handleSvgRedraw = useCallback(() => {
    AvailabilityGrid({
      data: views[currentView],
      svgRef,
      sites,
      sortedSites,
      setSitesValue,
      dateRange,
      setDateRangeValue,
      selectionEnabled,
    });
  }, [
    svgRef,
    views,
    currentView,
    sites,
    sortedSites,
    setSitesValue,
    dateRange,
    setDateRangeValue,
    selectionEnabled,
  ]);

  useEffect(() => {
    applySort();
    handleSvgRedraw();
  });

  const getOptionsContainerStyle = () => (
    selectionEnabled ? {
      textAlign: (!absoluteSelectionExpanded && !belowSm ? 'right' : 'left'),
    } : {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
    }
  );

  const getOptionsTitle = (variant = 'View') => {
    if (!['View', 'Sort'].includes(variant)) { return null; }
    return selectionEnabled ? (
      <div style={{ height: '30px' }}>
        <Typography variant="h5" className={classes.h5Small}>
          {`${variant} Availability By`}
        </Typography>
      </div>
    ) : (
      <Typography variant="subtitle1" style={{ marginRight: Theme.spacing(1.5) }}>
        {`${variant} Availability By:`}
      </Typography>
    );
  };

  /**
     Render: View Input
  */
  const renderViewOptions = () => {
    const renderToggleButton = (key) => {
      let className = classes.viewButton;
      if (!selectionEnabled) {
        className = `${className} ${classes.viewButtonXsmall}`;
      }
      if (key === currentView) {
        className = `${className} ${classes.viewButtonSelected}`;
      }
      return (
        <ToggleButton key={key} value={key} size="small" className={className}>
          {views[key].name}
        </ToggleButton>
      );
    };
    return (
      <div
        style={getOptionsContainerStyle()}
        data-selenium="data-product-availability.view-options"
      >
        {getOptionsTitle('View')}
        <Hidden xsDown key="viewSmUp">
          <ToggleButtonGroup
            exclusive
            color="primary"
            variant="outlined"
            size="small"
            className={selectionEnabled ? classes.viewButtonGroup : classes.viewButtonGroupXsmall}
            value={currentView}
            onChange={handleChangeView}
          >
            {selectableViewKeys.map(key => renderToggleButton(key))}
          </ToggleButtonGroup>
        </Hidden>
        <Hidden smUp key="viewXs">
          <FormControl variant="filled">
            <Select
              value={currentView}
              onChange={event => handleChangeView(event, event.target.value)}
              input={<OutlinedInput margin="dense" className={selectionEnabled ? null : classes.xsSelect} />}
              variant="filled"
            >
              {selectableViewKeys.map(key => (
                <MenuItem key={key} value={key}>{views[key].name}</MenuItem>
              ))}
            </Select>
          </FormControl>
        </Hidden>
      </div>
    );
  };

  /**
     Render: Sort Options
  */
  const renderSortOptions = () => (
    <div
      style={getOptionsContainerStyle()}
      data-selenium="data-product-availability.sort-options"
    >
      {getOptionsTitle('Sort')}
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <FormControl variant="outlined">
          <Select
            value={currentSortMethod}
            aria-label="Sort Method"
            className={classes.sortSelect}
            onChange={handleChangeSortMethod}
            data-selenium="data-product-availability.sort-options.method"
          >
            {Object.keys(SORT_METHODS).map(method => (
              <MenuItem
                key={method}
                value={method}
              >
                {SORT_METHODS[method].label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <ToggleButtonGroup
          exclusive
          value={currentSortDirection}
          className={classes.sortToggleButtonGroup}
          onChange={handleChangeSortDirection}
          data-selenium="data-product-availability.sort-options.direction"
        >
          <ToggleButton
            value={SORT_DIRECTIONS[0]}
            aria-label="Sort Ascending"
          >
            <AscIcon />
          </ToggleButton>
          <ToggleButton
            value={SORT_DIRECTIONS[1]}
            aria-label="Sort Descending"
          >
            <DescIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </div>
    </div>
  );

  /**
     Render: Selection
  */
  const renderSelection = () => {
    if (!selectionEnabled) { return null; }

    const selectionButtonLabel = absoluteSelectionExpanded
      ? 'hide selection details'
      : 'show seleciton details';

    const sitesPlural = sites.value.length > 1 ? 's' : '';
    const humanDateRange = `${getYearMonthMoment(dateRange.value[0]).format('MMM YYYY')} - ${getYearMonthMoment(dateRange.value[1]).format('MMM YYYY')}`;
    const siteChipLabel = absoluteSelectionExpanded
      ? `${sites.value.length} site${sitesPlural}`
      : `${sites.value.length} site${sitesPlural} — ${humanDateRange}`;
    const divCollapsedStyle = {
      marginBottom: Theme.spacing(1),
    };
    const divExpandedStyle = {
      marginTop: Theme.spacing(1),
      marginBottom: Theme.spacing(1.5),
    };
    const clickProps = disableSelectionCollapse ? {} : {
      onClick: () => handleToggleSelectionExpanded(selectionExpanded),
    };
    const siteChip = (
      <div style={absoluteSelectionExpanded ? divExpandedStyle : divCollapsedStyle}>
        <SiteChip
          size={absoluteSelectionExpanded ? 'large' : 'medium'}
          classes={siteChipClasses}
          label={sites.value.length ? siteChipLabel : 'no sites selected'}
          variant={sites.value.length ? 'default' : 'outlined'}
          onDelete={sites.value.length ? handleSelectNoneSites : null}
          {...clickProps}
        />
      </div>
    );

    return (
      <React.Fragment>
        <div
          className={classes.topFormHeader}
          style={{ display: absoluteSelectionExpanded ? 'none' : 'flex' }}
          data-selenium="data-product-availability.selection-options"
        >
          <Typography variant="h5" className={classes.h5Small}>Selection</Typography>
          <IconButton
            size="small"
            style={{ marginLeft: Theme.spacing(1) }}
            title={selectionButtonLabel}
            aria-label={selectionButtonLabel}
            onClick={() => handleToggleSelectionExpanded(selectionExpanded)}
          >
            <ExpandMoreIcon />
          </IconButton>
        </div>
        {!absoluteSelectionExpanded ? siteChip : (
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} style={{ marginBottom: Theme.spacing(1) }}>
              <div className={classes.topFormHeader}>
                <Typography variant="h6" className={classes.h6Small}>Sites</Typography>
                {disableSelectionCollapse ? null : (
                  <IconButton
                    size="small"
                    style={{ marginLeft: Theme.spacing(1), paddingBottom: 0 }}
                    title={selectionButtonLabel}
                    aria-label={selectionButtonLabel}
                    onClick={() => handleToggleSelectionExpanded(selectionExpanded)}
                  >
                    <ExpandLessIcon />
                  </IconButton>
                )}
              </div>
              {siteChip}
              <div style={{ display: 'flex' }}>
                <Button
                  data-selenium="data-product-availability.select-all-sites-button"
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={handleSelectAllSites}
                >
                  Select All Sites
                </Button>
                {/* Show/enable when site selection widget exists and cab be used here */}
                <Button
                  data-selenium="data-product-availability.browse-sites-button"
                  size="small"
                  color="primary"
                  variant="outlined"
                  style={{ marginLeft: Theme.spacing(1), display: 'none' }}
                  disabled
                >
                  Browse Sites…
                </Button>
              </div>
            </Grid>
            <Grid item xs={12} sm={6} style={{ marginBottom: Theme.spacing(1) }}>
              <Typography variant="h6" className={classes.h6Small}>Date Range</Typography>
              <MuiPickersUtilsProvider utils={MomentUtils}>
                <div style={{ display: 'flex', flexWrap: 'nowrap' }}>
                  <DatePicker
                    data-selenium="data-product-availability.date-range-start"
                    inputVariant="outlined"
                    margin="dense"
                    value={getYearMonthMoment(dateRange.value[0])}
                    onChange={newDate => handleChangeStartDate(newDate)}
                    views={['month', 'year']}
                    label="Start"
                    openTo="month"
                    minDate={getYearMonthMoment(dateRange.validValues[0])}
                    maxDate={getYearMonthMoment(dateRange.value[1])}
                    style={{ marginRight: Theme.spacing(1.5) }}
                  />
                  <DatePicker
                    data-selenium="data-product-availability.date-range-end"
                    inputVariant="outlined"
                    margin="dense"
                    value={getYearMonthMoment(dateRange.value[1])}
                    onChange={newDate => handleChangeEndDate(newDate)}
                    views={['month', 'year']}
                    label="End"
                    openTo="month"
                    minDate={getYearMonthMoment(dateRange.value[0])}
                    maxDate={getYearMonthMoment(dateRange.validValues[1])}
                  />
                </div>
              </MuiPickersUtilsProvider>
              <div style={{ display: 'flex', marginTop: Theme.spacing(1) }}>
                <Button
                  data-selenium="data-product-availability.all-years-button"
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={handleSelectAllDateRange}
                >
                  Select All Years
                </Button>
                <Button
                  data-selenium="data-product-availability.latest-year-button"
                  size="small"
                  color="primary"
                  variant="outlined"
                  onClick={handleSelectLatestYearDateRange}
                  style={{ marginLeft: Theme.spacing(1) }}
                >
                  Select Latest Year
                </Button>
              </div>
            </Grid>
          </Grid>
        )}
      </React.Fragment>
    );
  };

  /**
     Render: Final Component
  */
  const currentRows = views[currentView].rows;
  const currentRowCount = Object.keys(currentRows).length;
  const svgHeight = SVG.CELL_PADDING
    + (SVG.CELL_HEIGHT + SVG.CELL_PADDING) * (currentRowCount + 1);
  const selectionSm = absoluteSelectionExpanded ? 12 : 6;
  return (
    <FullWidthVisualization
      vizRef={svgRef}
      minWidth={svgMinWidth}
      handleRedraw={handleSvgRedraw}
      data-selenium="data-product-availability"
      {...other}
    >
      <Grid container spacing={2} style={{ marginBottom: Theme.spacing(1) }}>
        {selectionEnabled ? (
          <Grid item xs={12} sm={selectionSm}>
            {renderSelection()}
          </Grid>
        ) : null}
        <Grid item xs={12} sm={selectionEnabled ? selectionSm : 12}>
          {currentView === 'ungrouped' ? renderSortOptions() : renderViewOptions()}
        </Grid>
      </Grid>
      <svg
        id={uniqueId('dpa-')}
        ref={svgRef}
        height={svgHeight}
        className={classes.svg}
      />
      <AvailabilityLegend selectionEnabled={selectionEnabled} />
    </FullWidthVisualization>
  );
}

DataProductAvailability.propTypes = {
  siteCodes: PropTypes.arrayOf( // eslint-disable-line react/no-unused-prop-types
    PropTypes.shape({
      siteCode: PropTypes.string.isRequired,
      availableMonths: PropTypes.arrayOf(PropTypes.string).isRequired,
    }),
  ),
  view: PropTypes.oneOf(['summary', 'sites', 'states', 'domains', 'ungrouped']),
  sortMethod: PropTypes.oneOf(['sites', 'states', 'domains']),
  sortDirection: PropTypes.oneOf(['ASC', 'DESC']),
  disableSelection: PropTypes.bool,
  disableSelectionCollapse: PropTypes.bool,
};

DataProductAvailability.defaultProps = {
  siteCodes: [],
  view: 'summary',
  sortMethod: null,
  sortDirection: 'ASC',
  disableSelection: false,
  disableSelectionCollapse: false,
};
