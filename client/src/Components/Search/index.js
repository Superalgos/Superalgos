import React from 'react'
import gql from 'graphql-tag'
import { Query } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import Competition from './Competition'

import styles from './styles'

const HOST_COMPETITIONS = gql`
  query Hosts_Competitions{
    hosts_Competitions {
      displayName
      host
      startDatetime
      finishDatetime
      description
      formula
      participants {
        devTeam
      }
      prizes {
        position
        algoPrize
      }
    }
  }
`

class Search extends React.Component {
  render () {
    return (
      <React.Fragment>
        <Typography
          variant='display1'
          align='center'
          color='textPrimary'
          gutterBottom
        >
          Enroll in an competition
        </Typography>
        <Query
          query={HOST_COMPETITIONS}
        >
          {({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`
            const list = data.hosts_Competitions.map((competition, index) => {
              return (
                <Competition key={index} competition={competition} />
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
