import React from 'react'
import PropTypes from 'prop-types'
import { Route, Switch } from 'react-router-dom'

import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'

import { MainDrawerItems, SecondaryDrawerItems } from './components/DrawerLinks'

import { Overview } from 'Overview'
import { ManageTeams } from 'ManageTeams'
import { TeamMembers } from 'TeamMembers'
import { Settings } from 'Settings'

const drawerWidth = 240

const styles = theme => ({
  root: {
    display: 'flex'
  },
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    whiteSpace: 'nowrap',
    zIndex: 1000
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
    width: `calc(90% - ${drawerWidth}px)`
  },
  appBarSpacer: theme.mixins.toolbar
})

const Dashboard = ({ classes, createTeamMutation, ...props }) => (
  <div className={classes.root}>
    <Drawer
      variant='permanent'
      classes={{
        paper: classes.drawerPaper
      }}
    >
      <div className={classes.appBarSpacer} />
      <List>{MainDrawerItems}</List>
      <Divider />
      <List>{SecondaryDrawerItems}</List>
    </Drawer>
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Switch>
        <Route exact path='/dashboard' component={Overview} />
        <Route exact path='/manage-team' component={ManageTeams} />
        <Route exact path='/team-members' component={TeamMembers} />
        <Route exact path='/settings' component={Settings} />
      </Switch>
    </main>
  </div>
)

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  createTeamMutation: PropTypes.function
}

export default withStyles(styles)(Dashboard)
