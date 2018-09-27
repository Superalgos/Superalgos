import React, { Component } from 'react'
import UserSearch from './UserSearch'
import {compose} from 'react-apollo'

// Materia UI

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 60,
    margin: 2
  }
})

class Search extends Component {

  constructor (props) {
    super(props)
    this.state = {
    }
  }
  render () {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <UserSearch />
      </Paper>
    )
  }
}

export default compose(
  withStyles(styles)
)(Search)
