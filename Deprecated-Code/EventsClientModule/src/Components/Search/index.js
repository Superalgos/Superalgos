import React from 'react';
import { Query } from 'react-apollo';
import { DateTime } from 'luxon';

import {
  Typography,
  AppBar,
  Tabs,
  Tab,
} from '@material-ui/core';
import {
  GetApp as OngoingIcon,
  AlarmAdd as FutureIcon,
  History as HistoryIcon,
} from '@material-ui/icons';

import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import BannerTopBar from '../BannerTopBar';

import { hostedEventsCalls } from '../../GraphQL/Calls/index';

import {
  Future,
  History,
  Ongoing,
  Past,
} from './Tabs';

function TabContainer(props) {
  return (
    <Typography component='div' style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  );
}

class Search extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: 0,
    };
  }

  handleChange = (event, value) => {
    this.setState({ value });
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    const time = { now: Math.floor(DateTime.local().valueOf() / 1000) };
    return (
      <React.Fragment>
        <BannerTopBar
          size='medium'
          title='Events'
          text='All the events are going to be listed here'
          backgroundUrl='https://superalgos.org/img/photos/events.jpg'
        />
        <div className={classes.root}>
          <AppBar position='static' color='default'>
            <Tabs
              value={value}
              onChange={this.handleChange}
              scrollable
              scrollButtons='off'
              indicatorColor='primary'
              textColor='primary'
            >
              <Tab
                className={classes.tabTitle}
                label='Ongoing'
                icon={<OngoingIcon />}
              />
              <Tab
                className={classes.tabTitle}
                label='Future'
                icon={<FutureIcon />}
              />
              <Tab
                className={classes.tabTitle}
                label='Your history'
                icon={<HistoryIcon />}
              />
              <Tab
                className={classes.tabTitle}
                label='Past'
                icon={<HistoryIcon />}
              />
            </Tabs>
          </AppBar>
          <Query
            query={hostedEventsCalls.EVENTS_EVENTSBYHOST}
            variables={{ maxStartDate: time.now, minEndDate: time.now }}
          >
            {({ loading, error, data }) => {
              if (loading) return 'Loading...';
              if (error) return `Error! ${error.message}`;
              return (
                <React.Fragment>
                  {value === 0 && <TabContainer><Ongoing Events={data.events_Events} /></TabContainer>}
                </React.Fragment>
              );
            }}
          </Query>
          <Query
            query={hostedEventsCalls.EVENTS_EVENT_AND_AKEY}
            variables={{ minStartDate: time.now }}
          >
            {({ loading, error, data }) => {
              if (loading) return 'Loading...';
              if (error) return `Error! ${error.message}`;
              return (
                <React.Fragment>
                  {value === 1 && <TabContainer><Future Events={data.events_Events} AKey={data.keyVault_AvailableKeys} /></TabContainer>}
                </React.Fragment>
              );
            }}
          </Query>
          <Query
            query={hostedEventsCalls.EVENTS_EVENTSBYHOST}
            variables={{ maxEndDate: time.now }}
          >
            {({ loading, error, data }) => {
              if (loading) return 'Loading...';
              if (error) return `Error! ${error.message}`;
              return (
                <React.Fragment>
                  {value === 2 && <TabContainer><History Events={data.events_Events} /></TabContainer>}
                </React.Fragment>
              );
            }}
          </Query>
          <Query
            query={hostedEventsCalls.EVENTS_EVENTSBYHOST}
            variables={{ maxEndDate: time.now }}
          >
            {({ loading, error, data }) => {
              if (loading) return 'Loading...';
              if (error) return `Error! ${error.message}`;
              return (
                <React.Fragment>
                  {value === 3 && <TabContainer><Past PastEvents={data.events_Events} /></TabContainer>}
                </React.Fragment>
              );
            }}
          </Query>
        </div>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Search);
