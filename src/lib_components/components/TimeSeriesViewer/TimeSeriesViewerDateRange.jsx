import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';

import { makeStyles, withStyles } from '@material-ui/core/styles';
import { MuiPickersUtilsProvider, DatePicker } from '@material-ui/pickers';
import Grid from '@material-ui/core/Grid';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

import Skeleton from '@material-ui/lab/Skeleton';

import MomentUtils from '@date-io/moment';
import moment from 'moment';

import { AvailabilityGrid, SVG } from '../DataProductAvailability/AvailabilityGrid';
import AvailabilityLegend from '../DataProductAvailability/AvailabilityLegend';
import FullWidthVisualization from '../FullWidthVisualization/FullWidthVisualization';
import NeonContext from '../NeonContext/NeonContext';
import Theme from '../Theme/Theme';

import TimeSeriesViewerContext from './TimeSeriesViewerContext';

const getYearMonthMoment = (yearMonth, day = 15) => (
  moment(`${yearMonth}-${day.toString().padStart(2, '0')}`)
);

const svgMinWidth = (SVG.CELL_WIDTH + SVG.CELL_PADDING) * SVG.MIN_CELLS
  + Math.floor(SVG.MIN_CELLS / 12) * SVG.YEAR_PADDING;
const svgMinHeight = (SVG.CELL_HEIGHT + SVG.CELL_PADDING) * (SVG.MIN_ROWS + 1);
const useStyles = makeStyles(() => ({
  svg: {
    minWidth: `${svgMinWidth}px`,
    minHeight: `${svgMinHeight}px`,
  },
}));

const boxShadow = alpha => `0 3px 1px rgba(0,0,0,0.1),0 4px 8px rgba(0,0,0,${alpha}),0 0 0 1px rgba(0,0,0,0.02)`;
const DateRangeSlider = withStyles({
  root: {
    width: `calc(100% - ${Theme.spacing(6)}px)`,
    marginLeft: Theme.spacing(3),
    marginBottom: Theme.spacing(4),
  },
  rail: {
    height: 3,
  },
  track: {
    height: 7,
    marginTop: -2,
  },
  mark: {
    height: 12,
    marginTop: -5,
  },
  markActive: {
    height: 12,
    marginTop: -5,
    backgroundColor: Theme.palette.primary.main,
  },
  markLabel: {
    marginTop: Theme.spacing(1),
  },
  thumb: {
    height: Theme.spacing(3.5),
    width: Theme.spacing(1.5),
    backgroundColor: Theme.palette.grey[50],
    boxShadow: boxShadow(0.13),
    border: `2px solid ${Theme.palette.primary.main}`,
    borderRadius: Theme.spacing(0.5),
    marginTop: Theme.spacing(-1.75),
    marginLeft: Theme.spacing(-0.75),
    '&:focus,&:hover,&active': {
      boxShadow: boxShadow(0.3),
      // Reset on touch devices, it doesn't add specificity
      '@media (hover: none)': {
        boxShadow: boxShadow(0.13),
      },
    },
  },
  valueLabel: {
    left: 'initial',
    fontWeight: 600,
    top: -20,
    whiteSpace: 'nowrap',
    '& span': {
      width: 'auto',
      height: 'auto',
      padding: Theme.spacing(0.5, 1),
      borderRadius: Theme.spacing(0.5),
      transform: 'none',
      '& span': {
        transform: 'none',
        padding: 0,
        borderRadius: 0,
      },
    },
  },
})(Slider);

let sliderDefault = [];

const TimeSeriesViewerDateRange = (props) => {
  const classes = useStyles(Theme);
  const { dateRangeSliderRef } = props;
  const [{ data: neonContextData }] = NeonContext.useNeonContextState();
  const { sites: allSites } = neonContextData;
  const [state, dispatch] = TimeSeriesViewerContext.useTimeSeriesViewerState();

  const currentRange = state.selection.dateRange;
  const selectableRange = state.product.dateRange;
  const displayRange = state.product.continuousDateRange;
  const displayMin = 0;
  const displayMax = displayRange.length - 1;
  const sliderMin = displayRange.indexOf(selectableRange[0]);
  const sliderMax = displayRange.indexOf(selectableRange[1]);

  // Derive site and availability values for the AvailabilityGrid
  const availabilityDateRange = { value: currentRange, validValues: selectableRange };
  const selectedSites = state.selection.sites.map(site => site.siteCode);
  const availabilitySites = { value: selectedSites, validValues: selectedSites };
  const availabilityData = {
    view: 'sites',
    name: 'Site',
    selectable: true,
    rows: {},
    getLabel: {
      text: key => key,
      title: key => (allSites[key] ? allSites[key].description : key),
    },
  };
  selectedSites.forEach((siteCode) => {
    availabilityData.rows[siteCode] = {};
    state.product.sites[siteCode].availableMonths.forEach((month) => {
      availabilityData.rows[siteCode][month] = 'available';
    });
  });
  const svgHeight = SVG.CELL_PADDING
    + (SVG.CELL_HEIGHT + SVG.CELL_PADDING) * (selectedSites.length + 1);

  // Function to apply changes to the slider's DOM as if it was controlled by state.
  // We can't control in state because doing so makes drag experience jerky and frustrating.
  // By not controlling the slider with state we can maintain a fluid experience and need
  // only this bit of logic (with a ref to the slider's DOM node) to keep the slider
  // DOM in sync as if it was controlled directly.
  const applySliderValues = useCallback((values) => {
    if (!Array.isArray(values) || values.length !== 2
        || !displayRange[values[0]] || !displayRange[values[1]]
        || values[0] > values[1]) {
      return;
    }
    const limited = [Math.max(values[0], sliderMin), Math.min(values[1], sliderMax)];

    // Derive new percentage values for left and width styles of slider DOM elements
    const newLefts = [
      `${(limited[0] / (displayMax + 1)) * 100}%`,
      `${(limited[1] / (displayMax + 1)) * 100}%`,
    ];

    // Apply values to Slider DOM hidden input
    dateRangeSliderRef.current
      .querySelector('input[type="hidden"]').value = limited.join(',');

    // Apply values to slider drag handles
    [0, 1].forEach((idx) => {
      dateRangeSliderRef.current
        .querySelector(`span[role="slider"][data-index="${idx}"]`)
        .setAttribute('aria-valuenow', limited[idx].toString());
      dateRangeSliderRef.current
        .querySelector(`span[role="slider"][data-index="${idx}"]`)
        .style.left = newLefts[idx];
      dateRangeSliderRef.current
        .querySelector(`span[role="slider"][data-index="${idx}"] > span > span > span`)
        .innerText = displayRange[limited[idx]];
    });

    // Apply values to slider track between drag handles
    const newTrackWidth = `${((limited[1] - limited[0] + 1) / (displayMax + 1)) * 100}%`;
    dateRangeSliderRef.current.querySelector('.MuiSlider-track').style.width = newTrackWidth;
    // eslint-disable-next-line prefer-destructuring
    dateRangeSliderRef.current.querySelector('.MuiSlider-track').style.left = newLefts[0];
  }, [dateRangeSliderRef, displayRange, displayMax, sliderMin, sliderMax]);

  useEffect(() => {
    if (!dateRangeSliderRef.current) { return; }
    const sliderValues = dateRangeSliderRef.current.querySelector('input[type="hidden"]').value;
    const compareValues = [
      currentRange[0] === null ? sliderMin : displayRange.indexOf(currentRange[0]),
      currentRange[1] === null ? sliderMax : displayRange.indexOf(currentRange[1]),
    ];
    if (sliderValues !== compareValues.join(',')) {
      applySliderValues(compareValues);
    }
  }, [dateRangeSliderRef, currentRange, displayRange, sliderMin, sliderMax, applySliderValues]);

  // Set up AvailabilityGrid
  const setDateRangeValue = useCallback(dateRange => dispatch({
    type: 'selectDateRange',
    dateRange,
  }), [dispatch]);
  const svgRef = useRef(null);
  const handleSvgRedraw = useCallback(() => {
    AvailabilityGrid({
      data: availabilityData,
      svgRef,
      allSites,
      sites: availabilitySites,
      dateRange: availabilityDateRange,
      setDateRangeValue,
    });
  }, [
    svgRef,
    allSites,
    availabilityData,
    availabilitySites,
    availabilityDateRange,
    setDateRangeValue,
  ]);
  useEffect(() => {
    handleSvgRedraw();
  });

  // Render nothing if no selectable range is available or no sites are yet selected
  if (!displayRange.length || !selectedSites.length) {
    return (
      <div>
        <Skeleton variant="rect" width="100%" height={56} />
        <br />
        <div style={{ display: 'flex', marginBottom: Theme.spacing(3) }}>
          <Skeleton variant="rect" width="100%" height={40} />
          <div style={{ width: '40px' }} />
          <Skeleton variant="rect" width="100%" height={40} />
        </div>
        <Skeleton variant="rect" width={300} height={28} />
        <br />
        <Skeleton variant="rect" width="100%" height={80} />
      </div>
    );
  }

  const marks = [{
    value: displayMin,
    label: displayRange[displayMin].substring(0, 4),
  }];
  const yearsInSlider = Math.floor(displayRange.length / 12);
  const innerMark = Math.ceil(yearsInSlider / Math.ceil(yearsInSlider % 3 ? 2 : 3));
  for (let y = 1; y < yearsInSlider; y += 1) {
    marks.push({
      value: 12 * y,
      label: (y === innerMark || y === innerMark * 2)
        ? displayRange[12 * y].substring(0, 4)
        : null,
    });
  }
  marks.push({
    value: displayMax,
    label: displayRange[displayMax].substring(0, 4),
  });

  const handleChangeDatePicker = (rangeIndex, value) => {
    // Confirm arguments are sane
    const formattedValue = value.format('YYYY-MM');
    const newSliderValue = displayRange.indexOf(formattedValue);
    if (!formattedValue || ![0, 1].includes(rangeIndex) || newSliderValue === -1) { return; }
    // Generate new selected dateRange bounded by min/max
    const dateRange = [
      currentRange[0] === null ? displayRange[sliderMin] : currentRange[0],
      currentRange[1] === null ? displayRange[sliderMax] : currentRange[1],
    ];
    dateRange[rangeIndex] = formattedValue;
    dispatch({ type: 'selectDateRange', dateRange });
  };

  // Only set slider defaults on the initial render
  if (!Object.isFrozen(sliderDefault)) {
    sliderDefault = [
      displayRange.indexOf(currentRange[0]),
      displayRange.indexOf(currentRange[1]),
    ];
    Object.freeze(sliderDefault);
  }

  return (
    <React.Fragment>
      <div style={{ marginBottom: Theme.spacing(2) }}>
        <MuiPickersUtilsProvider utils={MomentUtils}>
          <Grid container spacing={2} style={{ marginBottom: Theme.spacing(1) }}>
            <Grid item xs={12} sm={6} style={{ display: 'flex', justifyContent: 'center' }}>
              <DatePicker
                data-selenium="time-series-viewer.date-range.start-input"
                inputVariant="outlined"
                margin="dense"
                value={getYearMonthMoment(currentRange[0] || displayRange[sliderMin])}
                onChange={value => handleChangeDatePicker(0, value)}
                views={['month', 'year']}
                label="Start"
                openTo="month"
                minDate={getYearMonthMoment(displayRange[sliderMin], 10)}
                maxDate={getYearMonthMoment(currentRange[1] || displayRange[sliderMax], 20)}
              />
            </Grid>
            <Grid item xs={12} sm={6} style={{ display: 'flex', justifyContent: 'center' }}>
              <DatePicker
                data-selenium="time-series-viewer.date-range.end-input"
                inputVariant="outlined"
                margin="dense"
                value={getYearMonthMoment(currentRange[1] || displayRange[sliderMax])}
                onChange={value => handleChangeDatePicker(1, value)}
                views={['month', 'year']}
                label="End"
                openTo="month"
                minDate={getYearMonthMoment(currentRange[0] || displayRange[sliderMin], 10)}
                maxDate={getYearMonthMoment(displayRange[sliderMax], 20)}
              />
            </Grid>
          </Grid>
        </MuiPickersUtilsProvider>
        <DateRangeSlider
          data-selenium="time-series-viewer.date-range.slider"
          ref={dateRangeSliderRef}
          defaultValue={[...sliderDefault]}
          valueLabelDisplay="auto"
          min={displayMin}
          max={displayMax}
          marks={marks}
          valueLabelFormat={x => displayRange[x]}
          onChange={(event, values) => {
            applySliderValues(values);
          }}
          onChangeCommitted={(event, values) => {
            dispatch({
              type: 'selectDateRange',
              dateRange: [
                Math.max(values[0], sliderMin),
                Math.min(values[1], sliderMax),
              ].map(x => displayRange[x]),
            });
          }}
        />
      </div>
      <div style={{ position: 'relative' }}>
        <Typography variant="subtitle1" style={{ fontWeight: 600, marginBottom: Theme.spacing(1) }}>
          Select by Data Product Availability
        </Typography>
        <FullWidthVisualization
          vizRef={svgRef}
          handleRedraw={handleSvgRedraw}
        >
          <svg
            ref={svgRef}
            height={svgHeight}
            className={classes.svg}
          />
        </FullWidthVisualization>
        <AvailabilityLegend style={{ flexGrow: 1 }} />
      </div>
    </React.Fragment>
  );
};

export default TimeSeriesViewerDateRange;

TimeSeriesViewerDateRange.propTypes = {
  dateRangeSliderRef: PropTypes.shape({
    current: PropTypes.instanceOf(Element),
  }).isRequired,
};
