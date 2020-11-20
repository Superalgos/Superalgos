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
import styles from '../../styles';

import { getOptionsCalls } from '../../../../../GraphQL/Calls/index';

import { List as RulesList, New as NewRule } from './Rules';
import { List as PrizesList, New as NewPrize } from './Prizes';

import { New as NewPlotter } from './Plotter';
import { New as NewFormula } from './Formula';

class Technical extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isNewFormulaOpen: false,
      isNewPlotterOpen: false,
      isNewRuleOpen: false,
      isNewPrizeOpen: false,
    };
  }

  addRule = (title, description) => {
    this.props.edit('rules', [...this.props.event.rules, {
      title,
      description,
    }]);
    this.closeDialogs();
  }

  addPrize = (prize) => {
    this.props.edit('prizes', [...this.props.event.prizes, prize]);
    this.closeDialogs();
  }

  closeDialogs = () => {
    this.setState({
      isNewFormulaOpen: false,
      isNewPlotterOpen: false,
      isNewRuleOpen: false,
      isNewPrizeOpen: false,
    });
  }

  render() {
    const {
      classes, event, edit, saveChanges,
    } = this.props;
    const {
      isNewPlotterOpen, isNewFormulaOpen, isNewRuleOpen, isNewPrizeOpen,
    } = this.state;
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
                <React.Fragment>
                  <Select
                    value={event.formulaId}
                    input={<Input />}
                    displayEmpty
                    className={classes.selectEmpty}
                    onChange={newVal => edit('formulaId', newVal.target.value)}
                  >
                    {selects}
                  </Select>
                  { isNewFormulaOpen ? <NewFormula closeDialogs={() => this.closeDialogs()} /> : ''}
                </React.Fragment>
              );
            }}
          </Query>
          <FormHelperText className={classes.clickable} onClick={() => { this.setState({ isNewFormulaOpen: true }); }}>
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
                <React.Fragment>
                  <Select
                    value={event.plotterId}
                    input={<Input />}
                    displayEmpty
                    className={classes.selectEmpty}
                    onChange={newVal => edit('plotterId', newVal.target.value)}
                  >
                    {selects}
                  </Select>
                  { isNewPlotterOpen ? <NewPlotter closeDialogs={() => this.closeDialogs()} /> : ''}
                </React.Fragment>
              );
            }}
          </Query>
          <FormHelperText className={classes.clickable} onClick={() => { this.setState({ isNewPlotterOpen: true }); }} >
            To create a new plotter, click here
          </FormHelperText>
        </FormControl>

        <FormControl className={classes.inputField}>
          <Typography variant='h5'>
            Define the rules of your event.
          </Typography>
          <RulesList rules={event.rules} edit={newVal => edit('rules', newVal)} />
          { isNewRuleOpen
            ? <NewRule closeDialogs={() => this.closeDialogs()} addRule={(title, description) => this.addRule(title, description)} />
            : ''}
          <FormHelperText className={classes.clickable} onClick={() => { this.setState({ isNewRuleOpen: true }); }} >
            To add a new rule, click here
          </FormHelperText>
        </FormControl>

        <FormControl className={classes.inputField}>
          <Typography variant='h5'>
            Define the prizes of your event.
          </Typography>
          <PrizesList prizes={event.prizes} edit={newVal => edit('prizes', newVal)} />
          { isNewPrizeOpen
            ? <NewPrize closeDialogs={() => this.closeDialogs()} addPrize={prize => this.addPrize(prize)} />
            : ''}
          <FormHelperText className={classes.clickable} onClick={() => { this.setState({ isNewPrizeOpen: true }); }} >
            To add a new prize, click here
          </FormHelperText>
        </FormControl>

        <Grid container justify='center' >
          <Grid item>
            <Button className={classes.bottomButton} onClick={ () => saveChanges() } variant='contained' color='secondary'>
              Edit the event
            </Button>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Technical);
