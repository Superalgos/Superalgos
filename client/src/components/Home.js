import React, { Component } from 'react'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import {LineChart} from 'react-easy-chart'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 100
  },
  grid: {
    margin: theme.spacing.unit,
    width: '50%'
  },
  typography: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  }
})

class Home extends Component {

  render () {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <Grid container justify='center' spacing={24}>
          <Grid className={classes.grid} item>
            <Typography className={classes.typography} gutterBottom variant='headline' component='h2'>
              Welcome to the Users Module
            </Typography>
            <Typography className={classes.typography} component='p'>
              This module is responsible for managing users across the Advanced Algos system. Here you can browse the Users Directory, search for users and get to their profiles. You can create your own User profile if you sign up, or manage it if you already have one by logging in.
            </Typography>
            <Typography className={classes.typography} component='p' >
            Below, you can see some usage statistics of this module, in this case, the total amount of users over time.
            </Typography>
            <LineChart
              xType={'time'}
              axes
              interpolate={'cardinal'}
              width={750}
              height={250}
              data={[
                [
              { x: '1-Sep-17', y: 2 },
              { x: '2-Sep-17', y: 4 },
              { x: '3-Sep-17', y: 5 },
              { x: '4-Sep-17', y: 6 },
              { x: '5-Sep-17', y: 7 }
                ]
              ]}
        />
          </Grid>
        </Grid>

      </Paper>

    )
  }
}

export default compose(
  withStyles(styles)
)(Home)
