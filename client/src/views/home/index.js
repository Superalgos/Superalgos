import React from 'react'
import PropTypes from 'prop-types'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import BackgroundImage from '../../assets/advanced-algos/evolution.jpg'

const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  layout: {
    backgroundImage: `url(${BackgroundImage})`,
    width: '100%',
    height: '100%'
  },
  heroContent: {
    textColor: theme.palette.common.white,
    maxWidth: 600,
    height: 800,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  }
})

const Home = ({ classes }) => (
  <React.Fragment>
    <CssBaseline />
    <main className={classes.layout}>
      <div className={classes.heroContent}>
        <Typography
          variant='h3'
          align='center'
          color='textPrimary'
          gutterBottom
        >
          Collaborate. Innovate. Evolve.
        </Typography>
        <Typography
          variant='h6'
          align='center'
          color='textSecondary'
          component='h3'
        >
          Welcome to Advanced Algos
        </Typography>
      </div>
    </main>
  </React.Fragment>
)

Home.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Home)
