import React from 'react'
import PropTypes from 'prop-types'

import CssBaseline from '@material-ui/core/CssBaseline'
import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(900 + theme.spacing.unit * 3 * 2)]: {
      width: 900,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  heroContent: {
    maxWidth: 600,
    margin: '0 auto',
    padding: `${theme.spacing.unit * 8}px 0 ${theme.spacing.unit * 6}px`
  }
})

const About = ({ classes }) => (
  <React.Fragment>
    <CssBaseline />
    <main className={classes.layout}>
      <div className={classes.heroContent}>
        <Typography
<<<<<<< HEAD
          variant='display3'
=======
          variant='display1'
>>>>>>> feature/client-refactor-react
          align='center'
          color='textPrimary'
          gutterBottom
        >
<<<<<<< HEAD
          Collaborate. Innovate. Evolve.
=======
          Welcome to Advanced Algos Teams!
>>>>>>> feature/client-refactor-react
        </Typography>
        <Typography
          variant='title'
          align='center'
          color='textSecondary'
          component='h3'
        >
<<<<<<< HEAD
          Welcome to the Advanced Algos Teams Module
=======
          This module is responsible for managing teams and their members across the Advanced Algos system. You can browser teams and their details, and with an account, create and manage your own teams.
        </Typography>
        <Typography
          align='center'
          color='textSecondary'
          component='p'
        >
          <strong>Development Status</strong><br />This module is is currently under heavy development. Implementation started 1st of September 2018 and this is the result of the 1st sprint of 2 weeks of work.
        </Typography>
        <Typography
          align='center'
          color='textSecondary'
          component='p'
        >
          <strong>What can you do?</strong><br />Basic team creation and management.
        </Typography>
        <Typography
          align='center'
          color='textSecondary'
          component='p'
        >
          <strong>What is next?</strong><br />
          <ol>
            <li> Managing team profile images.</li>
            <li> Managing team members - inviting members and administrating roles</li>
            <li> More detailed team profiles + allowing members to apply to recruiting teams</li>
          </ol>
>>>>>>> feature/client-refactor-react
        </Typography>
      </div>
    </main>
  </React.Fragment>
)

About.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(About)
