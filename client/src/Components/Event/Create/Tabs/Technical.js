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
    const { classes, event, edit } = this.props;
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
            value={event.formulaId}
            input={<Input />}
            displayEmpty
            className={classes.selectEmpty}
            onChange={newVal => edit('formulaId', newVal.target.value)}
          >
            <MenuItem key='1' value='1'>moi</MenuItem>
            <MenuItem key='2' value='2'>toi</MenuItem>
            <MenuItem key='3' value='3'>nous</MenuItem>
          </Select>
          <FormHelperText className={classes.clickable} onClick={() => console.log('Comming soon in a modaal')}>
            To create a new formula, click here
          </FormHelperText>
        </FormControl>
        <FormControl className={classes.inputField}>
          <InputLabel shrink htmlFor='select'>
            Select the Plotter
          </InputLabel>
          <Select
            value={event.plotterId}
            input={<Input />}
            displayEmpty
            className={classes.selectEmpty}
            onChange={newVal => edit('plotterId', newVal.target.value)}
          >
            <MenuItem key='1' value='1'>moi</MenuItem>
            <MenuItem key='2' value='2'>toi</MenuItem>
            <MenuItem key='3' value='3'>nous</MenuItem>
          </Select>
          <FormHelperText> To create a new plotter, click here </FormHelperText>
        </FormControl>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Technical);
