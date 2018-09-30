import React, { Component } from 'react'
import UserSearch from './UserSearch'
import {compose} from 'react-apollo'
import CssBaseline from '@material-ui/core/CssBaseline'

// Materia UI

import { withStyles } from '@material-ui/core/styles'

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
      <React.Fragment>
        <CssBaseline />
        <UserSearch />
      </React.Fragment>
    )
  }
}

export default compose(
	withStyles(styles)
)(Search)
