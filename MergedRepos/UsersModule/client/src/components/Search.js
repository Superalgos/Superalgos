import React, { Component } from 'react'
import UserSearch from './UserSearch'
import {compose} from 'react-apollo'
import Paper from '@material-ui/core/Paper'
import BannerTopBar from './BannerTopBar'

// Materia UI

import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    width: '100%',
    flexGrow: 1,
    padding: 10,
    marginTop: '5%',
    marginBottom: '10%'
  }
})

class Search extends Component {

  render () {
    const { classes } = this.props
    return (
      <React.Fragment>
        <BannerTopBar
          size='medium'
          title='Users Search'
          text='Find anyone involved in Advanced Algos here.'
          backgroundUrl='https://superalgos.org/img/photos/users.jpg'
        />
        <div className='container'>
          <Paper className={classes.root}>
            <UserSearch />
          </Paper>
        </div>
      </React.Fragment>
    )
  }
}

export default compose(
	withStyles(styles)
)(Search)
