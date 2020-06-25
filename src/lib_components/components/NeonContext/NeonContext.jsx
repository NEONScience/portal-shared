import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
} from 'react';
import PropTypes from 'prop-types';

import cloneDeep from 'lodash/cloneDeep';

import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

import Authenticate from '../../auth/authenticate';
import NeonGraphQL from '../NeonGraphQL/NeonGraphQL';
import sitesJSON from '../../staticJSON/sites.json';
import statesJSON from '../../staticJSON/states.json';
import domainsJSON from '../../staticJSON/domains.json';
import bundlesJSON from '../../staticJSON/bundles.json';
import timeSeriesDataProductsJSON from '../../staticJSON/timeSeriesDataProducts.json';

export const FETCH_STATUS = {
  AWAITING_CALL: 'AWAITING_CALL',
  FETCHING: 'FETCHING',
  ERROR: 'ERROR',
  SUCCESS: 'SUCCESS',
};

const DEFAULT_STATE = {
  data: {
    sites: {},
    states: statesJSON,
    domains: domainsJSON,
    bundles: bundlesJSON,
    timeSeriesDataProducts: timeSeriesDataProductsJSON,
    stateSites: {}, // derived when sites is fetched
    domainSites: {}, // derived when sites is fetched
  },
  html: {
    header: null,
    footer: null,
  },
  fetches: {
    sites: { status: FETCH_STATUS.AWAITING_CALL, error: null },
    auth: { status: null, error: null },
    header: { status: null, error: null },
    footer: { status: null, error: null },
  },
  isAuthenticated: false,
  isActive: false,
  isFinal: false,
  hasError: false,
};

// Derive values for stateSites and domainSites in state. This is a one-time mapping we
// generate when sites are loaded into state containing lists of site codes for each
// state code / domain code.
const deriveRegionSites = (state) => {
  const stateSites = {};
  const domainSites = {};
  Object.keys(state.data.sites).forEach((siteCode) => {
    const { stateCode, domainCode } = state.data.sites[siteCode];
    if (!stateSites[stateCode]) { stateSites[stateCode] = new Set(); }
    if (!domainSites[domainCode]) { domainSites[domainCode] = new Set(); }
    stateSites[stateCode].add(siteCode);
    domainSites[domainCode].add(siteCode);
  });
  // Fill in empty sets for any states that had no NEON sites
  Object.keys(state.data.states).forEach((stateCode) => {
    if (!stateSites[stateCode]) { stateSites[stateCode] = new Set(); }
  });
  return {
    ...state,
    data: { ...state.data, stateSites, domainSites },
  };
};

// TODO: where to put this?
const HTML_URLS = {
  header: 'https://master-7rqtwti-di4alr4iwbwyg.us-2.platformsh.site/neon-assets/partial/header',
  footer: 'https://master-7rqtwti-di4alr4iwbwyg.us-2.platformsh.site/neon-assets/partial/footer',
};

/**
   CONTEXT
*/
const Context = createContext(DEFAULT_STATE);

/**
   HOOK
*/
const useNeonContextState = () => {
  const hookResponse = useContext(Context);
  // If called by a component that's not inside a NeonContext the hookResponse will be
  // DEFAULT_STATE. Otherwise it will return an array of length one containing the current state.
  // Thus we double-check here that we got an active state before returning it.
  if (!Array.isArray(hookResponse) || !hookResponse[0].isActive) {
    return [
      { ...DEFAULT_STATE },
      () => {},
    ];
  }
  return hookResponse;
};

/**
   Reducer
*/
const reducer = (state, action) => {
  // Always deep clone fetches as that's the main thing we care about
  // changing to trigger re-renders in the consumer.
  const newState = { ...state, fetches: cloneDeep(state.fetches) };
  switch (action.type) {
    case 'fetchCalled':
      if (!action.key || !state.fetches[action.key]) { return state; }
      newState.fetches[action.key].status = FETCH_STATUS.FETCHING;
      return newState;

    // Actions for handling sites fetch
    case 'fetchSitesSucceeded':
      newState.fetches.sites.status = FETCH_STATUS.SUCCESS;
      newState.data.sites = action.sites;
      newState.isFinal = true;
      return deriveRegionSites(newState);
    case 'fetchSitesFailed':
      newState.fetches.sites.status = FETCH_STATUS.ERROR;
      newState.fetches.sites.error = action.error;
      newState.isFinal = true;
      newState.hasError = true;
      return newState;

    // Actions for handling auth fetch
    case 'fetchAuthSucceeded':
      newState.fetches.auth.status = FETCH_STATUS.SUCCESS;
      newState.isAuthenticated = !!action.isAuthenticated;
      return newState;
    case 'fetchAuthFailed':
      newState.fetches.auth.status = FETCH_STATUS.ERROR;
      newState.isAuthenticated = false;
      return newState;

    // Actions for handling HTML fetches
    case 'fetchHtmlSucceeded':
      if (!Object.keys(HTML_URLS).includes(action.part)) { return state; }
      newState.fetches[action.part].status = FETCH_STATUS.SUCCESS;
      newState.html[action.part] = action.html;
      return newState;
    case 'fetchHtmlFailed':
      if (!Object.keys(HTML_URLS).includes(action.part)) { return state; }
      newState.fetches[action.part].status = FETCH_STATUS.ERROR;
      newState.fetches[action.part].error = action.error;
      return newState;

    default:
      return state;
  }
};

/**
   Function to convert sites fetch response to the shape we expect
*/
const parseSitesFetchResponse = (sitesArray = []) => {
  if (!Array.isArray(sitesArray)) { return {}; }
  const sitesObj = {};
  sitesArray.forEach((site) => {
    sitesObj[site.siteCode] = {
      siteCode: site.siteCode || site.code,
      description: site.siteDescription || site.description,
      type: site.siteType || site.type,
      stateCode: site.stateCode,
      domainCode: site.domainCode,
      latitude: site.siteLatitude || site.latitude,
      longitude: site.siteLongitude || site.longitude,
      terrain: site.terrain || sitesJSON[site.siteCode].terrain,
      zoom: site.zoom || sitesJSON[site.siteCode].zoom,
    };
  });
  return sitesObj;
};

/**
   Context Provider
*/
const Provider = (props) => {
  const { useCoreAuth, useCoreHeader, children } = props;

  const initialState = cloneDeep(DEFAULT_STATE);
  initialState.isActive = true;
  if (useCoreAuth) {
    initialState.fetches.auth.status = FETCH_STATUS.AWAITING_CALL;
  }
  if (!useCoreHeader) {
    initialState.fetches.header.status = FETCH_STATUS.AWAITING_CALL;
    initialState.fetches.footer.status = FETCH_STATUS.AWAITING_CALL;
  }
  const [state, dispatch] = useReducer(reducer, initialState);

  const fetchHTML = (part) => {
    if (!Object.keys(HTML_URLS).includes(part)) { return; }
    window.fetch(HTML_URLS[part], { method: 'GET', headers: { Accept: 'text/html' } })
      .then(response => response.text())
      .then((html) => {
        dispatch({ type: 'fetchHtmlSucceeded', part, html });
        return of(true);
      })
      .catch((error) => {
        dispatch({ type: 'fetchHtmlFailed', part, error });
        return of(false);
      });
  };

  // Subject and effect to perform and manage the sites GraphQL fetch
  const fetchMethods = {
    sites: () => {
      NeonGraphQL.getAllSites().pipe(
        map((response) => {
          if (response.response && response.response.data && response.response.data.sites) {
            const sites = parseSitesFetchResponse(response.response.data.sites);
            dispatch({ type: 'fetchSitesSucceeded', sites });
            return of(true);
          }
          dispatch({ type: 'fetchSitesFailed', error: 'malformed response' });
          return of(false);
        }),
        catchError((error) => {
          dispatch({ type: 'fetchSitesFailed', error: error.message });
          return of(false);
        }),
      ).subscribe();
    },
    auth: () => {
      const auth = new Authenticate();
      auth.isAuthenticated(
        (response) => {
          dispatch({ type: 'fetchAuthSucceeded', isAuthenticated: auth.checkAuthResponse(response) });
        },
        (error) => {
          dispatch({ type: 'fetchAuthFailed', error });
        },
      );
    },
    header: () => fetchHTML('header'),
    footer: () => fetchHTML('footer'),
  };

  // Effect: Trigger all fetches that are awaiting call
  useEffect(() => {
    Object.keys(state.fetches).forEach((key) => {
      if (
        state.fetches[key].status !== FETCH_STATUS.AWAITING_CALL
          || typeof fetchMethods[key] !== 'function'
      ) { return; }
      dispatch({ type: 'fetchCalled', key });
      fetchMethods[key]();
    });
  });

  /**
     Render
  */
  return (
    <Context.Provider value={[state]}>
      {children}
    </Context.Provider>
  );
};

Provider.propTypes = {
  useCoreAuth: PropTypes.bool,
  useCoreHeader: PropTypes.bool,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.oneOfType([
      PropTypes.node,
      PropTypes.string,
    ])),
    PropTypes.node,
    PropTypes.string,
  ]).isRequired,
};

Provider.defaultProps = {
  useCoreAuth: false,
  useCoreHeader: false,
};

/**
   getWrappedComponent
*/
const getWrappedComponent = Component => (props) => {
  const [{ isActive }] = useNeonContextState();
  if (!isActive) {
    return (
      <Provider>
        <Component {...props} />
      </Provider>
    );
  }
  return <Component {...props} />;
};

/**
   Export
*/
const NeonContext = {
  Provider,
  useNeonContextState,
  DEFAULT_STATE,
  getWrappedComponent,
};
export default NeonContext;
