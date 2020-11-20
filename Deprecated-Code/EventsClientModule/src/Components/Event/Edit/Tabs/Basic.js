import React from 'react';
import {
  TextField,
  Button,
  FormGroup,
  Typography,
  Grid,
} from '@material-ui/core';
import {
  ChevronLeft,
  ChevronRight,
} from '@material-ui/icons';
import { DateTimePicker } from 'material-ui-pickers';


import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';


class Basic extends React.Component {
  render() {
    const {
      classes, event, edit, saveChanges,
    } = this.props;
    return (
      <React.Fragment>
        <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
          These are the basic information you need to input in order to edit an event.
          There might be some heavy changes in the near future as the application is still at a very early stage.
        </Typography>

        <TextField
          label='Public id'
          value={`${event.id}(your public ID is generated automatically and unmutable)`}
          className={classes.inputField}
          disabled
        />

        <TextField
          label='Title'
          value={event.title}
          className={classes.inputField}
          onChange={newVal => edit('title', newVal.target.value)}
        />
        <TextField
          label='Subtitle'
          value={event.subtitle}
          className={classes.inputField}
          onChange={newVal => edit('subtitle', newVal.target.value)}
        />
        <TextField
            multiline
            label='Description'
            value={event.description}
            className={classes.inputField}
            onChange={newVal => edit('description', newVal.target.value)}
          />

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
                value={event.startDatetime}
                helperText='Competition start date'
                onChange={newVal => edit('startDatetime', newVal)}
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
                value={event.endDatetime}
                helperText='Competition ending date'
                onChange={newVal => edit('endDatetime', newVal)}
              />
            </Grid>
          </Grid>
        </FormGroup>
        <Grid container justify='center' >
          <Grid item>
            <Button
              className={classes.bottomButton}
              variant='contained'
              color='secondary'
              onClick={() => edit('value', 1)}
            >
              Go to technical tab
            </Button>
            <Button className={classes.bottomButton} onClick={() => saveChanges()} variant='contained' color='secondary'>
              Or Edit event
            </Button>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Basic);
