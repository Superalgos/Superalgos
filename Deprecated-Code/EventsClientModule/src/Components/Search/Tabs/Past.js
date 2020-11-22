import React from 'react';
import { Typography } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';

import Event from '../Event';

class Past extends React.Component {
  render() {
    const { classes } = this.props;
    const { PastEvents } = this.props;

    const pastEvents = PastEvents.map((event, index) => (
      <Event key={index} event={event} />
    ));
    return (
      <div className='container'>
        <Typography
          className={classes.title}
          variant='display1'
          align='center'
          color='textPrimary'
          gutterBottom
        >
          A list of passed events
        </Typography>
        {pastEvents}
      </div>
    );
  }
}

export default withStyles(styles)(Past);
