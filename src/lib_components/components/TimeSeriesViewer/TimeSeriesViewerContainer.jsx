import React, { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import moment from 'moment';

import domtoimage from 'dom-to-image';
import { saveAs } from 'file-saver';

import { makeStyles } from '@material-ui/core/styles';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Tab from '@material-ui/core/Tab';
import Tabs from '@material-ui/core/Tabs';
import Typography from '@material-ui/core/Typography';

import Skeleton from '@material-ui/lab/Skeleton';

import ImageIcon from '@material-ui/icons/Image';
import SummaryIcon from '@material-ui/icons/Toc';
import SitesIcon from '@material-ui/icons/Place';
import DateRangeIcon from '@material-ui/icons/DateRange';
import VariablesIcon from '@material-ui/icons/ShowChart';
import OptionsIcon from '@material-ui/icons/Settings';

import NeonEnvironment from '../NeonEnvironment/NeonEnvironment';
import Theme from '../Theme/Theme';

import TimeSeriesViewerContext, {
  summarizeTimeSteps,
  TIME_SERIES_VIEWER_STATUS,
  TIME_SERIES_VIEWER_STATUS_TITLES,
} from './TimeSeriesViewerContext';
import TimeSeriesViewerSites from './TimeSeriesViewerSites';
import TimeSeriesViewerDateRange from './TimeSeriesViewerDateRange';
import TimeSeriesViewerVariables from './TimeSeriesViewerVariables';
import TimeSeriesViewerOptions from './TimeSeriesViewerOptions';
import TimeSeriesViewerGraph from './TimeSeriesViewerGraph';

const useStyles = makeStyles(theme => ({
  tabsContainer: {
    display: 'flex',
    borderRadius: theme.spacing(1),
    [theme.breakpoints.down('sm')]: {
      flexDirection: 'column',
    },
  },
  tabsVertical: {
    borderRight: `1px solid ${theme.palette.divider}`,
    minWidth: '128px',
    flexShrink: 0,
    '& :not(:first-child)': {
      borderTop: `1px solid ${theme.palette.divider}`,
      marginTop: '-1px',
    },
  },
  tabsHorizontal: {
    borderBottom: `1px solid ${theme.palette.divider}`,
    flexShrink: 0,
    '& :not(:first-child)': {
      borderLeft: `1px solid ${theme.palette.divider}`,
      marginLeft: '-1px',
    },
  },
  tabPanelContainer: {
    padding: theme.spacing(2.5),
    width: '100%',
  },
  graphContainer: {
    position: 'relative',
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
    padding: theme.spacing(0.5),
  },
  graphOverlay: {
    display: 'block',
    position: 'absolute',
    width: '100%',
    height: '100%',
    textAlign: 'center',
    top: 0,
    left: 0,
    zIndex: 10,
    paddingTop: theme.spacing(20),
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    borderRadius: theme.spacing(1),
  },
  titleContainer: {
    marginBottom: theme.spacing(2),
    borderRadius: theme.spacing(1),
  },
  summaryDiv: {
    marginBottom: Theme.spacing(1),
  },
}));

const useTabsStyles = makeStyles(theme => ({
  scrollButtons: {
    '&:hover, &:focus': {
      backgroundColor: theme.palette.grey[50],
    },
  },
}));

const useTabStyles = makeStyles(theme => ({
  labelIcon: {
    minHeight: theme.spacing(8),
    minWidth: theme.spacing(15),
    '&:hover, &:focus': {
      backgroundColor: theme.palette.grey[50],
    },
    [theme.breakpoints.down('sm')]: {
      minHeight: theme.spacing(6),
      minWidth: theme.spacing(17),
    },
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    '& svg': {
      margin: `${theme.spacing(0, 1, 0, 0)} !important`,
    },
  },
  selected: {
    color: 'white',
    backgroundColor: `${theme.palette.primary.main} !important`,
  },
}));

/**
   Summary Component
*/
function TimeSeriesViewerSummary(props) {
  const classes = useStyles(Theme);
  const { graphRef } = props;
  const [state] = TimeSeriesViewerContext.useTimeSeriesViewerState();

  const {
    sites,
    dateRange,
    variables,
    timeStep,
    autoTimeStep,
    logscale,
    qualityFlags,
    rollPeriod,
  } = state.selection;

  const skeletonProps = {
    variant: 'rect',
    height: 10,
    style: { marginTop: '4px', marginBottom: '12px' },
  };

  // Download Image Button
  const exportGraphImage = () => {
    if (graphRef.current === null) { return; }
    domtoimage.toBlob(graphRef.current)
      .then((blob) => {
        const siteCodes = state.selection.sites.map(site => site.siteCode).join(' ');
        const fileName = `NEON Time Series - ${state.product.productCode} - ${state.product.productName} - ${siteCodes}.png`;
        saveAs(blob, fileName);
      })
      .catch((error) => {
        console.error('Unable to export graph image', error);
      });
  };
  const downloadImageButton = (
    <Button
      size="small"
      color="primary"
      variant="outlined"
      onClick={exportGraphImage}
      disabled={graphRef.current === null}
    >
      <ImageIcon style={{ fontSize: '1.2rem', marginRight: Theme.spacing(0.5) }} />
      Download Image
    </Button>
  );

  // Product
  const productHref = `${NeonEnvironment.getHost()}/data-products/${state.product.productCode}`;
  let productSummaryTitle = (
    <div>
      <Typography variant="h6">Data Product</Typography>
      <Typography variant="body2">{state.product.productCode}</Typography>
    </div>
  );
  let productSummaryDescription = (
    <div>
      <Skeleton {...skeletonProps} width={200} />
      <Skeleton {...skeletonProps} width="100%" />
      <Skeleton {...skeletonProps} width="100%" />
      <Skeleton {...skeletonProps} width={125} />
    </div>
  );
  if (state.product.productName) {
    productSummaryTitle = (
      <div style={{ marginRight: Theme.spacing(1) }}>
        <Typography variant="h6">Data Product</Typography>
        <Typography variant="body2">
          <Link href={productHref} target="_blank" style={{ fontWeight: 600 }}>
            {`${state.product.productName} - (${state.product.productCode})`}
          </Link>
        </Typography>
      </div>
    );
    productSummaryDescription = (
      <div>
        <Typography variant="body2">
          {state.product.productDescription}
        </Typography>
        {state.product.productSensor ? (
          <Typography variant="body2">
            <b>Sensor:</b>
            <span style={{ marginLeft: Theme.spacing(0.5) }}>
              {state.product.productSensor}
            </span>
          </Typography>
        ) : null}
      </div>
    );
  }

  // Sites
  const sitesSummary = !sites.length ? (
    <Skeleton {...skeletonProps} width={175} />
  ) : (
    sites.map((site) => {
      const { siteCode, positions } = site;
      return (
        <Typography variant="body2" key={siteCode}>
          {`${siteCode} - ${positions.join(', ')}`}
        </Typography>
      );
    })
  );

  // Date Range
  let dateRangeSummary = <Skeleton {...skeletonProps} width={300} />;
  if (dateRange.length === 2 && dateRange[0] && dateRange[1]) {
    const pluralize = (val, unit) => (val === 1 ? `${val} ${unit}` : `${val} ${unit}s`);
    const startMoment = moment(`${dateRange[0]}-15`);
    const endMoment = moment(`${dateRange[1]}-15`);
    const months = Math.ceil(endMoment.diff(startMoment, 'months', true)) + 1;
    const years = Math.floor(months / 12);
    let diff = `${pluralize(months, 'month')}`;
    if (years > 0) {
      diff = (!(months % 12))
        ? `${pluralize(years, 'year')}`
        : `${pluralize(years, 'year')}, ${pluralize(months % 12, 'month')}`;
    }
    dateRangeSummary = (
      <Typography variant="body2">
        {`${startMoment.format('MMM YYYY')} - ${endMoment.format('MMM YYYY')} (${diff})`}
      </Typography>
    );
  }

  // Variables
  const variablesSummary = !variables.length ? (
    <Skeleton {...skeletonProps} width={250} />
  ) : (
    <Typography variant="body2">
      {variables.join(', ')}
    </Typography>
  );

  // Options
  const currentTimeStep = timeStep === 'auto' ? autoTimeStep : timeStep;
  const autoTimeStepDisplay = timeStep === 'auto' && currentTimeStep !== null
    ? ` (${currentTimeStep})` : '';
  const options = [
    `${logscale ? 'Logarithmic' : 'Linear'} scale`,
    `${timeStep === 'auto' ? 'Auto' : timeStep} time step${autoTimeStepDisplay}`,
  ];
  if (rollPeriod > 1 && currentTimeStep !== null) {
    options.push(`${summarizeTimeSteps(rollPeriod, currentTimeStep, false)} roll period`);
  }
  const optionsSummary = (
    <React.Fragment>
      <Typography variant="body2">
        {options.join(' · ')}
      </Typography>
      {qualityFlags.length > 0 ? (
        <Typography variant="body2">
          {`Quality flags: ${qualityFlags.join(', ')}`}
        </Typography>
      ) : null}
    </React.Fragment>
  );

  return (
    <div>
      <div className={classes.summaryDiv}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          {productSummaryTitle}
          {downloadImageButton}
        </div>
        {productSummaryDescription}
      </div>
      <div className={classes.summaryDiv}>
        <Typography variant="h6">Sites</Typography>
        {sitesSummary}
      </div>
      <div className={classes.summaryDiv}>
        <Typography variant="h6">Date Range</Typography>
        {dateRangeSummary}
      </div>
      <div className={classes.summaryDiv}>
        <Typography variant="h6">Variables</Typography>
        {variablesSummary}
      </div>
      <div className={classes.summaryDiv}>
        <Typography variant="h6">Options</Typography>
        {optionsSummary}
      </div>
    </div>
  );
}
TimeSeriesViewerSummary.propTypes = {
  graphRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
};

/**
   Define Tabs
*/
const TAB_IDS = {
  SUMMARY: 'SUMMARY',
  SITES: 'SITES',
  DATE_RANGE: 'DATE_RANGE',
  VARIABLES: 'VARIABLES',
  OPTIONS: 'OPTIONS',
};
const TABS = {
  [TAB_IDS.SUMMARY]: {
    label: 'Summary',
    Icon: SummaryIcon,
    Component: TimeSeriesViewerSummary,
  },
  [TAB_IDS.SITES]: {
    label: 'Sites',
    Icon: SitesIcon,
    Component: TimeSeriesViewerSites,
  },
  [TAB_IDS.DATE_RANGE]: {
    label: 'Date Range',
    Icon: DateRangeIcon,
    Component: TimeSeriesViewerDateRange,
  },
  [TAB_IDS.VARIABLES]: {
    label: 'Variables',
    Icon: VariablesIcon,
    Component: TimeSeriesViewerVariables,
  },
  [TAB_IDS.OPTIONS]: {
    label: 'Options',
    Icon: OptionsIcon,
    Component: TimeSeriesViewerOptions,
  },
};

export default function TimeSeriesViewerContainer() {
  const classes = useStyles(Theme);
  const tabClasses = useTabStyles(Theme);
  const tabsClasses = useTabsStyles(Theme);
  const [state] = TimeSeriesViewerContext.useTimeSeriesViewerState();
  const belowMd = useMediaQuery(Theme.breakpoints.down('sm'));

  const initialTab = 'SUMMARY';
  const [selectedTab, setSelectedTab] = useState(initialTab);

  // Slider position is not controlled in state because doing so kills mouse drag performance.
  // Use a ref to deterministically set slider position for all slider-based features.
  const dateRangeSliderRef = useRef(null);

  // We use a ref to the graph container as the base DOM element for image export
  const graphRef = useRef(null);

  const renderTabs = () => (
    <Tabs
      orientation={belowMd ? 'horizontal' : 'vertical'}
      scrollButtons={belowMd ? 'on' : 'auto'}
      variant="scrollable"
      value={selectedTab}
      className={belowMd ? classes.tabsHorizontal : classes.tabsVertical}
      classes={tabsClasses}
      aria-label="Time Series Viewer Controls"
      onChange={(event, newTab) => { setSelectedTab(newTab); }}
      TabIndicatorProps={{ style: { display: 'none' } }}
    >
      {Object.keys(TABS).map((tabId) => {
        const { label, Icon: TabIcon } = TABS[tabId];
        const style = {};
        if (tabId === TAB_IDS.SUMMARY && !belowMd) { style.borderTopLeftRadius = Theme.spacing(1); }
        return (
          <Tab
            key={tabId}
            value={tabId}
            label={label}
            icon={<TabIcon />}
            classes={tabClasses}
            style={style}
            id={`time-series-viewer-tab-${tabId}`}
            aria-controls={`time-series-viewer-tabpanel-${tabId}`}
          />
        );
      })}
    </Tabs>
  );

  const renderTabPanels = () => (
    <div style={{ flexGrow: 1 }}>
      {Object.keys(TABS).map((tabId) => {
        const { Component: TabComponent } = TABS[tabId];
        let tabComponentProps = { setSelectedTab, TAB_IDS, graphRef };
        if (tabId === TAB_IDS.DATE_RANGE) { tabComponentProps = { dateRangeSliderRef }; }
        return (
          <div
            key={tabId}
            role="tabpanel"
            id={`time-series-viewer-tabpanel-${tabId}`}
            aria-labelledby={`time-series-viewer-tab-${tabId}`}
            style={{ display: selectedTab === tabId ? 'block' : 'none' }}
            className={classes.tabPanelContainer}
          >
            <TabComponent {...tabComponentProps} />
          </div>
        );
      })}
    </div>
  );

  const renderGraphOverlay = () => {
    const isError = state.status === TIME_SERIES_VIEWER_STATUS.ERROR;
    const isLoading = !isError && state.status !== TIME_SERIES_VIEWER_STATUS.READY;
    if (isError) { return null; }
    // const isLoadingMeta = isLoading && state.status !== TIME_SERIES_VIEWER_STATUS.LOADING_META;
    const isLoadingData = isLoading && state.status === TIME_SERIES_VIEWER_STATUS.LOADING_DATA;
    if (isLoading) {
      let title = TIME_SERIES_VIEWER_STATUS_TITLES[state.status] || 'Loading…';
      const progressProps = { variant: 'indeterminate' };
      if (isLoadingData) {
        const progress = Math.floor(state.dataFetchProgress || 0);
        progressProps.variant = 'determinate';
        progressProps.value = progress;
        title = `${title} (${progress}%)`;
      }
      return (
        <div className={classes.graphOverlay}>
          <Typography variant="h6" style={{ marginBottom: Theme.spacing(4) }}>
            {title}
          </Typography>
          <CircularProgress {...progressProps} />
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%' }}>
      <Paper className={classes.graphContainer}>
        <div ref={graphRef} style={{ backgroundColor: '#ffffff' }}>
          <TimeSeriesViewerGraph />
        </div>
        {renderGraphOverlay()}
      </Paper>
      <Paper className={classes.tabsContainer}>
        {renderTabs()}
        {renderTabPanels()}
      </Paper>
    </div>
  );
}
