import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import Button from '@material-ui/core/Button'

// icons
import GroupIcon from '@material-ui/icons/Group'
import UsersIcon from '@material-ui/icons/People'
import SearchIcon from '@material-ui/icons/Search'
import AdbIcon from '@material-ui/icons/Adb'
// import SettingsApplicationsIcon from '@material-ui/icons/SettingsApplications'
import BugReportIcon from '@material-ui/icons/BugReport'

import { Link } from 'react-router-dom'

import log from '../../../utils/log'

// const SettingsLink = props => <Link to='/teams/settings' {...props} />
const FBLink = props => <Link to='/teams/financial-beings' {...props} />
const MembersLink = props => <Link to='/teams/team-members' {...props} />
const ManageLink = props => <Link {...props} />
const ViewLink = props => <Link to='/teams' {...props} />

/*
<Button
  variant='text'
  size='small'
  className={classNames(classes.button, classes.cssRoot)}
  title='Your Global Team Settings'
  component={SettingsLink}
  to={`${match.url}/settings`}>
  <SettingsApplicationsIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
  Settings
</Button>
*/

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1,
    marginLeft: 30
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  cssRoot: {
    color: '#FFFFFF',
    backgroundColor: theme.palette.secondary,
    '&:hover': {
      backgroundColor: theme.palette.dark
    },
    whiteSpace: 'nowrap',
    paddingRight: 2 * theme.spacing.unit,
    paddingLeft: 2 * theme.spacing.unit
  },
  button: {
    margin: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  }
})

class TeamBar extends Component {
  render () {
    const { classes, user, match } = this.props
    log.debug('TeamBar: ', user, match)
    return (
      <div className={classes.root}>
        <AppBar position='static' color='secondary'>
          <Toolbar variant='dense'>
            <Typography variant='h5' color='inherit' className={classes.flex}>
              Teams
            </Typography>
            <Button
              variant='text'
              size='small'
              className={classNames(classes.button, classes.cssRoot)}
              title='View all teams'
              component={ViewLink}
              to={`${match.url}`}>
              <SearchIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              All Teams
            </Button>
            <Button
              variant='text'
              size='small'
              className={classNames(classes.button, classes.cssRoot)}
              title='Manage your teams'
              component={ManageLink}
              to={`${match.url}/manage-teams`}>
              <GroupIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Your Teams
            </Button>
            <Button
              variant='text'
              size='small'
              className={classNames(classes.button, classes.cssRoot)}
              title='Manage team members'
              component={MembersLink}
              to={`${match.url}/team-members`}>
              <UsersIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Team Members
            </Button>
            <Button
              variant='text'
              size='small'
              className={classNames(classes.button, classes.cssRoot)}
              title='Manage Financial Beings'
              component={FBLink}
              to={`${match.url}/financial-beings`}>
              <AdbIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Financial Beings
            </Button>
            <Button
              variant='text'
              size='small'
              className={classNames(classes.button, classes.cssRoot)}
              title='Report a Teams Module bug'
              href='https://github.com/AdvancedAlgos/TeamsModule/issues/new'
              target='_blank'
            >
              <BugReportIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
              Report
            </Button>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

TeamBar.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
  match: PropTypes.object
}

export default withStyles(styles)(TeamBar)
