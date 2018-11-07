import React from 'react';
import { Query } from 'react-apollo';

import {
  Typography,
  FormControl,
  InputLabel,
  Input,
  Select,
  FormHelperText,
  MenuItem,
  Grid,
  Button,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';

import { getOptionsCalls } from '../../../../GraphQL/Calls/index';


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
          <Query query={getOptionsCalls.EVENTS_FORMULAS} >
            {({ loading, error, data }) => {
              if (loading) {
                return (
                  <Select
                    value='loading'
                    input={<Input />}
                    displayEmpty
                    className={classes.selectEmpty}
                    disabled
                  >
                    <MenuItem key='1' value='loading'>Loading possibilities...</MenuItem>
                  </Select>
                );
              }
              if (error) return `Error! ${error.message}`;
              const selects = data.events_Formulas.map((formula, index) => (
                <MenuItem key={index} value={formula.id}>{formula.name}</MenuItem>
              ));
              return (
                <Select
                  value={event.formulaId}
                  input={<Input />}
                  displayEmpty
                  className={classes.selectEmpty}
                  onChange={newVal => edit('formulaId', newVal.target.value)}
                >
                  {selects}
                </Select>
              );
            }}
          </Query>
          <FormHelperText className={classes.clickable} onClick={() => console.log('Comming soon in a modaal')}>
            To create a new formula, click here
          </FormHelperText>
        </FormControl>
        <FormControl className={classes.inputField}>
          <InputLabel shrink htmlFor='select'>
            Select the Plotter
          </InputLabel>
          <Query query={getOptionsCalls.EVENTS_PLOTTERS} >
            {({ loading, error, data }) => {
              if (loading) {
                return (
                  <Select
                    value='loading'
                    input={<Input />}
                    displayEmpty
                    className={classes.selectEmpty}
                    disabled
                  >
                    <MenuItem key='1' value='loading'>Loading possibilities...</MenuItem>
                  </Select>
                );
              }
              if (error) return `Error! ${error.message}`;
              const selects = data.events_Plotters.map((plotter, index) => (
                <MenuItem key={index} value={plotter.id}>{plotter.name}</MenuItem>
              ));
              return (
                <Select
                  value={event.plotterId}
                  input={<Input />}
                  displayEmpty
                  className={classes.selectEmpty}
                  onChange={newVal => edit('plotterId', newVal.target.value)}
                >
                  {selects}
                </Select>
              );
            }}
          </Query>
          <FormHelperText> To create a new plotter, click here </FormHelperText>
        </FormControl>
        <Grid container justify='center' >
          <Grid item>
            <Button className={classes.bottomButton} type='submit' variant='contained' color='secondary'>
              Create the event
            </Button>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Technical);
