import React from 'react'
import { Query } from 'react-apollo'

import { Typography } from '@material-ui/core'

import { withStyles } from '@material-ui/core/styles'
import styles from './styles'

import { listEventsCalls } from '../../GraphQL/Calls/index'

import Event from './Event'

class Search extends React.Component {
  render () {
    const classes = this.props.classes
    return (
      <React.Fragment>
        <Typography
          className={classes.title}
          variant='display1'
          align='center'
          color='textPrimary'
          gutterBottom
        >
          Enroll in an competition
        </Typography>
        <Query
          query={listEventsCalls.HOSTS_EVENTS}
        >
          {({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`
            const list = data.hosts_Events.map((event, index) => {
              return (
                <Event key={index} event={event} />
              )
            })
            return (
              <React.Fragment>
                { list }
              </React.Fragment>
            )
          }}
        </Query>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(Search)
