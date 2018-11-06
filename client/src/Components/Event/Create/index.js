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
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';
import {
  ChevronLeft,
  ChevronRight,
  Face as BasicIcon,
  Alarm as TechnicalIcon,
  Group as TeamAndServerIcon,
  PresentToAll as PresentationIcon,
} from '@material-ui/icons';
import { DateTimePicker } from 'material-ui-pickers';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import {
  Basic,
  PresentationPage,
  TeamsServer,
  Technical,
} from './Tabs';

import { hostedEventsCalls } from '../../../GraphQL/Calls';

function TabContainer(props) {
  return (
    <Typography component='div' style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
      name: '',
      description: '',
      startDatetime: DateTime.local().plus({ days: 1 }).startOf('day'),
      finishDatetime: DateTime.local().plus({ days: 8 }).startOf('day'),
    };
  }

  handleChange = (event, value) => {
    this.setState({ value });
  }

  render() {
    const {
      name, description, startDatetime, finishDatetime, value,
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
          <div className={classes.root}>
            <AppBar position='static' color='default'>
              <Tabs
              value={value}
              onChange={this.handleChange}
              scrollable
              scrollButtons='off'
              indicatorColor='primary'
              textColor='primary'
            >
                <Tab
                className={classes.tabTitle}
                label='Basic information'
                icon={<BasicIcon />}
              />
                <Tab
                className={classes.tabTitle}
                label='Technical information'
                icon={<TechnicalIcon />}
              />
                <Tab
                className={classes.tabTitle}
                label='Teams &amp; server setup(disabled)'
                icon={<TeamAndServerIcon />}
                disabled
              />
                <Tab
                className={classes.tabTitle}
                label='Presentation page(disabled)'
                icon={<PresentationIcon />}
                disabled
              />
              </Tabs>
            </AppBar>
            <Paper className={classes.paperRoot}>
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
                {value === 0 && <TabContainer>
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
                      <Button className={classes.bottomButton} type='submit' variant='contained' color='secondary'>
                        Create New Project
                      </Button>
                    </Grid>
                  </Grid>
                </TabContainer>
              }
                {value === 1 && <TabContainer><Technical /></TabContainer>}
                {value === 2 && <TabContainer><TeamsServer /></TabContainer>}
                {value === 3 && <TabContainer><PresentationPage /></TabContainer>}
              </form>
            </Paper>
          </div>
        )}
      </Mutation>
    );
  }
}

export default withStyles(styles)(Create);
