import React from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

import CreateTeam from './CreateTeam'

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
  }
})

const CreateTeamWrapper = ({ classes, authId }) => (
  <Grid container spacing={24}>
    <Grid item>
      <Card className={classes.card}>
        <div className={classes.cardDetails}>
          <CardContent className={classes.createCardContent}>
            <CreateTeam classes={classes} authId={authId} />
          </CardContent>
        </div>
      </Card>
    </Grid>
  </Grid>
)

CreateTeamWrapper.propTypes = {
  classes: PropTypes.object.isRequired,
  authId: PropTypes.string
}

export default withStyles(styles)(CreateTeamWrapper)
