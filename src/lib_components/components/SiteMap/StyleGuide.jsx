/* eslint-disable react/jsx-one-expression-per-line, jsx-a11y/anchor-is-valid, no-unused-vars, max-len */

import React from 'react';

import cloneDeep from 'lodash/cloneDeep';

import { makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Link from '@material-ui/core/Link';
import Paper from '@material-ui/core/Paper';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Typography from '@material-ui/core/Typography';

import DocBlock from '../../../components/DocBlock';
import CodeBlock from '../../../components/CodeBlock';
import ExampleBlock from '../../../components/ExampleBlock';
import PropsTable from '../../../components/PropsTable';

import Theme from '../Theme/Theme';
import SiteMap from './SiteMap';

import {
  MAP_ZOOM_RANGE,
  TILE_LAYERS,
  VIEWS,
} from './SiteMapUtils';

const useStyles = makeStyles(theme => ({
  divider: {
    margin: theme.spacing(3, 0),
  },
  propTableRowGrey: {
    backgroundColor: theme.palette.grey[50],
  },
}));

const propRows = [
  {
    name: 'aspectRatio',
    type: 'number',
    default: 'null',
    examples: (
      <div>
        <tt>0.5625</tt> (16:9)
        <br />
        <tt>0.5</tt> (2:1)
      </div>
    ),
    description: (
      <React.Fragment>
        <p>
          Desired map height divided by desired map width. Setting discrete dimensions is not
          supported as Site Map instances will always try to expand to the full width of their
          containing element.
        </p>
        <p>
          Use this prop to control the height indirectly by expressing the ratio of height to width
          such that the shape of the Site Map will remain consistent at any viewport size. Omitting
          this prop will set aspect ratio dynamically based on viewport size (e.g. wider for larger
          viewports, more square for smaller viewports, taller for very small / phone viewports).
        </p>
      </React.Fragment>
    ),
  },
  {
    name: 'center',
    type: 'array of exactly two numbers',
    default: '[52.28, -110.75]',
    examples: (
      <div>
        <tt>[33.9, -110.5]</tt> (US southwest)
        <br />
        <tt>[65.85, -151.5]</tt> (Alaska)
      </div>
    ),
    description: (
      <p>
        Array expressing latitude and longitude to set as the initial center of the map.
        Default value is a point chosen to approximately center the entire set of existing
        filed sites in a map at the appropriate zoom level.
      </p>
    ),
  },
  {
    name: 'filterPosition',
    type: (
      <div>
        string, one of:
        <br />
        <tt>
          <div>&quot;top&quot;</div>
          <div>&quot;bottom&quot;</div>
        </tt>
      </div>
    ),
    default: '"bottom"',
    description: (
      <p>
        Whether the fitlers (map/table toggle button group and features button) should appear above
        or below the main content area of the component.
      </p>
    ),
  },
  {
    name: 'location',
    type: 'string',
    default: 'null',
    description: (
      <React.Fragment>
        <p>
          A location code, as it would appear in the locations API, to initialize the focus of the
          map. This can be any site code (e.g. &quot;ABBY&quot;, &quot;CPER&quot;), domain code
          (e.g. &quot;D03&quot;, &quot;D17&quot;), state code (e.g. &quot;CO&quot;, &quot;NY&quot;),
          or even a finer-grain location code for any site feature (e.g.
          &quot;ARIK.AOS.benchmark.2&quot;, &quot;BARR_035.birdGrid.brd&quot;).
        </p>
        <p>
          If set this will override any zoom and/or center props as the focus location will
          determine the zoom and center for the map.
        </p>
      </React.Fragment>
    ),
  },
  {
    name: 'tileLayer',
    type: (
      <div>
        string, one of:
        <br />
        <tt>
          {Object.keys(TILE_LAYERS).map(k => <div key={k}>{`"${k}"`}</div>)}
        </tt>
      </div>
    ),
    default: '"NATGEO_WORLD_MAP"',
    description: (
      <p>
        Initial tile layer for the map (i.e. the visual appearance of the map). Valid values
        are defined in the Site Map <tt>TILE_LAYERS</tt> data structure and include a name, url,
        and attribution strings. This is only the initial layer; a user may change the tile layer
        through stock Leaflet UI once loaded.
      </p>
    ),
  },
  {
    name: 'unusableVerticalSpace',
    type: 'integer',
    default: '0',
    examples: (
      <div>
        <tt>50</tt>, <tt>100</tt>, <tt>200</tt>
      </div>
    ),
    description: (
      <React.Fragment>
        <p>
          Dynamic aspect ratio is based on window innerHeight and innerWidth. In sitautions where the
          available height or width differs this value can be used to still have a dynamic aspect
          ratio but one that respects the actual available space on the page.
        </p>
        <p>
          As an example, consider a page rendering a SiteMap that has a sticky header with a height
          of 150 pixels. Typically the SiteMap would not know about this, so the aspect ratio tuned
          to the total height of the page may render a SiteMap that is too tall to fit in the
          available content area at any viewport size. Setting this prop to <tt>150</tt> would then
          inform the aspect ratio calculation and at all viewport sizes the SiteMap should end up
          with a height that vertically fits in the scrollable area.
        </p>
      </React.Fragment>
    ),
  },
  {
    name: 'view',
    type: (
      <div>
        string, one of:
        <br />
        <tt>
          {Object.keys(VIEWS).map(k => <div key={k}>{`"${k.toLowerCase()}"`}</div>)}
        </tt>
      </div>
    ),
    default: '"map"',
    description: (
      <p>
        Initial view mode for the SiteMap component.
      </p>
    ),
  },
  {
    name: 'zoom',
    type: 'integer',
    default: 'null',
    examples: (
      <div>
        <tt>2</tt>, <tt>9</tt>, <tt>17</tt>
      </div>
    ),
    description: (
      <React.Fragment>
        <p>
          Initial zoom level for the map. Min and max zoom levels are hard-coded
          to <tt>{MAP_ZOOM_RANGE[0]}</tt> and <tt>{MAP_ZOOM_RANGE[1]}</tt> respectively, so the zoom
          prop must be equal to or between these values. A greater value is a closer zoom.
        </p>
        <p>
          When undefined, and if the location prop is not set, the initial zoom is dynamically
          derived to ensure all sites are in view given the dynamically derived aspect ratio
          and dimensions of the map component (i.e a larger viewport may have a closer initial
          zoom as there is more pixel space to fit all sites).
        </p>
      </React.Fragment>
    ),
  },
];

export default function StyleGuide() {
  const classes = useStyles(Theme);
  const slackLink = (
    <Link href="https://neonscience.slack.com/archives/CQ6J40S85" target="_blank">
      #portal-feedback Slack channel
    </Link>
  );

  return (
    <React.Fragment>

      <DocBlock>
        An all-inclusive interactive map for geographically visualizing the NEON observatory at
        any scale.
      </DocBlock>
      <CodeBlock>
        {`
import SiteMap from 'portal-core-components/lib/components/SiteMap';
        `}
      </CodeBlock>

      <Typography variant="h4" component="h2" gutterBottom>Usage</Typography>

      <DocBlock>
        Embedding a SiteMap requires no props to get the default observatory-scale view with
        automatic sizing and aspect ratio based on the current viewport.
      </DocBlock>

      <ExampleBlock>
        <SiteMap />
      </ExampleBlock>
      <CodeBlock>
        {`
<SiteMap />
        `}
      </CodeBlock>

      <DocBlock>
        Various props allow for customizing the initial appearance of the SiteMap.
      </DocBlock>
      <CodeBlock>
        {`
<SiteMap location="CPER" />
<SiteMap apectRatio={1} center={[38.4373, -109.9293]} zoom={14} tileLayer="WORLD_IMAGERY" />
<SiteMap view="table" filterPosition="top" />
        `}
      </CodeBlock>

      <Divider className={classes.divider} />
      <Typography variant="h4" component="h2" gutterBottom>Props</Typography>

      <DocBlock>
        <PropsTable props={propRows} />
      </DocBlock>

    </React.Fragment>
  );
}
