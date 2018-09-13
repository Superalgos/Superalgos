import React from 'react'
import { Query } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import { DashTeamIteam } from './DashTeamIteam'

export const DashTeam = () => (
  <Query>
    <Grid item md={6}>
      <Typography variant='display1' gutterBottom>
        Teams
      </Typography>
      <Grid container spacing={24}>
        <DashTeamIteam />
      </Grid>
    </Grid>
  </Query>
)

export default DashTeam
