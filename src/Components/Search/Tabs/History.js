import React from 'react';
import { Typography } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';

class History extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <div className='container'>
        <Typography
          className={classes.title}
          variant='h4'
          align='center'
          color='textPrimary'
          gutterBottom
        >
          Your old events (comming soon)
        </Typography>
      </div>
    );
  }
}

export default withStyles(styles)(History);
