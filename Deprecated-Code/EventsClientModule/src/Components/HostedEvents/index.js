import React from 'react';
import { Query } from 'react-apollo';
import { Typography } from '@material-ui/core';
import { DateTime } from 'luxon';

import BannerTopBar from '../BannerTopBar';

import { hostedEventsCalls } from '../../GraphQL/Calls/index';

import Event from './Event';


const HostedEvent = () => (
  <React.Fragment>
    <BannerTopBar
      size='medium'
      title='Your hosted events'
      text='You are one of the pillars of this community, thank you'
      backgroundUrl='https://superalgos.org/img/photos/events.jpg'
    />

    <Query
      query={hostedEventsCalls.EVENTS_EVENTSBYHOST}
      variables={{ hostId: 'self', state: 'UNPUBLISHED' }}
    >
      {({ loading, error, data }) => {
        if (loading) return 'Loading...';
        if (error) return `Error! ${error.message}`;
        const list = data.events_Events.map((event, index) => (
          <Event showOnly={false} key={index} event={event} />
        ));
        return (
          <div className='container'>
            <Typography variant='h3'> Unpublished : </Typography>
            { list }
          </div>
        );
      }}
    </Query>

    <Query
      query={hostedEventsCalls.EVENTS_EVENTSBYHOST}
      variables={{ hostId: 'self', minEndDate: Math.floor(DateTime.local().valueOf() / 1000) }}
    >
      {({ loading, error, data }) => {
        if (loading) return 'Loading...';
        if (error) return `Error! ${error.message}`;
        const list = data.events_Events.map((event, index) => (
          <Event showOnly={true} key={index} event={event} />
        ));
        return (
          <div className='container'>
            <Typography variant='h3'> Published : </Typography>
            { list }
          </div>
        );
      }}
    </Query>

    <Query
      query={hostedEventsCalls.EVENTS_EVENTSBYHOST}
      variables={{ hostId: 'self', maxEndDate: Math.floor(DateTime.local().valueOf() / 1000) }}
    >
      {({ loading, error, data }) => {
        if (loading) return 'Loading...';
        if (error) return `Error! ${error.message}`;
        const list = data.events_Events.map((event, index) => (
          <Event showOnly={true} key={index} event={event} />
        ));
        return (
          <div className='container'>
            <Typography variant='h3'> Old : </Typography>
            { list }
          </div>
        );
      }}
    </Query>
  </React.Fragment>
);


export default HostedEvent;
