import React from 'react';

import HomeIcon from '@material-ui/icons/Home';
import BasicComponentsIcon from '@material-ui/icons/ViewModule';

import NeonPage from './lib_components/components/NeonPage/NeonPage';
import NeonRouter from './lib_components/components/NeonRouter/NeonRouter';

import Home from './components/Home';
import BasicComponents from './components/BasicComponents';
import AopDataViewerStyleGuide from './lib_components/components/AopDataViewer/StyleGuide';
import DataProductAvailabilityStyleGuide from './lib_components/components/DataProductAvailability/StyleGuide';
import DataThemeIconStyleGuide from './lib_components/components/DataThemeIcon/StyleGuide';
import DocumentViewerStyleGuide from './lib_components/components/DocumentViewer/StyleGuide';
import DownloadDataButtonStyleGuide from './lib_components/components/DownloadDataButton/StyleGuide';
import DownloadDataContextStyleGuide from './lib_components/components/DownloadDataContext/StyleGuide';
import ExternalHostInfoStyleGuide from './lib_components/components/ExternalHostInfo/StyleGuide';
import FullWidthVisualizationStyleGuide from './lib_components/components/FullWidthVisualization/StyleGuide';
import MapSelectionButtonStyleGuide from './lib_components/components/MapSelectionButton/StyleGuide';
import NeonAuthStyleGuide from './lib_components/components/NeonAuth/StyleGuide';
import NeonContextStyleGuide from './lib_components/components/NeonContext/StyleGuide';
import NeonEnvironmentStyleGuide from './lib_components/components/NeonEnvironment/StyleGuide';
import NeonGraphQLStyleGuide from './lib_components/components/NeonGraphQL/StyleGuide';
import NeonPageStyleGuide from './lib_components/components/NeonPage/StyleGuide';
import ReleaseFilterStyleGuide from './lib_components/components/ReleaseFilter/StyleGuide';
import SiteChipStyleGuide from './lib_components/components/SiteChip/StyleGuide';
import SiteMapStyleGuide from './lib_components/components/SiteMap/StyleGuide';
import StoryMapStyleGuide from './lib_components/components/StoryMap/StyleGuide';
import ThemeStyleGuide from './lib_components/components/Theme/StyleGuide';
import TimeSeriesViewerStyleGuide from './lib_components/components/TimeSeriesViewer/StyleGuide';

const sidebarLinks = [
  {
    name: 'Home',
    pageTitle: 'Core Components',
    icon: HomeIcon,
    component: Home,
  },
  {
    name: 'Basic Components',
    hash: '#BasicComponents',
    component: BasicComponents,
    icon: BasicComponentsIcon,
  },
  {
    name: 'AOP Data Viewer',
    hash: '#AopDataViewer',
    component: AopDataViewerStyleGuide,
  },
  {
    name: 'Data Product Availability',
    hash: '#DataProductAvailability',
    component: DataProductAvailabilityStyleGuide,
  },
  {
    name: 'Data Theme Icon',
    hash: '#DataThemeIcon',
    component: DataThemeIconStyleGuide,
  },
  {
    name: 'Document Viewer',
    hash: '#DocumentViewer',
    component: DocumentViewerStyleGuide,
  },
  {
    name: 'Download Data Button',
    hash: '#DownloadDataButton',
    component: DownloadDataButtonStyleGuide,
  },
  {
    name: 'Download Data Context',
    hash: '#DownloadDataContext',
    component: DownloadDataContextStyleGuide,
  },
  {
    name: 'External Host Info',
    hash: '#ExternalHostInfo',
    component: ExternalHostInfoStyleGuide,
  },
  {
    name: 'Full Width Visualization',
    hash: '#FullWidthVisualization',
    component: FullWidthVisualizationStyleGuide,
  },
  {
    name: 'Map Selection Button',
    hash: '#MapSelectionButton',
    component: MapSelectionButtonStyleGuide,
  },
  {
    name: 'Neon Authentication',
    hash: '#NeonAuth',
    component: NeonAuthStyleGuide,
  },
  {
    name: 'Neon Context',
    hash: '#NeonContext',
    component: NeonContextStyleGuide,
  },
  {
    name: 'Neon GraphQL',
    hash: '#NeonGraphQL',
    component: NeonGraphQLStyleGuide,
  },
  {
    name: 'Neon Environment',
    hash: '#NeonEnvironment',
    component: NeonEnvironmentStyleGuide,
  },
  {
    name: 'Neon Page',
    hash: '#NeonPage',
    component: NeonPageStyleGuide,
  },
  {
    name: 'Release Filter',
    hash: '#ReleaseFilter',
    component: ReleaseFilterStyleGuide,
  },
  {
    name: 'Site Chip',
    hash: '#SiteChip',
    component: SiteChipStyleGuide,
  },
  {
    name: 'Site Map',
    hash: '#SiteMap',
    component: SiteMapStyleGuide,
  },
  {
    name: 'Story Map',
    hash: '#StoryMap',
    component: StoryMapStyleGuide,
  },
  {
    name: 'Theme',
    hash: '#Theme',
    component: ThemeStyleGuide,
  },
  {
    name: 'Time Series Viewer',
    hash: '#TimeSeriesViewer',
    component: TimeSeriesViewerStyleGuide,
  },
];

export default function App() {
  let sidebarSubtitle = null;
  if (process.env.REACT_APP_VERSION) {
    sidebarSubtitle = `version ${process.env.REACT_APP_VERSION}`;
  }
  return (
    <NeonRouter>
      <NeonPage
        title="NEON Data Portal Core Components"
        sidebarSubtitle={sidebarSubtitle}
        sidebarLinks={sidebarLinks}
        sidebarLinksAsStandaloneChildren
        useCoreAuth
      >
        <Home />
      </NeonPage>
    </NeonRouter>
  );
}
