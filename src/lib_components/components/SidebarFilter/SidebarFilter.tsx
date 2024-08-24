/* eslint-disable react/jsx-no-useless-fragment */
/* eslint-disable react/require-default-props */
import React, { useId } from 'react';

import IconButton from '@mui/material/IconButton';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import {
  makeStyles,
  createStyles,
} from '@mui/styles';
import { Theme as MuiTheme } from '@mui/material';

import Skeleton from '@mui/material/Skeleton';

import InfoIcon from '@mui/icons-material/InfoOutlined';

import Theme from '../Theme/Theme';
import { StylesHook } from '../../types/muiTypes';
import { isStringNonEmpty } from '../../util/typeUtil';

const useStyles: StylesHook = makeStyles((muiTheme: MuiTheme) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  createStyles({
    title: {
      fontWeight: 500,
    },
    titleContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      marginBottom: muiTheme.spacing(1),
    },
    selectInput: {
      width: '100%',
      marginBottom: muiTheme.spacing(0.5),
      backgroundColor: '#fff',
    },
    descriptionContainer: {
      marginTop: muiTheme.spacing(0.5),
    },
    descriptionFlexInnerContainer: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    description: {
      display: 'block',
      color: muiTheme.palette.grey[400],
      overflowWrap: 'break-word',
    },
    descriptionLabel: {
      fontWeight: 700,
      color: muiTheme.palette.grey[400],
      marginRight: muiTheme.spacing(1),
    },
    menuItemSubtitle: {
      color: muiTheme.palette.grey[400],
    },
    horizontalFlex: {
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
    },
    horizontalDescriptions: {
      marginLeft: Theme.spacing(3),
      '& > div:first-child': {
        marginTop: '-2px !important',
      },
    },
  })) as StylesHook;

export interface SidebarFilterOption {
  title: string;
  value: string;
}

export interface SidebarFilterProps {
  title: string;
  selected: string;
  values: SidebarFilterOption[];
  onChange: (value: string) => void;
  skeleton?: boolean;
  maxWidth?: number;
  horizontal?: boolean;
  tooltipText?: string;
  helperText?: string;
}

const SidebarFilter: React.FC<SidebarFilterProps> = (props: SidebarFilterProps): React.JSX.Element => {
  const classes = useStyles(Theme);
  const {
    title,
    skeleton,
    selected,
    values,
    maxWidth,
    horizontal,
    onChange,
    tooltipText,
    helperText,
    ...otherProps
  }: SidebarFilterProps = props;

  const instanceId = useId();
  const selectSeleniumId = `sidebar-filter-select-selenium-${instanceId}`;
  const inputId = `sidebar-filter-input-${instanceId}`;
  const labelId = `sidebar-filter-label-${instanceId}`;

  // SANITY CHECK: Render nothing if there are no releases and null release is excluded
  const optionCount = values.length + (values ? 0 : 1);
  if (!optionCount) { return (<></>); }

  const handleChange = (nextValue: string): void => onChange(nextValue);

  const maxWidthStyle = maxWidth ? { maxWidth: `${maxWidth}px` } : {};

  const input: React.JSX.Element = (
    <OutlinedInput
      id={inputId}
      name={inputId}
      size="small"
      className={classes.selectInput}
      style={maxWidthStyle}
    />
  );

  /* eslint-disable react/jsx-one-expression-per-line */
  const tooltip: React.ReactChild = !isStringNonEmpty(tooltipText)
    ? (<></>)
    : (
      <div>
        {tooltipText}
      </div>
    );
  /* eslint-enable react/jsx-one-expression-per-line */
  const titleNode = !title ? null : (
    <div className={classes.titleContainer}>
      <Typography variant="h5" component="h3" className={classes.title} id={labelId}>
        {title}
      </Typography>
      <Tooltip placement="right" title={tooltip}>
        <IconButton size="small" style={{ marginLeft: Theme.spacing(0.5) }}>
          <InfoIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </div>
  );

  // Render skeleton
  if (skeleton) {
    const skeletonStyle = { marginBottom: Theme.spacing(1) };
    return (
      <div {...otherProps} style={{ maxWidth: `${maxWidth}px`, overflow: 'hidden' }}>
        {titleNode}
        <Skeleton variant="rectangular" width={maxWidth} height={36} style={skeletonStyle} />
        <Skeleton width="70%" height={16} style={skeletonStyle} />
      </div>
    );
  }

  const selectNode = (
    <Select
      data-selenium={selectSeleniumId}
      value={selected}
      onChange={(event) => handleChange(event.target.value as string)}
      input={input}
      aria-labelledby={labelId}
      disabled={optionCount < 2}
    >
      {values.map((option: SidebarFilterOption): React.JSX.Element => ((
        <MenuItem key={option.value} value={option.value}>
          <div>
            <Typography display="block">
              {option.title}
            </Typography>
          </div>
        </MenuItem>
      )))}
    </Select>
  );

  const renderHelperText = (): React.JSX.Element => {
    if (!isStringNonEmpty(helperText)) {
      return (<></>);
    }
    return (
      <div className={classes.descriptionContainer}>
        <Typography variant="caption" className={classes.description}>
          {helperText}
        </Typography>
      </div>
    );
  };

  // Final Render
  return horizontal ? (
    <div {...otherProps}>
      <div>
        {titleNode}
      </div>
      <div className={classes.horizontalFlex}>
        <div style={maxWidth ? { width: `${maxWidth}px` } : {}}>
          {selectNode}
        </div>
        <div className={classes.horizontalDescriptions}>
          {renderHelperText()}
        </div>
      </div>
    </div>
  ) : (
    <div {...otherProps} style={{ width: '100%', ...maxWidthStyle }}>
      {titleNode}
      {selectNode}
      {renderHelperText()}
    </div>
  );
};

export default SidebarFilter;
