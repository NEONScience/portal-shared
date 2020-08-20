import { debounce } from 'lodash';

import { select, event } from 'd3-selection';
import { drag } from 'd3-drag';

import uniqueId from 'lodash/uniqueId';

import Theme, { COLORS } from '../Theme/Theme';

import {
  SVG,
  TIME,
  SVG_STYLES,
  calcRollupStatus,
} from './AvailabilityUtils';
import { CELL_ATTRS } from './AvailabilitySvgComponents';

/**
 * EnhancedAvailabilityGrid generator function
 * @param {object} config - all arguments, see below:
 * * @param {object} svgRef Pointer to an <svg> element generated by useRef()
 * * @param {object} data View object containing name, rows, and getLabel functions
 * * @param {object} sites
 * * * @param {array} value Array of site code strings to show as selected
 * * * @param {array} validValues Array of site code strings known to have some data
 *         in the data set. This is only superfluous when the view is "site". Otherwise,
 *         for example, clicking the summary view row has no way of knowing the specific
 *         sites that actually apply when "selecting all" for this particular product
 * * @param {function} setSitesValue Setter from useState hook defined in
 *       parent to set state for sites
 * * @param {object} dateRange
 * * * @param {array} value Array of exactly two "YYYY-MM" strings
 * * * @param {array} validValues Array of exactly two "YYYY-MM" strings
 *       representing the limits of available / selectable data for the product
 * * @param {function} setDateRangeValue Setter from useState hook defined in
 *       parent to set state for dateRange
 * * @param {boolean} selectionEnabled Whether to hook up interactions to allow
 *       user selection of sites
 */
export default function EnhancedAvailabilityGrid(config) {
  /**
     Extract Config
  */
  const {
    svgRef,
    rows = {},
    rowLabels = [],
    rowTitles = {},
    sites = { value: [], validValues: [] },
    // allSites = {},
    setSitesValue = null,
    dateRange = { value: [], validValues: [TIME.MIN_YEAR_MONTH, TIME.MAX_YEAR_MONTH] },
    setDateRangeValue = () => {},
    selectionEnabled = true,
  } = config;

  /**
     Sanity Check: svgRef must be a valid ref
  */
  if (!svgRef || !svgRef.current) {
    return null;
  }

  /**
     Sanity Check: rows and rowLabels must both exist with same length
  */
  if (!rows || !rowLabels || Object.keys(rows).length !== rowLabels.length) {
    return null;
  }

  /**
     Setup: Inputs and Base Values
  */
  const svg = select(svgRef.current);
  if (svg.attr('id') === null) { svg.attr('id', `availability-${uniqueId()}`); }
  const svgId = svg.attr('id');
  const svgWidth = parseFloat(svg.attr('width'));
  const svgHeight = parseFloat(svg.attr('height'));
  const labelWidth = (rowLabels[0].length * SVG.LABEL_WIDTH_MULTIPLIER)
    + SVG.LABEL_WIDTH_RIGHT_BUFFER;

  /**
     Sanity Check: svg must have discrete numeric dimensions
  */
  if (Number.isNaN(svgWidth) || Number.isNaN(svgHeight)) {
    return null;
  }

  /**
     Setup: Static site/domain/state data
     Create mappings of all sites for given state or domain
     to aid in showing partial vs. full selections
  */
  /*
  const siteViewMaps = {
    domains: {},
    states: {},
  };
  Object.keys(allSites).forEach((site) => {
    const domain = allSites[site].domainCode;
    if (!siteViewMaps.domains[domain]) { siteViewMaps.domains[domain] = []; }
    siteViewMaps.domains[domain].push(site);
    const state = allSites[site].stateCode;
    if (!siteViewMaps.states[state]) { siteViewMaps.states[state] = []; }
    siteViewMaps.states[state].push(site);
  });
  */

  /**
     Setup: Interaction state vars (local vars is all we need here)
  */
  let rowHoverKey = null;
  let draggingCells = false;

  /* eslint-disable no-unused-vars */
  let dateRangeHoverKey = null;
  const draggingDateRange = [
    { dragging: false, centerDragX: 0 },
    { dragging: false, centerDragX: 0 },
  ];
  /* eslint-enable no-unused-vars */

  /**
     Functions to filter TIME.YEAR_MONTHS and TIME.YEARS to only what's in view
     given the current dragOffset and the clip width. We use this to
     feed data to d3 selections in order to only draw what will actually
     be visible.
  */
  const getMinTimeOffset = () => 0 - (SVG.ABS_MAX_DATA_WIDTH - (svgWidth - labelWidth));
  const getYearStartX = (year) => {
    const intYear = parseInt(year, 10);
    return labelWidth + SVG.END_PADDING
      + (TIME.YEARS.indexOf(intYear) * SVG.YEAR_WIDTH)
      + (TIME.YEARS.indexOf(intYear) * SVG.YEAR_PADDING);
  };
  const getYearCenterX = year => getYearStartX(year) + (SVG.YEAR_WIDTH / 2);
  const getYearMonthStartX = (yearMonth) => {
    const year = parseInt(yearMonth.substr(0, 4), 10);
    const month = parseInt(yearMonth.substr(5, 2), 10);
    const yearIdx = TIME.YEARS.indexOf(year);
    if (yearIdx === -1 || month < 1 || month > 12) { return 0; }
    return getYearStartX(year) + ((month - 1) * SVG.YEAR_MONTH_WIDTH);
  };
  const getYearMonthsInView = (totalSvgWidth, dragOffset) => TIME.YEAR_MONTHS
    .filter((yearMonth) => {
      const tX = getYearMonthStartX(yearMonth) + dragOffset;
      const margin = SVG.YEAR_MONTH_WIDTH * 4;
      const lower = Math.max(0, labelWidth - margin);
      const upper = totalSvgWidth + margin;
      return (tX > lower && tX + SVG.YEAR_MONTH_WIDTH < upper);
    });
  const getYearsInView = (totalSvgWidth, dragOffset) => TIME.YEARS
    .filter((year) => {
      const tX = getYearStartX(year) + dragOffset;
      const lower = -2 * SVG.YEAR_WIDTH;
      const upper = (totalSvgWidth - labelWidth) + (2 * SVG.YEAR_WIDTH);
      return (tX > lower && tX + SVG.YEAR_WIDTH < upper);
    });

  /**
     Function to generate the "initial" time offset for first load. By default we may extend the
     viewable time range well beyond available data (e.g. if there is no data this year the chart
     should still show dates for this year so it's not ambiguous). This function aims to generate
     an ideal time offset that will put the latest month with availability in view and close to the
     right edge, but also keeping full year labels in view (why we target 8 months of the latest
     year... the right number of months so the year label is not cut off even if the year is empty)
  */
  const getInitialTimeOffset = () => {
    const minTimeOffset = getMinTimeOffset();
    if (!rows) { return minTimeOffset; }
    let availableMonths = [];
    const availableMonthsSet = new Set();
    rowLabels.forEach((label) => {
      Object.keys(rows[label]).forEach(availableMonthsSet.add, availableMonthsSet);
    });
    availableMonths = Array.from(availableMonthsSet.values());
    if (!availableMonths.length) { return minTimeOffset; }
    availableMonths.sort();
    const latestAvailableYearMonth = availableMonths[availableMonths.length - 1];
    const latestAvailableYearInt = parseInt(latestAvailableYearMonth.substr(0, 4), 10);
    const latestAvailableMonthInt = parseInt(latestAvailableYearMonth.substr(5, 2), 10);
    const finalMonth = latestAvailableMonthInt <= 6
      ? `${latestAvailableYearInt}-08`
      : `${latestAvailableYearInt + 1}-08`;
    const ret = Math.max(
      0 - getYearMonthStartX(finalMonth) - SVG.YEAR_MONTH_WIDTH + svgWidth,
      minTimeOffset,
    );
    return ret;
  };

  /**
     Functions to get a translate() string for a data row by index
     in the sorted rowLabels array
  */
  const getRowY = idx => (
    SVG.CELL_PADDING + (rowLabels.length - idx) * (SVG.CELL_HEIGHT + SVG.CELL_PADDING)
  );
  const getRowTranslation = (d, idx) => `translate(0,${getRowY(idx)})`;

  /**
     Main SVG Structure
     (Layered groups, clip definition, etc.)
  */
  svg.selectAll('*').remove();
  const clipWidth = svgWidth - labelWidth;
  const defs = svg.append('defs');
  const labelSelectionsG = svg.append('g')
    .attr('class', 'labelSelectionsG');
  const clipPath = defs.append('clipPath')
    .attr('id', `${svgId}-clip`);
  clipPath.append('rect')
    .attr('x', labelWidth)
    .attr('y', 0)
    .attr('width', clipWidth)
    .attr('height', svgHeight);
  const clipG = svg.append('g')
    .attr('class', 'clipG')
    .attr('clip-path', `url(#${svgId}-clip)`);
  const dragG = clipG.append('g')
    .attr('class', 'dragG');
  const rowSelectionsG = dragG.append('g')
    .attr('class', 'rowSelectionsG');
  const dragContentG = dragG.append('g')
    .attr('class', 'dragContentG');

  /**
     Time offset values and functions
     Setting the time offset (by interacting with the drag group) must
     be sensitive to the previous time offset in the event of a resize
     (e.g. if the time offset is already at the minimum but the minimum
     has changed, prefer it stays at the minimum). Also keep the offset
     bounded within where there's actually data to show.
  */
  let prevMinTimeOffset = getMinTimeOffset();
  if (svg.attr('data-prevMinTimeOffset') === null) {
    svg.attr('data-prevMinTimeOffset', getMinTimeOffset());
  } else {
    prevMinTimeOffset = parseFloat(svg.attr('data-prevMinTimeOffset'));
  }
  const getTimeOffset = () => {
    const minTimeOffset = getMinTimeOffset();
    let currentTimeOffset = parseFloat(svg.attr('data-timeOffset')) || 0;
    if (currentTimeOffset === prevMinTimeOffset && prevMinTimeOffset !== minTimeOffset) {
      currentTimeOffset = minTimeOffset;
      prevMinTimeOffset = minTimeOffset;
      svg.attr('data-prevMinTimeOffset', minTimeOffset);
    }
    return currentTimeOffset;
  };
  const setTimeOffset = (timeOffset) => {
    const boundedTimeOffset = Math.min(Math.max(getMinTimeOffset(), timeOffset), 0);
    dragG.attr('transform', `translate(${boundedTimeOffset},0)`);
    svg.attr('data-timeOffset', boundedTimeOffset);
  };
  // Set timeOffset the first time. It's preserved through state updates
  // but we still send its value through the setter to stay within bounds.
  if (svg.attr('data-timeOffset') === null) {
    setTimeOffset(getInitialTimeOffset());
  } else {
    setTimeOffset(svg.attr('data-timeOffset'));
  }

  /**
     Setup: Functions to translate yearMonth gutter centers to pixel offsets and back,
     and other helpers for giving the date range drag handles a snappy feel
  */
  // Get the center of the gutter on either side of a given yearMonth INSIDE the clip.
  // To translate the value to pixels OUTSIDE the clip add the time offset, e.g.:
  //   getYearMonthGutterX('YYYY-MM') + getTimeOffset();
  const getYearMonthGutterX = (yearMonth, side = 'left') => {
    switch (side) {
      case 'left':
        if (yearMonth === TIME.MIN_YEAR_MONTH) {
          return labelWidth;
        }
        if (yearMonth.substr(5, 2) === '01') {
          return getYearStartX(yearMonth.substr(0, 4)) - (SVG.YEAR_PADDING / 2);
        }
        return getYearMonthStartX(yearMonth) - (SVG.CELL_PADDING / 2);
      case 'right':
        if (yearMonth === TIME.MAX_YEAR_MONTH) {
          return svgWidth - getTimeOffset();
        }
        if (yearMonth.substr(5, 2) === '12') {
          return getYearStartX(yearMonth.substr(0, 4)) + SVG.YEAR_WIDTH + (SVG.YEAR_PADDING / 2);
        }
        return getYearMonthStartX(yearMonth) + SVG.CELL_WIDTH + (SVG.CELL_PADDING / 2);
      default:
        return getYearMonthStartX(yearMonth) - (SVG.CELL_PADDING / 2);
    }
  };
  // Get the yearMonth string that's next to a given yearMonth on either side.
  // Stays within the selectable range unless selectable is false, in which case
  // is stays within the chart's global min and max.
  const getAdjacentYearMonth = (yearMonth, side = 'left', selectable = true) => {
    const year = parseInt(yearMonth.substr(0, 4), 10);
    const month = parseInt(yearMonth.substr(5, 2), 10);
    const bounds = selectable ? dateRange.validValues : [TIME.MIN_YEAR_MONTH, TIME.MAX_YEAR_MONTH];
    let adjacent = yearMonth;
    switch (side) {
      case 'left':
        if (month === 1) {
          adjacent = `${year - 1}-12`;
        } else {
          adjacent = `${year}-${(month - 1).toString().padStart(2, '0')}`;
        }
        return adjacent < bounds[0] ? bounds[0] : adjacent;
      case 'right':
        if (month === 12) {
          adjacent = `${year + 1}-01`;
        } else {
          adjacent = `${year}-${(month + 1).toString().padStart(2, '0')}`;
        }
        return adjacent > bounds[1] ? bounds[1] : adjacent;
      default:
        return adjacent;
    }
  };

  /**
     SVG: Row Hover
   */
  const rowHover = svg.append('rect')
    .attr('class', 'rowHover');
  rowHover
    .attr('x', 1)
    .attr('y', -2 * SVG.CELL_HEIGHT)
    .attr('width', svgWidth - 1)
    .attr('height', SVG.CELL_HEIGHT + SVG.CELL_PADDING)
    .attr('fill', 'none')
    .attr('stroke', COLORS.LIGHT_BLUE[700])
    .attr('stroke-width', '1.5px')
    .style('opacity', 0);

  /**
     SVG: Left and Right bounds
  */
  const lboundOffset = labelWidth + (SVG.CELL_PADDING / 2) - 1;
  const lbound = svg.append('line');
  lbound
    .attr('x1', lboundOffset)
    .attr('y1', 0)
    .attr('x2', lboundOffset)
    .attr('y2', svgHeight);
  SVG_STYLES.apply(lbound, 'timeBound');

  const rboundOffset = svgWidth - 1;
  const rbound = svg.append('line');
  rbound
    .attr('x1', rboundOffset)
    .attr('y1', 0)
    .attr('x2', rboundOffset)
    .attr('y2', svgHeight);
  SVG_STYLES.apply(rbound, 'timeBound');

  /**
     SVG: Selections
     Create a mapping of current view keys (sites, domains, states, etc.)
     to selected status (i.e. 'full' or 'partial')
  */
  const viewSelections = {};
  // const sitesSet = new Set(sites.value);
  // const validSitesSet = new Set(sites.validValues);
  /*
  if (sites.value.length) {
    switch (data.view) {
      case 'summary':
        viewSelections.summary = (sites.value.length === sites.validValues.length)
          ? 'full'
          : 'partial';
        break;
      case 'sites':
      case 'ungrouped':
        sites.value.forEach((site) => {
          viewSelections[site] = 'full';
        });
        break;
      default: // domains, states
        Object.keys(siteViewMaps[data.view]).forEach((entry) => {
          const viewSites = new Set(
            siteViewMaps[data.view][entry].filter(s => validSitesSet.has(s)),
          );
          const intersection = new Set([...viewSites].filter(s => sitesSet.has(s)));
          if (!intersection.size) { return; }
          viewSelections[entry] = (intersection.size === viewSites.size) ? 'full' : 'partial';
        });
        break;
    }
  }
  */

  const toggleSelection = () => {
    // console.log(key);
    /*
    if (!setSitesValue) { return; }
    let allSitesForKey = new Set();
    switch (data.view) {
      case 'summary':
        allSitesForKey = new Set(sites.validValues);
        break;
      case 'sites':
      case 'ungrouped':
        allSitesForKey = new Set([key]);
        break;
      default: // domains, states
        allSitesForKey = new Set(siteViewMaps[data.view][key].filter(s => validSitesSet.has(s)));
        break;
    }
    let newSelectedSitesSet;
    if (!viewSelections[key] || viewSelections[key] === 'partial') {
      // select all sites for this key
      newSelectedSitesSet = new Set([...sitesSet, ...allSitesForKey]);
    } else {
      // deselect all sites for this key
      newSelectedSitesSet = new Set([...sitesSet].filter(s => !allSitesForKey.has(s)));
    }
    setSitesValue([...newSelectedSitesSet]);
    */
  };

  const rowHighlightReset = debounce((clearRowHoverKey = true) => {
    if (clearRowHoverKey) { rowHoverKey = null; }
    rowHover.style('opacity', 0);
    rowHover.attr('y', -2 * SVG.CELL_HEIGHT);
  }, 100);

  const rowHighlightHover = (key) => {
    rowHoverKey = key;
    const offset = rowLabels.indexOf(key);
    if (offset !== -1 && !draggingCells) {
      rowHighlightReset.cancel();
      const y = (SVG.CELL_PADDING / 2)
        + (rowLabels.length - offset) * (SVG.CELL_HEIGHT + SVG.CELL_PADDING);
      rowHover.style('opacity', 1);
      rowHover.attr('y', y);
    }
  };

  /**
     SVG: Row Labels
  */
  const rowLabelsG = svg.append('g').attr('class', 'rowLabelsG');
  rowLabels.forEach((label, rowIdx) => {
    const transform = getRowTranslation(label, rowIdx);
    const labelX = labelWidth - SVG.CELL_PADDING;
    const rowLabelG = rowLabelsG.append('g').attr('transform', transform);
    const fill = selectionEnabled && setSitesValue && viewSelections[label]
      ? Theme.palette.primary.contrastText
      : Theme.palette.grey[700];
    const text = rowLabelG.append('text')
      .attr('x', labelX)
      .attr('y', SVG.LABEL_FONT_SIZE - (SVG.CELL_PADDING / 2))
      .attr('fill', fill)
      .text(label);
    SVG_STYLES.apply(text, 'rowLabel');
    const mask = rowLabelG.append('rect')
      .attr('x', 0)
      .attr('y', -1 * (SVG.CELL_PADDING / 2))
      .attr('width', labelWidth)
      .attr('height', SVG.CELL_HEIGHT + SVG.CELL_PADDING)
      .on('mouseover', () => rowHighlightHover(label))
      .on('focus', () => rowHighlightHover(label))
      .on('mouseout', rowHighlightReset)
      .on('blur', rowHighlightReset);
    SVG_STYLES.apply(mask, 'rowLabelMask');
    // Fill the mask and delay the selection to emulate a touch ripple.
    // Re-render to show the selection will reset the style.
    const maskClick = selectionEnabled && setSitesValue ? () => {
      SVG_STYLES.touchRipple(mask, 15);
      setTimeout(() => toggleSelection(label), 15);
    } : () => {};
    mask.on('click', maskClick);
    mask.append('svg:title').text(rowTitles[label]);
  });

  /**
     SVG: Time Axis
  */
  const timeAxis = {};
  timeAxis.g = dragContentG.append('g').attr('class', 'timeAxisG');
  timeAxis.highlight = timeAxis.g.append('rect').attr('class', 'timeAxisHighlight');
  timeAxis.innerG = timeAxis.g.append('g').attr('class', 'timeAxisInnerG');
  timeAxis.mask = clipG.append('rect').attr('class', 'timeAxisMask');

  const redrawTimeAxis = () => {
    if (timeAxis.innerG.selectAll('*').empty()) {
      timeAxis.highlight
        .attr('x', labelWidth)
        .attr('y', 0)
        .attr('width', SVG.ABS_MAX_DATA_WIDTH)
        .attr('height', SVG.CELL_HEIGHT + (1.5 * SVG.CELL_PADDING));
      SVG_STYLES.apply(timeAxis.highlight, 'timeHighlight');
      timeAxis.mask
        .attr('x', labelWidth)
        .attr('y', 0)
        .attr('width', SVG.ABS_MAX_DATA_WIDTH)
        .attr('height', SVG.CELL_HEIGHT + SVG.CELL_PADDING);
      SVG_STYLES.apply(timeAxis.mask, 'timeHighlightMask');
    }
    timeAxis.innerG.selectAll('text')
      .data(() => getYearsInView(svgWidth, getTimeOffset()))
      .join('text')
      .attr('x', year => getYearCenterX(year))
      .attr('y', SVG.LABEL_FONT_SIZE + 1)
      .text(year => year)
      .each((year, idx, labelNodes) => {
        SVG_STYLES.apply(select(labelNodes[idx]), 'timeLabel');
      });
    timeAxis.innerG.selectAll('line')
      .data(() => {
        const lineYears = getYearsInView(svgWidth, getTimeOffset());
        return (lineYears[0] === TIME.START_YEAR)
          ? lineYears.slice(1)
          : lineYears;
      })
      .join('line')
      .attr('x1', year => getYearStartX(year) - (SVG.YEAR_PADDING / 2))
      .attr('y1', 0)
      .attr('x2', year => getYearStartX(year) - (SVG.YEAR_PADDING / 2))
      .attr('y2', svgHeight)
      .each((year, idx, lineNodes) => {
        SVG_STYLES.apply(select(lineNodes[idx]), 'timeDivider');
      });
  };

  /**
     SVG: Row Data
  */
  const dataG = dragContentG.append('g').attr('class', 'dataG');
  const dataMasksG = svg.append('g').attr('class', 'dataMasksG');
  const redrawData = () => {
    // Click/drag masks
    dataMasksG.selectAll('rect')
      .data(rowLabels)
      .join('rect')
      .attr('x', labelWidth)
      .attr('y', (d, idx) => (
        (SVG.CELL_PADDING / 2) + (rowLabels.length - idx) * (SVG.CELL_HEIGHT + SVG.CELL_PADDING)
      ))
      .attr('width', svgWidth - labelWidth)
      .attr('height', SVG.CELL_HEIGHT + SVG.CELL_PADDING)
      .attr('fill', 'transparent')
      .style('cursor', selectionEnabled && setSitesValue ? 'pointer' : 'grab')
      .style('outline', 'none')
      .on('mouseover', rowHighlightHover)
      .on('focus', rowHighlightHover)
      .on('mouseout', rowHighlightReset)
      .on('blur', rowHighlightReset)
      .on('click', selectionEnabled && setSitesValue ? (label, idx, nodes) => {
        SVG_STYLES.touchRipple(select(nodes[idx]), 15);
        setTimeout(() => toggleSelection(label), 15);
      } : () => {});
    // Cells
    dataG.selectAll('g')
      .data(rowLabels)
      .join('g')
      .attr('transform', getRowTranslation)
      .each((label, idx, gNodes) => {
        const rowData = rows[label];
        const getDefaultStatus = month => (
          month >= TIME.CURRENT_MONTH ? 'not expected' : 'not available'
        );
        const getCellAttr = (month, attr) => {
          const status = calcRollupStatus(rowData[month]);
          return (
            !CELL_ATTRS[status]
              ? CELL_ATTRS[getDefaultStatus(month)][attr] || null
              : CELL_ATTRS[status][attr] || null
          );
        };
        select(gNodes[idx])
          .selectAll('rect')
          .data(() => getYearMonthsInView(svgWidth, getTimeOffset()))
          .join('rect')
          .attr('x', month => getYearMonthStartX(month) + (getCellAttr(month, 'nudge') || 0))
          .attr('y', month => getCellAttr(month, 'nudge') || 0)
          .attr('rx', `${SVG.CELL_RX}px`)
          .attr('width', month => getCellAttr(month, 'width'))
          .attr('height', month => getCellAttr(month, 'height'))
          .attr('fill', month => getCellAttr(month, 'fill'))
          .attr('stroke', month => getCellAttr(month, 'stroke'))
          .attr('stroke-width', month => getCellAttr(month, 'strokeWidth'));
      });
  };

  /**
     SVG: Date Range Handles
  */
  const dateRangeHandlesG = selectionEnabled
    ? dragG.append('g').attr('class', 'dateRangeHandlesG')
    : null;
  const redrawDateRangeHandles = () => {
    if (!selectionEnabled) { return; }
    const isHighlighted = d => (dateRangeHoverKey === d || draggingDateRange[d].dragging);
    const yBounds = Object.keys(viewSelections)
      .reduce((acc, key) => {
        const y = getRowY(rowLabels.indexOf(key));
        const low = y - (SVG.CELL_PADDING / 2);
        const high = y + SVG.CELL_HEIGHT + (SVG.CELL_PADDING / 2);
        return [
          acc[0] === null || acc[0] > low ? low : acc[0],
          acc[1] === null || acc[1] < high ? high : acc[1],
        ];
      }, [null, null]);
    dateRangeHandlesG.selectAll('rect')
      .data([0, 1])
      .join('rect')
      .attr('class', d => `dateRange${d === 0 ? 'Start' : 'End'}HandleRect`)
      .attr('x', (d) => {
        const useWidth = isHighlighted(d)
          ? SVG.DATE_RANGE_HANDLE_WIDTH + 2
          : SVG.DATE_RANGE_HANDLE_WIDTH;
        const gutterX = getYearMonthGutterX(dateRange.value[d], d === 0 ? 'left' : 'right');
        if (d === 0 && dateRange.value[d] === TIME.MIN_YEAR_MONTH) {
          return gutterX;
        }
        if (d === 1 && dateRange.value[d] === TIME.MAX_YEAR_MONTH) {
          return gutterX - useWidth;
        }
        return gutterX - (useWidth / 2);
      })
      .attr('width', d => (
        isHighlighted(d) ? SVG.DATE_RANGE_HANDLE_WIDTH + 2 : SVG.DATE_RANGE_HANDLE_WIDTH
      ))
      .attr('y', (d) => {
        if (isHighlighted(d)) {
          return getRowY(rowLabels.length - 1) - (SVG.CELL_PADDING / 2);
        }
        return yBounds[0];
      })
      .attr('height', (d) => {
        if (isHighlighted(d)) {
          return svgHeight - getRowY(rowLabels.length - 1) + (SVG.CELL_PADDING / 2) - 0.5;
        }
        return yBounds[1] - yBounds[0];
      })
      .attr('fill', d => (
        isHighlighted(d) ? COLORS.LIGHT_BLUE[100] : COLORS.LIGHT_BLUE[300]
      ))
      .attr('stroke', Theme.palette.primary.main)
      .style('stroke-width', '1.5px')
      .style('display', sites.value.length ? null : 'none');
  };

  /**
     SVG: Date Range Masks
  */
  const dateRangeMasksG = selectionEnabled
    ? svg.append('g').attr('class', 'dateRangeMasksG')
    : null;
  const redrawDateRangeHandleMasks = () => {
    if (!selectionEnabled) { return; }
    dateRangeMasksG.selectAll('rect')
      .data([0, 1])
      .join('rect')
      .attr('class', d => `dateRange${d === 0 ? 'Start' : 'End'}MaskRect`)
      .attr('x', d => (
        getYearMonthGutterX(dateRange.value[d] || TIME.MIN_YEAR_MONTH, d === 0 ? 'left' : 'right')
          - (SVG.DATE_RANGE_MASK_WIDTH / 2)
          + getTimeOffset()
      ))
      .attr('y', 0)
      .attr('width', SVG.DATE_RANGE_MASK_WIDTH)
      .attr('height', svgHeight)
      .style('cursor', 'ew-resize')
      .style('outline', 'none')
      .attr('fill', 'red')
      .style('opacity', 0)
      .style('display', sites.value.length ? null : 'none');
  };

  /**
     SVG: Selections
  */
  const redrawSelections = () => {
    if (!selectionEnabled) { return; }

    // Row and label backgrounds
    const yOffset = (SVG.CELL_PADDING / 2);
    const yMultiplier = SVG.CELL_HEIGHT + SVG.CELL_PADDING;
    const y = d => yOffset + (rowLabels.length - rowLabels.indexOf(d)) * yMultiplier;
    const fill = d => (
      viewSelections[d] === 'full'
        ? Theme.palette.primary.main
        : COLORS.LIGHT_BLUE[200]
    );
    let startX = getYearMonthGutterX(dateRange.value[0], 'left');
    let endX = getYearMonthGutterX(dateRange.value[1], 'right');
    if (startX > endX) {
      const swapX = startX;
      startX = endX;
      endX = swapX;
    }
    rowSelectionsG.selectAll('rect')
      .data(Object.keys(viewSelections))
      .join('rect')
      .attr('x', startX)
      .attr('y', y)
      .attr('width', endX - startX)
      .attr('height', SVG.CELL_HEIGHT + SVG.CELL_PADDING)
      .attr('fill', fill);
    if (setSitesValue) {
      labelSelectionsG.selectAll('rect')
        .data(Object.keys(viewSelections))
        .join('rect')
        .attr('x', 0)
        .attr('y', y)
        .attr('width', labelWidth)
        .attr('height', SVG.CELL_HEIGHT + SVG.CELL_PADDING)
        .attr('fill', fill);
    }

    // Date range handles
    redrawDateRangeHandles();
  };

  /**
     Redraw functions
  */
  const redraw = () => {
    redrawTimeAxis();
    redrawData();
    if (selectionEnabled) {
      redrawSelections();
    }
  };
  // const debouncedRedraw = debounce(redraw, 150);

  /**
     Invoke initial redraws
  */
  redraw();
  redrawDateRangeHandleMasks();

  /**
     Setup Interactions
  */
  const timeHighlightReset = debounce(() => {
    if (draggingCells) { return; }
    dataMasksG.selectAll('rect').style('cursor', selectionEnabled ? 'pointer' : 'grab');
    timeAxis.mask.style('cursor', 'grab');
    SVG_STYLES.apply(timeAxis.highlight, 'timeHighlight');
  }, 100);

  const timeHighlightHover = () => {
    if (draggingCells) { return; }
    timeHighlightReset.cancel();
    SVG_STYLES.apply(timeAxis.highlight, 'timeHighlightHover');
  };

  let cellDragTime = null;
  const dragCells = drag()
    .on('start', () => {
      draggingCells = true;
      rowHighlightReset(false);
      dataMasksG.selectAll('rect').style('cursor', 'grabbing');
      timeAxis.mask.style('cursor', 'grabbing');
      SVG_STYLES.apply(timeAxis.highlight, 'timeHighlightDrag');
      cellDragTime = (new Date()).getTime();
    })
    .on('drag', () => {
      setTimeOffset(getTimeOffset() + event.dx);
      redrawData();
      redrawDateRangeHandleMasks();
    })
    .on('end', () => {
      draggingCells = false;
      rowHighlightHover(rowHoverKey);
      timeHighlightReset();
      redraw();
      redrawDateRangeHandleMasks();
      // If the drag was less than 1/10 of a second long assume it's a sloppy click.
      // Perform a select action if selection is enabled to keep the end user happy. =)
      cellDragTime = (new Date()).getTime() - cellDragTime;
      if (selectionEnabled && setSitesValue && cellDragTime < 100) {
        SVG_STYLES.touchRipple(dataMasksG.selectAll('rect').filter(d => d === rowHoverKey), 15);
        setTimeout(() => toggleSelection(rowHoverKey), 15);
      }
    });
  dragCells(timeAxis.mask);
  dragCells(dataMasksG.selectAll('rect'));

  timeAxis.mask
    /*
    .on('wheel', () => {
      event.preventDefault();
      const step = (SVG.CELL_WIDTH + SVG.CELL_PADDING) * 3;
      const delta = (event.wheelDelta > 0 ? -1 : 1) * step;
      setTimeOffset(getTimeOffset() + delta);
      debouncedRedraw();
    })
    */
    .on('mouseover', timeHighlightHover)
    .on('focus', timeHighlightHover)
    .on('mouseout', timeHighlightReset)
    .on('blur', timeHighlightReset);

  if (selectionEnabled) {
    const dateRangeHandleReset = debounce(() => {
      dateRangeHoverKey = null;
      redrawDateRangeHandles();
    }, 100);
    const dateRangeHandleHover = (key) => {
      dateRangeHoverKey = key;
      redrawDateRangeHandles();
    };

    // Function to flip date range handles, masks, and values if a drag event puts start after end
    // Shift values by one month on each side if flipping as start looks ahead and end looks back
    const flipDateRangeSelectionIfNeeded = () => {
      if (dateRange.value[1] < dateRange.value[0]) {
        dateRange.value = [
          TIME.getNextMonth(dateRange.value[1]),
          TIME.getPreviousMonth(dateRange.value[0]),
        ];
        // Only if the handles are atop each other will this still be true after the last flip.
        // In this case hard set to the same value (so one month selected).
        if (dateRange.value[1] < dateRange.value[0]) {
          dateRange.value[0] = dateRange.value[1]; // eslint-disable-line prefer-destructuring
        }
      }
    };

    // Interactions for Date Range START Handle
    const dragDateRangeStartMask = dateRangeMasksG.select('.dateRangeStartMaskRect');
    dragDateRangeStartMask
      .on('mouseover', () => dateRangeHandleHover(0))
      .on('focus', () => dateRangeHandleHover(0))
      .on('mouseout', dateRangeHandleReset)
      .on('blur', dateRangeHandleReset);
    const dragDateRangeStart = drag()
      .on('start', () => {
        draggingDateRange[0].dragging = true;
        draggingDateRange[0].centerDragX = parseFloat(dragDateRangeStartMask.attr('x'), 10)
          + (SVG.DATE_RANGE_MASK_WIDTH / 2);
      })
      .on('drag', () => {
        draggingDateRange[0].centerDragX += event.dx;
        dragDateRangeStartMask.attr('x', draggingDateRange[0].centerDragX - (SVG.DATE_RANGE_MASK_WIDTH / 2));
        const adjacentYearMonth = getAdjacentYearMonth(dateRange.value[0], event.dx > 0 ? 'right' : 'left');
        const adjacentYearMonthStartX = getYearMonthGutterX(adjacentYearMonth, 'left');
        const currentYearMonthStartX = getYearMonthGutterX(dateRange.value[0], 'left');
        const insideClipCenterDragX = draggingDateRange[0].centerDragX - getTimeOffset();
        const distanceToAdjacent = Math.abs(insideClipCenterDragX - adjacentYearMonthStartX);
        const distanceToCurrent = Math.abs(insideClipCenterDragX - currentYearMonthStartX);
        if (adjacentYearMonth !== dateRange.value[0] && distanceToAdjacent < distanceToCurrent) {
          dateRange.value[0] = adjacentYearMonth;
          redrawSelections();
        }
      })
      .on('end', () => {
        draggingDateRange[0].dragging = false;
        draggingDateRange[0].centerDragX = 0;
        // Recenter mask as it is likely off a few pixels due to snap-to-gutter behavior
        const maskX = getYearMonthGutterX(dateRange.value[0], 'left')
          + (SVG.DATE_RANGE_MASK_WIDTH / 2)
          + getTimeOffset();
        dateRangeMasksG.select('.dateRangeStartMaskRect').attr('x', maskX);
        flipDateRangeSelectionIfNeeded();
        setDateRangeValue([...dateRange.value]);
        redrawSelections();
      });
    dragDateRangeStart(dateRangeMasksG.select('.dateRangeStartMaskRect'));

    // Interactions for Date Range END Handle
    const dragDateRangeEndMask = dateRangeMasksG.select('.dateRangeEndMaskRect');
    dragDateRangeEndMask
      .on('mouseover', () => dateRangeHandleHover(1))
      .on('focus', () => dateRangeHandleHover(1))
      .on('mouseout', dateRangeHandleReset)
      .on('blur', dateRangeHandleReset);
    const dragDateRangeEnd = drag()
      .on('start', () => {
        draggingDateRange[1].dragging = true;
        draggingDateRange[1].centerDragX = parseFloat(dragDateRangeEndMask.attr('x'), 10)
          + (SVG.DATE_RANGE_MASK_WIDTH / 2);
      })
      .on('drag', () => {
        draggingDateRange[1].centerDragX += event.dx;
        dragDateRangeEndMask.attr('x', draggingDateRange[1].centerDragX - (SVG.DATE_RANGE_MASK_WIDTH / 2));
        const adjacentYearMonth = getAdjacentYearMonth(dateRange.value[1], event.dx > 0 ? 'right' : 'left');
        const adjacentYearMonthEndX = getYearMonthGutterX(adjacentYearMonth, 'right');
        const currentYearMonthEndX = getYearMonthGutterX(dateRange.value[1], 'right');
        const insideClipCenterDragX = draggingDateRange[1].centerDragX - getTimeOffset();
        const distanceToAdjacent = Math.abs(insideClipCenterDragX - adjacentYearMonthEndX);
        const distanceToCurrent = Math.abs(insideClipCenterDragX - currentYearMonthEndX);
        if (adjacentYearMonth !== dateRange.value[1] && distanceToAdjacent < distanceToCurrent) {
          dateRange.value[1] = adjacentYearMonth;
          redrawSelections();
        }
      })
      .on('end', () => {
        draggingDateRange[1].dragging = false;
        draggingDateRange[1].centerDragX = 0;
        // Recenter mask as it is likely off a few pixels due to snap-to-gutter behavior
        const maskX = getYearMonthGutterX(dateRange.value[1], 'right')
          - (SVG.DATE_RANGE_MASK_WIDTH / 2)
          + getTimeOffset();
        dateRangeMasksG.select('.dateRangeEndMaskRect').attr('x', maskX);
        flipDateRangeSelectionIfNeeded();
        setDateRangeValue([...dateRange.value]);
        redrawSelections();
      });
    dragDateRangeEnd(dateRangeMasksG.select('.dateRangeEndMaskRect'));
  }
}
