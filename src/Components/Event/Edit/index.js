import React from 'react';
import { Query } from 'react-apollo';

import { withStyles } from '@material-ui/core/styles';
import styles from './styles';
import Queried from './queried';

import BannerTopBar from '../../BannerTopBar';

import { showEventCalls } from '../../../GraphQL/Calls/index';

class Edit extends React.Component {
  render() {
    return (
      <React.Fragment>
        <BannerTopBar backgroundUrl='https://superalgos.org/img/photos/events.jpg' />

        <Query
          query={showEventCalls.EVENTS_EVENT}
          variables={{ eventId: this.props.match.params.slug }}
        >
          {({ loading, error, data }) => {
            if (loading) return 'Loading...';
            if (error) return `Error! ${error.message}`;
            return (<Queried event={data.events_Event} />);
          }}
        </Query>
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(Edit);
