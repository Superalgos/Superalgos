import React, { Component } from 'react'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import {LineChart} from 'react-easy-chart'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 100
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: 120,
    maxHeight: 24
  },
  button: {
    margin: theme.spacing.unit
  }
})

class Home extends Component {

  render () {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <Grid className={classes.button} container justify='center' spacing={24}>
          <Grid item>
            <LineChart
              xType={'time'}
              axes
              interpolate={'cardinal'}
              width={750}
              height={250}
              data={[
                [
              { x: '1-Jan-15', y: 20 },
              { x: '1-Feb-15', y: 10 },
              { x: '1-Mar-15', y: 33 },
              { x: '1-Apr-15', y: 45 },
              { x: '1-May-15', y: 15 }
                ], [
              { x: '1-Jan-15', y: 10 },
              { x: '1-Feb-15', y: 15 },
              { x: '1-Mar-15', y: 13 },
              { x: '1-Apr-15', y: 15 },
              { x: '1-May-15', y: 10 }
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
