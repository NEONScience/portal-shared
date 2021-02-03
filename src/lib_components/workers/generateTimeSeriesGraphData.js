/* eslint-disable no-unreachable */
import Parallel from 'paralleljs';

export function getTimeSteps() {
  return {
    '1min': { key: '1min', tmi: '001', seconds: 60 },
    '2min': { key: '2min', tmi: '002', seconds: 120 },
    '5min': { key: '5min', tmi: '005', seconds: 300 },
    '15min': { key: '15min', tmi: '015', seconds: 900 },
    '30min': { key: '30min', tmi: '030', seconds: 1800 },
    '60min': { key: '1hr', tmi: '060', seconds: 3600 },
    '0AQ': { key: '0AQ', tmi: '100', seconds: 60 },
    '1day': { key: '1day', tmi: '01D', seconds: 86400 },
  };
}

function monthIsValidFormat(month) {
  return (typeof month === 'string' && /\d{4}-\d{2}/.test(month));
}

function monthToNumbers(month) {
  if (!monthIsValidFormat(month)) { return [null, null]; }
  const split = month.split('-');
  return { y: parseInt(split[0], 10), m: parseInt(split[1], 10) };
}

function monthIsValid(month) {
  if (!monthIsValidFormat(month)) { return false; }
  const { y, m } = monthToNumbers(month);
  return (y >= 2000 && m >= 1 && m <= 12);
}

function monthToTicker(month) {
  if (!monthIsValid(month)) { return 0; }
  const { y, m } = monthToNumbers(month);
  return Date.UTC(y, m - 1, 1, 0, 0, 0);
}

function tickerIsValid(ticker) {
  return (typeof ticker === 'number' && !Number.isNaN(ticker) && ticker > 0);
}

function tickerToMonth(ticker) {
  if (!tickerIsValid(ticker)) { return null; }
  const d = new Date(ticker);
  const YYYY = d.getUTCFullYear().toString();
  const MM = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  return `${YYYY}-${MM}`;
}

function tickerToIso(ticker) {
  if (!tickerIsValid(ticker)) { return null; }
  const d = new Date(ticker);
  const YYYY = d.getUTCFullYear().toString();
  const MM = (d.getUTCMonth() + 1).toString().padStart(2, '0');
  const DD = d.getUTCDay().toString().padStart(2, '0');
  const hh = d.getUTCHours().toString().padStart(2, '0');
  const mm = d.getUTCMinutes().toString().padStart(2, '0');
  const ss = d.getUTCSeconds().toString().padStart(2, '0');
  return `${YYYY}-${MM}-${DD}T${hh}:${mm}:${ss}Z`;
}

function getNextMonth(month) {
  if (!monthIsValid(month)) { return null; }
  let { y, m } = monthToNumbers(month);
  m += 1;
  if (m === 13) { m = 1; y += 1; }
  return `${y.toString()}-${m.toString().padStart(2, '0')}`;
}

/**
   Worker - Generate Time Series Graph Data

   This function workerizes the process of building the graphData object for TimeSeriesViewer state.
   This object is built using parsed series data from elsewhere in state by combining individual
   site/month/variable series into single site/variable series registered to the generated time
   series.

   @param {Object} state - complete TimeSeriesViewer state
   @return {Object} graphData object to be applied to state
*/
export default function generateTimeSeriesGraphData(payload = {}) {
  const worker = (new Parallel(payload))
    .require(getTimeSteps)
    .require(monthIsValidFormat)
    .require(monthToNumbers)
    .require(monthIsValid)
    .require(monthToTicker)
    .require(tickerIsValid)
    .require(tickerToMonth)
    .require(tickerToIso)
    .require(getNextMonth);

  return worker.spawn((inData) => {
    /**
       Deconstruct necessary values from state
    */
    const {
      product,
      variables: stateVariables,
      selection: {
        autoTimeStep,
        continuousDateRange,
        dateRange,
        dateTimeVariable,
        qualityFlags,
        sites,
        timeStep: selectedTimeStep,
        variables: selectedVariables,
      },
    } = inData;
    const timeStep = selectedTimeStep === 'auto' ? autoTimeStep : selectedTimeStep;
    const qfNullFill = qualityFlags.map(() => null);
    const TIME_STEPS = getTimeSteps();

    /**
       Validate input (return unmodified state.graphData if anything fails)
    */
    // TBD

    /**
       Initialize data set with timestep-based times and monthOffsets for registering actual data
    */
    // Reinitialize
    const newData = [];
    const newQualityData = [];
    const newMonthOffsets = {};
    const newTimestampMap = {};
    // Sanity check: must have a valid time step
    if (!TIME_STEPS[timeStep]) {
      console.log('IN WORKER - buildTimeData - BAIL', timeStep);
      // return { ...graphData, data: [[0, 0]] };
    }
    // Tick through date range one time step at a time to build data / qualityData / timeStampMap
    const { seconds } = TIME_STEPS[timeStep];
    let ticker = monthToTicker(dateRange[0]);
    const endMonth = getNextMonth(dateRange[1]);
    let currentMonth = tickerToMonth(ticker);
    let previousMonth = null;
    let offset = null;
    let endStep = null;
    while (currentMonth < endMonth) {
      newData.push([new Date(ticker)]);
      endStep = ticker + (seconds * 1000);
      newQualityData.push([new Date(ticker), new Date(endStep)]);
      offset = newData.length - 1;
      newTimestampMap[ticker] = offset;
      if (currentMonth !== previousMonth) {
        newMonthOffsets[currentMonth] = offset;
        previousMonth = currentMonth;
      }
      ticker += (seconds * 1000);
      currentMonth = tickerToMonth(ticker);
    }
    if (newData.length === 0) { newData.push([0, 0]); }

    /**
       Build the rest of the data structure and labels using selection values
    */
    // Reinitialize
    const newSeries = [];
    const newLabels = ['x'];
    const newQualityLabels = ['start', 'end'];
    // Sanity check: must have a valid dateTimeVariable
    // if (!dateTimeVariable) { return graphData; }
    // Loop through each site...
    sites.forEach((site) => {
      const { siteCode, positions } = site;
      // Loop through each site position...
      positions.forEach((position) => {
        // Generate quality flag label and add to the list of quality labels
        const qualityLabel = `${siteCode} - ${position}`;
        if (qualityFlags.length && !newQualityLabels.includes(qualityLabel)) {
          newQualityLabels.push(qualityLabel);
        }

        // For each site position loop through every month in the continuous date range (no gaps)
        continuousDateRange.forEach((month) => {
          // Use monthOffsets to determine where in the entire data set this month belongs
          if (!Object.keys(newMonthOffsets).includes(month)) { return; }
          const monthIdx = newMonthOffsets[month];
          const nextMonth = getNextMonth(month);
          const monthStepCount = Object.keys(newMonthOffsets).includes(nextMonth)
            ? newMonthOffsets[nextMonth] - monthIdx
            : newData.length - monthIdx;

          // For each site/position/month loop through all selected variables...
          selectedVariables.forEach((variable) => {
            // Generate series label and add to the list of labels if this is the first we see it
            const label = `${siteCode} - ${position} - ${variable}`;
            if (!newLabels.includes(label)) {
              newLabels.push(label);
              newSeries.push({
                siteCode,
                position,
                variable,
                label,
                units: stateVariables[variable].units,
              });
            }
            const columnIdx = newLabels.indexOf(label);
            if (!columnIdx) { return; } // 0 is x, so this should always be 1 or greater
            const { downloadPkg: pkg } = stateVariables[variable];
            const posData = product.sites[siteCode].positions[position].data;
            // Null-fill if this site/position/month/variable has
            // neither series data nor dateTime data
            if (
              !posData[month]
                || !posData[month][pkg]
                || !posData[month][pkg][timeStep]
                || !posData[month][pkg][timeStep].series[variable]
                || !posData[month][pkg][timeStep].series[dateTimeVariable]
            ) {
              for (let t = monthIdx; t < monthIdx + monthStepCount; t += 1) {
                newData[t][columnIdx] = null;
              }
              return;
            }
            // This site/position/month/variable series exists, so add it into the data set
            const seriesStepCount = posData[month][pkg][timeStep].series[variable].data.length;
            // Series and month data lengths are either identical (as expected) then we can stream
            // values directly in without matching timestamps
            if (seriesStepCount === monthStepCount) {
              posData[month][pkg][timeStep].series[variable].data.forEach((d, datumIdx) => {
                newData[datumIdx + monthIdx][columnIdx] = d;
              });
              return;
            }
            // More series data than month data - for now, stream values directly in
            // without matching timestamps, being careful to not go over the month step count
            if (seriesStepCount >= monthStepCount) {
              posData[month][pkg][timeStep].series[variable].data.forEach((d, datumIdx) => {
                if (datumIdx >= monthStepCount) { return; }
                newData[datumIdx + monthIdx][columnIdx] = d;
              });
              return;
            }
            // Series data length is shorter than expected month length
            // Add what data we have by going through each time step in the month and comparing to
            // start dates in the data set, null-filling any steps without a corresponding datum
            const setSeriesValueByTimestamp = (t) => {
              const isodate = tickerToIso(newData[t][0].getTime());
              const dataIdx = posData[month][pkg][timeStep].series[dateTimeVariable].data
                .findIndex((dateTimeVal) => dateTimeVal === isodate);
              newData[t][columnIdx] = dataIdx !== -1
                ? posData[month][pkg][timeStep].series[variable].data[dataIdx]
                : null;
            };
            for (let t = monthIdx; t < monthIdx + monthStepCount; t += 1) {
              setSeriesValueByTimestamp(t);
            }
          });

          // Also for each site/position/month loop through all selected quality flags...
          qualityFlags.forEach((qf, qfIdx) => {
            const columnIdx = newQualityLabels.indexOf(qualityLabel);
            if (columnIdx < 2) { return; } // 0 is start and 1 is end
            const { downloadPkg: pkg } = stateVariables[qf];
            const posData = product.sites[siteCode].positions[position].data;
            // If this site/position/month/variable has no series data then fill with nulls
            if (
              !posData[month]
                || !posData[month][pkg]
                || !posData[month][pkg][timeStep]
                || !posData[month][pkg][timeStep].series[qf]
            ) {
              for (let t = monthIdx; t < monthIdx + monthStepCount; t += 1) {
                newQualityData[t][columnIdx] = [...qfNullFill];
              }
              return;
            }
            // This site/position/month/qf series exists, so add it into the quality data set
            const seriesStepCount = posData[month][pkg][timeStep].series[qf].data.length;
            if (seriesStepCount !== monthStepCount) {
              // The series data length does not match the expected month length so
              // loop through by month steps pulling in series values through timestamp matching
              const setQualityValueByTimestamp = (t) => {
                const isodate = tickerToIso(newQualityData[t][0].getTime());
                const dataIdx = posData[month][pkg][timeStep].series[dateTimeVariable].data
                  .findIndex((dateTimeVal) => dateTimeVal === isodate);
                if (dataIdx === -1) {
                  newQualityData[t][columnIdx] = [...qfNullFill];
                  return;
                }
                const d = posData[month][pkg][timeStep].series[qf].data[dataIdx];
                newQualityData[t][columnIdx] = qfIdx ? [...newQualityData[t][columnIdx], d] : [d];
              };
              for (let t = monthIdx; t < monthIdx + monthStepCount; t += 1) {
                setQualityValueByTimestamp(t);
              }
              return;
            }
            // Series and month data lengths are identical as expected so we can stream
            // values directly in without matching timestamps
            posData[month][pkg][timeStep].series[qf].data.forEach((d, datumIdx) => {
              const t = datumIdx + monthIdx;
              newQualityData[t][columnIdx] = qfIdx ? [...newQualityData[t][columnIdx], d] : [d];
            });
          });
        });
      });
    });
    // With series and qualityLabels built out purge any hidden labels that are no longer present
    // MOVE BACK TO graph.js
    /*
    const seriesLabels = newSeries.map((s) => s.label);
    if (
      Array.from(graphState.hiddenQualityFlags).some((label) => !newQualityLabels.includes(label))
        || Array.from(graphState.hiddenSeries).some((label) => !seriesLabels.includes(label))
    ) {
      graphDispatch({
        type: 'purgeRemovedHiddenLabels',
        qualityLabels: newQualityLabels.slice(2),
        seriesLabels,
      });
    }
    */

    /**
       Apply generated values and return the result
    */
    const outData = inData.graphData;
    outData.data = newData;
    outData.qualityData = newQualityData;
    outData.monthOffsets = newMonthOffsets;
    outData.timestampMap = newTimestampMap;
    outData.series = newSeries;
    outData.labels = newLabels;
    outData.qualityLabels = newQualityLabels;
    return outData;
  });
}
