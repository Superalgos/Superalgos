import React from 'react';
import { Query } from 'react-apollo';

import {
  Paper,
  Typography,
} from '@material-ui/core';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import { toLocalTime } from '../../../utils';

import BannerTopBar from '../../BannerTopBar';

import { showEventCalls } from '../../../GraphQL/Calls/index';

class Show extends React.Component {
  render() {
    const { classes } = this.props;
    return (
      <React.Fragment>
        <BannerTopBar backgroundUrl='https://superalgos.org/img/photos/events.jpg' />
        <div className='container'>
          <Paper className={classes.paperRoot}>
            <Typography className={classes.typography} variant='h4' gutterBottom>
              Event Details :
            </Typography>

            <Query
              query={showEventCalls.EVENTS_EVENT}
              variables={{ eventId: this.props.match.params.slug }}
            >
              {({ loading, error, data }) => {
                if (loading) return 'Loading...';
                if (error) return `Error! ${error.message}`;
                return (
                  <React.Fragment>
                    <Typography className={classes.typography} variant='h5' gutterBottom>
                      Title :
                    </Typography>
                    <Typography className={classes.typography} variant='h6' gutterBottom>
                      {data.events_Event.title}
                    </Typography>
                    <Typography className={classes.typography} variant='h5' gutterBottom>
                      Subtitle :
                    </Typography>
                    <Typography className={classes.typography} variant='h6' gutterBottom>
                      {data.events_Event.subtitle}
                    </Typography>
                    <Typography className={classes.typography} variant='h5' gutterBottom>
                      Dates :
                    </Typography>
                    <Typography className={classes.typography} variant='h6' gutterBottom>
                      From {toLocalTime(data.events_Event.startDatetime)} to {toLocalTime(data.events_Event.endDatetime)}
                    </Typography>
                    <Typography className={classes.typography} variant='h5' gutterBottom>
                      Formula :
                    </Typography>
                    <Typography className={classes.typography} variant='h6' gutterBottom>
                      {data.events_Event.formula.name}
                    </Typography>
                    <Typography className={classes.typography} variant='h5' gutterBottom>
                      Plotter :
                    </Typography>
                    <Typography className={classes.typography} variant='h6' gutterBottom>
                      {data.events_Event.plotter.name}
                    </Typography>
                  </React.Fragment>
                );
              }}
            </Query>
          </Paper>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Show);
