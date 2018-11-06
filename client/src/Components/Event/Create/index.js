import React from 'react';
import { Mutation } from 'react-apollo';
import { DateTime } from 'luxon';

import {
  TextField,
  FormControl,
  InputLabel,
  Input,
  Button,
  MenuItem,
  FormGroup,
  Select,
  FormHelperText,
  Paper,
  Grid,
  Typography,
} from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { DateTimePicker } from 'material-ui-pickers';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import { hostedEventsCalls } from '../../../GraphQL/Calls';

class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      startDatetime: DateTime.local().plus({ days: 1 }).startOf('day'),
      finishDatetime: DateTime.local().plus({ days: 8 }).startOf('day'),
    };
  }

  render() {
    const {
      name, description, startDatetime, finishDatetime,
    } = this.state;
    const { classes } = this.props;
    return (
      <Mutation mutation={hostedEventsCalls.EVENTS_CREATEEVENT}
        update={(store, { data }) => {
          this.props.history.push(`/edit/${data.events_CreateEvent.id}`);
        }
        }
      >
        {hostEvent => (

          <Paper className={classes.root}>
            <Typography className={classes.typography} variant='headline' gutterBottom>
              Create a new event
            </Typography>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                hostEvent({
                  variables: {
                    event: {
                      name,
                      description,
                      startDatetime: startDatetime.valueOf() / 1000,
                      finishDatetime: startDatetime.valueOf() / 1000,
                    },
                  },
                });
              }}
            >
              <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
                These are the basic information you need to input in order to create an event.
                There might be some heavy changes in the near future as the application is still at a very early stage.
              </Typography>

              <TextField
                label='Public id'
                value='Your public ID will be generated automatically'
                className={classes.inputField}
                disabled
              />

              <TextField
                label='Name'
                value={name}
                className={classes.inputField}
              />
              <TextField
                multiline
                label='Description'
                value={description}
                className={classes.inputField}
              />

              <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
                The dates are purely indicative, as it is important for you to make sure everything is
                ready before manually triggering the beginning and end of the event.
                If you are confident use the scheduler to start it for you(incoming).
              </Typography>

              <FormGroup row className={classes.inputField}>
                <Grid container justify='space-around' >
                  <Grid item>
                    <DateTimePicker
                      autoOk
                      disablePast
                      format="DD' at 'HH:mm"
                      ampm={false}
                      showTabs={false}
                      leftArrowIcon={<ChevronLeft />}
                      rightArrowIcon={<ChevronRight />}
                      value={startDatetime}
                      helperText='Competition start date'
                    />
                  </Grid>
                  <Grid item>
                    <DateTimePicker
                      autoOk
                      disablePast
                      format="DD' at 'HH:mm"
                      ampm={false}
                      showTabs={false}
                      leftArrowIcon={<ChevronLeft />}
                      rightArrowIcon={<ChevronRight />}
                      value={finishDatetime}
                      helperText='Competition finishing date'
                    />
                  </Grid>
                </Grid>
              </FormGroup>

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
              <Grid container justify='center' >
                <Grid item>
                  <Button type='submit' variant='contained' color='secondary'>Create New Project</Button>
                </Grid>
              </Grid>
            </form>
          </Paper>
        )}
      </Mutation>
    );
  }
}

export default withStyles(styles)(Create);
