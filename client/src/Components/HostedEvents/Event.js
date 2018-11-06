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
    const { classes } = this.props;
    const {
      name,
      designator,
      startDatetime,
      finishDatetime,
      host,
      description,
    } = this.props.event;
    return (
      <Paper className={classes.card}>
        <Grid container spacing={16}>
          <Grid item xs>
            <Typography gutterBottom variant='headline'> {name} </Typography>
            <Typography gutterBottom>From : {toLocalTime(startDatetime)} </Typography>
            <Typography gutterBottom>To : {toLocalTime(finishDatetime)} </Typography>
          </Grid>
          <Grid item xs>
            <Typography gutterBottom>
              Hosted by: {host.alias} ({host.lastName} {host.firstName})
            </Typography>
            <Typography gutterBottom>Formula: </Typography>
            <Typography gutterBottom>First prize: </Typography>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction='column' spacing={16}>
              <Grid item xs>
                <Typography gutterBottom variant='headline'> Description : </Typography>
                <Typography gutterBottom> {description} </Typography>
              </Grid>
              <Grid item className={classes.buttonGrid}>
                <Button
                  className={classes.buttonList}
                  variant='outlined'
                  color='primary'
                  size='small'
                  component={Link}
                  to={`/edit/${designator}`}
                >
                  Edit
                </Button>
                <Button
                  className={classes.buttonList}
                  variant='outlined'
                  color='primary'
                  size='small'
                  component={Link}
                  to={`/show/${designator}`}
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
