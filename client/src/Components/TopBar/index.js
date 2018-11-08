import React from 'react';
import { Link } from 'react-router-dom';
import classNames from 'classnames';

import {
  AppBar, Toolbar, Typography, Button,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import datas from './data';
import styles from './styles';

const TopBar = ({ classes }) => {
  const buttons = datas.map((data, index) => {
    const Icon = data.icon;
    return (
      <Button
        key={index}
        variant='text'
        size='small'
        className={classNames(classes.button, classes.cssRoot)}
        title={data.title}
        component={Link}
        to={data.to}>
        <Icon className={classNames(classes.leftIcon, classes.iconSmall)} />
        {data.text}
      </Button>);
  });
  return (
    <div className={classes.root}>
      <AppBar position='static' color='secondary'>
        <Toolbar>
          <Typography variant='h5' color='inherit' className={classes.flex}>
            Manage competition
          </Typography>
          {buttons}
        </Toolbar>
      </AppBar>
    </div>
  );
};

export default withStyles(styles)(TopBar);
