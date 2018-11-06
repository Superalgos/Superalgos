import React from 'react';
import {
  Typography,
  FormControl,
  InputLabel,
  Input,
  Select,
  FormHelperText,
  MenuItem,
} from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';


class Technical extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
          Select the formula and the plotter you want to use, you can also create your own with the corresponding button.
        </Typography>
        <FormControl className={classes.inputField}>
          <InputLabel shrink htmlFor='select'>
            Select the formula
          </InputLabel>
          <Select
            id='select'
            value='1'
            input={<Input name='Role' id='role-label-placeholder' />}
            displayEmpty
            name='select'
            className={classes.selectEmpty}
          >
            <MenuItem key='1' value='1'>moi</MenuItem>
            <MenuItem key='2' value='2'>toi</MenuItem>
            <MenuItem key='3' value='3'>nous</MenuItem>
          </Select>
          <FormHelperText> For new formula, select {'"'}create new{'"'} </FormHelperText>
        </FormControl>
        <FormControl className={classes.inputField}>
          <InputLabel shrink htmlFor='select'>
            Select the Plotter
          </InputLabel>
          <Select
            id='select'
            value='1'
            input={<Input name='Role' id='role-label-placeholder' />}
            displayEmpty
            name='select'
            className={classes.selectEmpty}
          >
            <MenuItem key='1' value='1'>moi</MenuItem>
            <MenuItem key='2' value='2'>toi</MenuItem>
            <MenuItem key='3' value='3'>nous</MenuItem>
          </Select>
          <FormHelperText> For new plotter, select {'"'}create new{'"'} </FormHelperText>
        </FormControl>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Technical);
