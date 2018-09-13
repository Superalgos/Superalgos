import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getUserProfileQuery} from '../queries/queries'

// Materia UI

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 60,
    margin: 2
  },
  card: {
    maxWidth: 345,
    paddingTop: '30'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop: '30'
  },
  horizontal:
  {
    display: 'inline',
    margin: theme.spacing.unit
  },
  appBar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  },
  grid: {
    paddingTop: '30',
    marginTop: '30'
  }
})

class UserProfile extends Component {

  displayUserProfile () {
    const {user} = this.props.data

    if (user) {
      return (
        <div>
          <h2>{ user.alias }</h2>
          <p>{ user.firstName }</p>
          <p>{ user.lastName }</p>
          <p>{ user.role.name }</p>
        </div>
      )
    } else {
      return (<div>No User selected...</div>)
    }
  }

  render () {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <Grid container justify='center' spacing={24}>
          {this.displayUserProfile()}
        </Grid>
      </Paper>
    )
  }
}

export default compose(
  graphql(getUserProfileQuery, { // What follows is the way to pass a parameter to a query.
    options: (props) => {
      return {
        variables: {
          name: 'getUserProfileQuery',
          id: props.userId
        }
      }
    }}),
  withStyles(styles)
)(UserProfile) // This technique binds more than one query to a single component.
