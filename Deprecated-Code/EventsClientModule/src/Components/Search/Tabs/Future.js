import React from 'react';
import { Typography } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';

import Event from '../Event';

class Future extends React.Component {
  render() {
    const { classes } = this.props;
    const { Events, AKey } = this.props;

    const events = Events.map((event, index) => (
      <Event key={index} event={event} availableKey={AKey} enrollable={true} />
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
        {events}
      </div>
    );
  }
}

export default withStyles(styles)(Future);
