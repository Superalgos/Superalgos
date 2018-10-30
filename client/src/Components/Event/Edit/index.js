import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import styles from './styles'

const HOSTS_EVENT = gql`
  query Hosts_Event($designator: ID!){
    hosts_Event(designator: $designator) {
      name
      designator
      startDatetime
      finishDatetime
      host {
        alias
        firstName
        lastName
      }
      description
    }
  }
`

class Edit extends React.Component {
  render () {
    return (
      <React.Fragment>
        <Typography
          variant='display1'
          align='center'
          color='textPrimary'
          gutterBottom
        >
          Enroll in an competition {this.props.match.params.slug}
        </Typography>
        <Query
          query={HOSTS_EVENT}
          variables={{ designator: this.props.match.params.slug }}
        >
          {({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`
            return (
              <p>
                {data.hosts_Event.description}
              </p>
            )
          }}
        </Query>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(Edit)
