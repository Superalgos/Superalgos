import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'

import { Link } from 'react-router-dom'

import CreateTeamForm from './CreateTeamForm'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  layout: {
    width: 'auto',
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 6,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: 0,
    marginBottom: theme.spacing.unit * 3,
    padding: 0,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 6,
      padding: `0 0 ${theme.spacing.unit * 6}px`
    }
  },
  heroContent: {
    maxWidth: 800,
    margin: '0 auto',
    padding: 0
  },
  teamContent: {
    margin: `${theme.spacing.unit * 1}px ${theme.spacing.unit * 3}px 0 0`
  },
  banner: {
    maxWidth: '100%',
    height: 'auto'
  },
  avatar: {
    maxWidth: 100,
    height: 100,
    margin: `${theme.spacing.unit * 1}px 0 0 ${theme.spacing.unit * 3}px `
  },
  backLink: {
    display: 'block',
    textDecoration: 'none',
    margin: `${theme.spacing.unit * 3}px 0 0`,
    color: theme.palette.secondary.main
  }
})

export class ManageTeamProfile extends Component {
  constructor (props) {
    super(props)

    this.toggleEdit = this.toggleEdit.bind(this)
    this.handleSave = this.handleSave.bind(this)

    this.state = {
      edit: false,
      save: false
    }
  }

  render () {
    const { classes, team, slug, match } = this.props

    return (
      <div className='container'>
        <Paper>
          <Grid container spacing={0} direction='column' justify='stretch' alignItems='center'>
            <Grid item xs={10}>
              <Typography variant='h5' align='center'>
                You don&rsquo;t have any teams. Create one!
              </Typography>
              <Typography variant='body1' align='center' gutterBottom>
                To begin developing on the Superalgos platform, as well as participate in Algobot competitions,
                you'll need to create a team. A default trading algobot will be cloned and added to your team so
                that you can begin experimenting right away.
              </Typography>
              <CreateTeamForm />
            </Grid>
          </Grid>
        </Paper>
      </div>
    )
  }

  toggleEdit () {
    this.setState({ edit: !this.state.edit })
  }

  handleSave () {
    this.setState({ save: !this.state.edit })
  }
}

ManageTeamProfile.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired
}

export default withStyles(styles)(ManageTeamProfile)
