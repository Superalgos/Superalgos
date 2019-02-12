import React from 'react';
import { Link } from 'react-router-dom';

import {
  Grid, Paper,
  Typography,
  Button,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import { toLocalTime } from '../../utils';

class Event extends React.Component {
  render() {
    const { classes, event } = this.props;
    const {
      id,
      title,
      subtitle,
      startDatetime,
      endDatetime,
      host,
      formula,
      description,
    } = event;
    return (
      <Paper className={classes.card}>
        <Grid container spacing={16}>
          <Grid item xs>
            <Typography gutterBottom variant='h5'> {title} </Typography>
            <Typography gutterBottom variant='h6'> {subtitle} </Typography>
            <Typography gutterBottom>From : {toLocalTime(startDatetime)} </Typography>
            <Typography gutterBottom>To : {toLocalTime(endDatetime)} </Typography>
          </Grid>
          <Grid item xs>
            <Typography gutterBottom variant='h6'> Description : </Typography>
            <Typography gutterBottom> {description} </Typography>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction='column' spacing={16}>
              <Grid item xs>
                <Typography gutterBottom>
                  Hosted by: {host.alias} ({host.lastName} {host.firstName})
                </Typography>
                <Typography gutterBottom>Formula: {formula.name} </Typography>
              </Grid>
              <Grid item className={classes.buttonGrid}>
                <Button
                  className={classes.buttonList}
                  variant='outlined'
                  color='primary'
                  size='small'
                  component={Link}
                  to={`/events/show/${id}`}
                >
                  Show
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    );
  }
}

export default withStyles(styles)(Event);
