/* eslint-disable react/require-default-props */
import React from 'react';

import {
  makeStyles,
  createStyles,
} from '@material-ui/core/styles';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTag } from '@fortawesome/free-solid-svg-icons';

import InfoMessageCard, { InfoMessageCardProps } from './InfoMessageCard';
import Theme from '../Theme/Theme';
import { StylesHook } from '../../types/muiTypes';
import { NeonTheme } from '../Theme/types';

const useStyles: StylesHook = makeStyles((theme: NeonTheme) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createStyles({
    cardSecondaryIcon: {
      color: 'rgba(138, 191, 236, 0.9)', // theme.colors.LIGHT_BLUE[200] with 'a' value applied
      marginLeft: theme.spacing(2),
      fontSize: '1.875rem !important',
    },
    customIcon: {
      color: 'rgba(0, 0, 0, 0.9)',
      padding: '5px',
      fontSize: '1.5em',
      marginRight: theme.spacing(2),
    },
  })) as StylesHook;

const InfoCard: React.FC<InfoMessageCardProps> = (props: InfoMessageCardProps): JSX.Element => {
  const classes = useStyles(Theme);
  return (
    <InfoMessageCard
      {...props}
      title="Data Product Release"
      classes={{
        secondaryIcon: classes.secondaryIcon,
      }}
      icon={(
        <FontAwesomeIcon
          icon={faTag}
          size="1x"
          className={classes.customIcon}
        />
      )}
    />
  );
};

export default InfoCard;
