import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'

import { MainDrawerItems, SecondaryDrawerItems } from './components/DrawerLinks'
import { TeamTable } from './components/TeamTable'

import { CreateTeamMutation } from '../../graphql/teams/CreateTeamMutation'

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
  appBarSpacer: theme.mixins.toolbar,
  tableContainer: {
    height: 320
  },
  card: {
    display: 'flex',
    width: '100%'
  },
  cardDetails: {
    display: 'flex',
    flex: 1
  },
  cardContent: {
    flex: 1
  },
  cardMedia: {
    flex: 1,
    width: 160,
    height: 160,
    justifyContent: 'flex-start'
  },
  aawebMedia: {
    width: '100%',
    height: 320
  },
  buttonRight: {
    justifyContent: 'flex-end'
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  }
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
      <Typography variant='display1' gutterBottom>
        Teams
      </Typography>
      <div className={classes.tableContainer}>
        <TeamTable />
      </div>
    </main>
  </div>
)

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  createTeamMutation: PropTypes.function
}

const CreateTeamDialogWithMutation = graphql(CreateTeamMutation, {
  name: 'createTeamMutation' // name of the injected prop: this.props.createTeamMutation...
})(Dashboard)

export default withStyles(styles)(CreateTeamDialogWithMutation)
