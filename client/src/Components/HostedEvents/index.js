import React from 'react';
import { Query } from 'react-apollo';

import { hostedEventsCalls } from '../../GraphQL/Calls/index';

import Event from './Event';

const HostedEvent = () => (
  <React.Fragment>
    <Query
      query={hostedEventsCalls.EVENTS_EVENTSBYHOST}
    >
      {({ loading, error, data }) => {
        if (loading) return 'Loading...';
        if (error) return `Error! ${error.message}`;
        const list = data.events_EventsByHost.map((event, index) => (
            <Event key={index} event={event} />
        ));
        return (
          <React.Fragment>
            { list }
          </React.Fragment>
        );
      }}
    </Query>
  </React.Fragment>
);


export default HostedEvent;
