import React from 'react';
import renderer from 'react-test-renderer';

import { mockAjaxResponse } from '../../../../__mocks__/ajax';
import mockReactComponent from '../../../../__mocks__/mockReactComponent';
import MockTheme from '../../../../__mocks__/MockTheme';
import '../../../../__mocks__/NeonContext';

import AopDataViewer from '../AopDataViewer';
import { sliderClasses } from '@mui/material';

jest.mock('@mui/material/Select', () => mockReactComponent('@mui/material/Select'));
jest.mock('@mui/material/Slider', () => ({
  ...jest.requireActual('@mui/material/Slider'),
  __esModule: true,
  default: mockReactComponent('@mui/material/Slider'),
  sliderClasses: jest.fn(),
}))

mockAjaxResponse({
  response: {
    data: {
      productCode: 'DP3.30010.001',
      siteCodes: [
        {
          siteCode: 'BONA',
          availableMonths: ['2018-08', '2017-08'],
          availableDataUrls: [
            'server=https://roma.chpc.utah.edu:7070/mod_visus?&dataset=DP3.30010.001-D19-2018_BONA_2-L3-Camera-Mosaic-V01',
            'server=https://roma.chpc.utah.edu:7070/mod_visus?&dataset=DP3.30010.001-D19-2017_BONA_1-L3-Camera-Mosaic-V01',
          ],
        },
        {
          siteCode: 'HEAL',
          availableMonths: ['2018-08', '2017-07'],
          availableDataUrls: [
            'server=https://roma.chpc.utah.edu:7070/mod_visus?&dataset=DP3.30010.001-D19-2018_HEAL_2-L3-Camera-Mosaic-V01',
            'server=https://roma.chpc.utah.edu:7070/mod_visus?&dataset=DP3.30010.001-D19-2017_HEAL_1-L3-Camera-Mosaic-V01',
          ],
        },
        {
          siteCode: 'SJER',
          availableMonths: ['2019-03', '2018-03', '2017-03', '2017-03'],
          availableDataUrls: [
            'server=https://roma.chpc.utah.edu:7070/mod_visus?&dataset=DP3.30010.001-D17-2019_SJER_4-L3-Camera-Mosaic',
            'server=https://roma.chpc.utah.edu:7070/mod_visus?&dataset=DP3.30010.001-D17-2018_SJER_3-L3-Camera-Mosaic-V01',
            'server=https://roma.chpc.utah.edu:7070/mod_visus?&dataset=DP3.30010.001-D17-2017_SJER_2-L3-Camera-Mosaic-V01',
            'server=https://roma.chpc.utah.edu:7070/mod_visus?&dataset=DP3.30010.001-D17-2017_SJER_2-L3-Camera-Mosaic-V02',
          ],
        },
      ],
    },
  },
});

describe('AopDataViewer', () => {
  test('renders with only a productCode', (done) => {
    setTimeout(() => {
      const tree = renderer
        .create(<MockTheme><AopDataViewer productCode="DP3.30010.001" /></MockTheme>)
        .toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });
  });
  test('renders with title disabled', (done) => {
    setTimeout(() => {
      const tree = renderer
        .create(<MockTheme><AopDataViewer productCode="DP3.30010.001" showTitle={false} /></MockTheme>)
        .toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });
  });
  test('renders with a specified initial site', (done) => {
    setTimeout(() => {
      const tree = renderer
        .create(<MockTheme><AopDataViewer productCode="DP3.30010.001" initialSite="BONA" /></MockTheme>)
        .toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });
  });
  test('renders with a specified initial site and year', (done) => {
    setTimeout(() => {
      const tree = renderer
        .create((
          <MockTheme>
            <AopDataViewer
              productCode="DP3.30010.001"
              initialSite="HEAL"
              initialYear={2017}
            />
          </MockTheme>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });
  });
  test('renders with a specified initial site, year, and flight', (done) => {
    setTimeout(() => {
      const tree = renderer
        .create((
          <MockTheme>
            <AopDataViewer
              productCode="DP3.30010.001"
              initialSite="SJER"
              initialYear={2017}
              initialFlight={2}
            />
          </MockTheme>
        ))
        .toJSON();
      expect(tree).toMatchSnapshot();
      done();
    });
  });
});
