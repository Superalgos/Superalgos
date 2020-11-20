import React from 'react';
import { Typography } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';

import Event from '../Event';

class Ongoing extends React.Component {
  render() {
    const { Events, classes } = this.props;

    const events = Events.map((event, index) => (
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
          Ongoing events:
        </Typography>
        {events}
      </div>
    );
  }
}

export default withStyles(styles)(Ongoing);
