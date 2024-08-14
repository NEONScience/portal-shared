import React from 'react';
import renderer from 'react-test-renderer';

import MockTheme from '../../../../__mocks__/MockTheme';
import mockReactComponent from '../../../../__mocks__/mockReactComponent';

jest.mock('@mui/material/Snackbar', () => mockReactComponent('@mui/material/Snackbar'));

// eslint-disable-next-line import/first
import LiferayNotifications from '../LiferayNotifications';

describe('NeonPage - LiferayNotifications', () => {
  test('renders nothing if passed an empty array', () => {
    const tree = renderer.create(
      <MockTheme>
        <LiferayNotifications />
      </MockTheme>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
  test('renders notifications with no actions if onHideNotifications not present', () => {
    const notifications = [
      { id: 'foo', message: 'bar', dismissed: false },
      { id: 'qux', message: '<b>HTML</b>', dismissed: true },
    ];
    const tree = renderer.create(
      <MockTheme>
        <LiferayNotifications notifications={notifications} />
      </MockTheme>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
  test('renders notifications with actions if onHideNotifications is present', () => {
    const notifications = [
      { id: 'foo', message: 'bar', dismissed: false },
      { id: 'qux', message: '<b>HTML</b>', dismissed: true },
    ];
    const tree = renderer.create(
      <MockTheme>
        <LiferayNotifications notifications={notifications} onHideNotifications={() => {}} />
      </MockTheme>
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
