import React from 'react';
import { Typography } from '@material-ui/core';

import { withStyles } from '@material-ui/core/styles';
import styles from '../styles';


class PresentationPage extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <Typography
          className={classes.title}
          variant='h4'
          align='center'
          color='textPrimary'
          gutterBottom
        >
        PresentationPage
        </Typography>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(PresentationPage);
