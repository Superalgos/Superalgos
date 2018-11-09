import React from 'react';

import { Typography } from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';

import styles from './styles';

class TopBar extends React.Component {
  render() {
    const {
      classes,
      size,
      title,
      text,
    } = this.props;
    if (size === 'big') {
      return (
        <div className={classes.rootBig}>
          <div className={classes.captions}>
            <Typography className={classes.title} variant='headline' align='center'>{title}</Typography>
            <Typography className={classes.text} variant='subheading' align='center'>{text}</Typography>
          </div>
        </div>
      );
    }
    if (size === 'medium') {
      return (
        <div className={classes.rootMedium}>
          <div className={classes.captions}>
            <Typography className={classes.title} variant='headline' align='center'>{title}</Typography>
            <Typography className={classes.text} variant='subheading' align='center'>{text}</Typography>
          </div>
        </div>
      );
    }
    return (
      <div className={classes.rootSmall} />
    );
  }
}

export default withStyles(styles)(TopBar);
