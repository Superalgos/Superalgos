import React from 'react';
import { Typography } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';

import Event from '../Event';

class Future extends React.Component {
  render() {
    const { classes } = this.props;
    const { FutureEvents } = this.props;

    const futureEvents = FutureEvents.map((event, index) => (
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
        Future events
        </Typography>
        {futureEvents}
      </div>
    );
  }
}

export default withStyles(styles)(Future);
