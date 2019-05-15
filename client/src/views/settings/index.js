import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import { MessageCard } from '@superalgos/web-components'

const styles = theme => ({
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`
  },
  buttonRight: {
    justifyContent: 'flex-end'
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
    width: 100,
    height: 100,
    maxWidth: 100,
    justifyContent: 'flex-start'
  }
})

export const Settings = ({ classes }) => (
  <Grid container spacing={40}>
    <Grid>
      <Typography variant='h4' gutterBottom>
        Settings
      </Typography>
      <div className={classes.tableContainer}>
        <MessageCard message='Coming soon. Management settings.' />
      </div>
    </Grid>
  </Grid>
)

Settings.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Settings)
