import React from 'react';
import { Typography } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';

import Event from '../Event';

class Incoming extends React.Component {
  render() {
    const { classes } = this.props;
    const { IncomingEvents, OngoingEvents } = this.props;

    const incomingEvents = IncomingEvents.map((event, index) => (
      <Event key={index} event={event} />
    ));
    const ongoingEvents = OngoingEvents.map((event, index) => (
      <Event key={index} event={event} />
    ));
    return (
      <div className='container'>
        <Typography
          className={classes.title}
          variant='h4'
          align='center'
          color='textPrimary'
          gutterBottom
        >
          Ongoing and incoming competitions
        </Typography>
        <Typography
          variant='h5'
          color='textPrimary'
          gutterBottom
        >
          Ongoing events:
        </Typography>
        {ongoingEvents}
        <Typography
          variant='h5'
          color='textPrimary'
          gutterBottom
        >
          Incoming events:
        </Typography>
        {incomingEvents}
      </div>
    );
  }
}

export default withStyles(styles)(Incoming);
