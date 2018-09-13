import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'

import { withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import { CreateTeamDialog } from './components/CreateTeam'
import { DashTeam } from './components/DashTeam'
import { DashEditor } from './components/DashEditor'

import { CreateTeamMutation } from '../../graphql/teams/CreateTeamMutation'

const styles = theme => ({
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
  buttonRight: {
    justifyContent: 'flex-end'
  }
})

export const Overview = ({ classes, createTeamMutation }) => (
  <Grid container spacing={24}>
    <Grid container spacing={24}>
      <Grid item>
        <Card className={classes.card}>
          <div className={classes.cardDetails}>
            <CardContent className={classes.createCardContent}>
              <CreateTeamDialog
                classes={classes}
                createTeamMutation={createTeamMutation}
              />
            </CardContent>
          </div>
        </Card>
      </Grid>
    </Grid>
    <DashTeam />
    <DashEditor />
  </Grid>
)

Overview.propTypes = {
  classes: PropTypes.object.isRequired,
  createTeamMutation: PropTypes.object
}

const OverviewWithMutation = graphql(CreateTeamMutation, {
  name: 'createTeamMutation',
  options: props => ({
    // Options are computed from `props` here.
  })
})(Overview)

export default withStyles(styles)(OverviewWithMutation)
