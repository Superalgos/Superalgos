import React, { Component } from 'react'
import UserSearch from './UserSearch'
import {compose} from 'react-apollo'
import CssBaseline from '@material-ui/core/CssBaseline'
import Paper from '@material-ui/core/Paper'

// Materia UI

import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    width: '50%',
    flexGrow: 1,
    padding: 10,
    marginLeft: '25%',
    marginTop: '2%'
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
      <React.Fragment>
        <CssBaseline />
        <Paper className={classes.root}>
          <UserSearch />
        </Paper>
      </React.Fragment>
    )
  }
}

export default compose(
	withStyles(styles)
)(Search)
