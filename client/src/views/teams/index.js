import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'

import { BannerTopBar } from '../common'
import TeamsList from './components/TeamsList'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  layout: {
    width: 'auto',
    marginTop: theme.spacing.unit * 3,
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 6,
    [theme.breakpoints.up(1200 + theme.spacing.unit * 3 * 2)]: {
      width: 1200,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  }
})

const Teams = ({ classes, match }) => (
  <React.Fragment>
    <BannerTopBar size={match.params.slug !== undefined ? 'small' : 'medium'} title='Teams Directory' text='All teams in the Superalgos project are here.' backgroundUrl='https://superalgos.org/img/photos/teams.jpg' />
    <div className='container'>
      <TeamsList match={match} />
    </div>
  </React.Fragment>
)

Teams.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object
}

export default withStyles(styles)(Teams)
