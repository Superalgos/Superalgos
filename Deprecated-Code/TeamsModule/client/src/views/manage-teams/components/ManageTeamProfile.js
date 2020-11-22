import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import { withStyles } from '@material-ui/core/styles'

import { Link } from 'react-router-dom'

import ManageTeamProfileView from './ManageTeamProfileView'
import ManageTeamProfileEdit from './ManageTeamProfileEdit'

import log from '../../../utils/log'

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
    marginBottom: theme.spacing.unit * 1,
    padding: 0,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 2,
      padding: `0 0 ${theme.spacing.unit * 2}px`
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
  profileButtons: {
    width: '90%',
    margin: `${theme.spacing.unit * 3}px auto 0`,
    padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 2}px 0`,
    borderTop: '1px solid #CCCCCC'
  }
})

export class ManageTeamProfile extends Component {
  constructor (props) {
    super(props)

    this.toggleEdit = this.toggleEdit.bind(this)
    this.handleSave = this.handleSave.bind(this)
    this.handleUpdate = this.handleUpdate.bind(this)

    this.state = {
      edit: false,
      save: false
    }
  }

  render () {
    const { classes, team, slug, match } = this.props
    log.debug('ManageTeamProfile render', this.state)
    return (
      <div className='container'>
        <main className={classes.layout}>
          <Paper className={classes.paper}>
            <div className={classes.heroContent}>
              {!this.state.edit && <ManageTeamProfileView team={team} />}
              {this.state.edit &&
                <ManageTeamProfileEdit
                  team={team}
                  slug={slug}
                  match={match}
                  save={this.state.save}
                  handleUpdate={this.handleUpdate}
                />
              }
              <Grid container justify='flex-end' direction='row' spacing={24} className={classes.profileButtons}>
                {!this.state.edit &&
                  <React.Fragment>
                    <Grid item>
                      <Button
                        component={Link}
                        to='/teams/manage-teams'
                        color='primary'
                        variant='contained'
                      >
                        Back to all teams
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        onClick={e => this.toggleEdit()}
                        color='secondary'
                        variant='contained'
                      >
                        Edit Profile
                      </Button>
                    </Grid>
                  </React.Fragment>
                }
                {this.state.edit &&
                  <React.Fragment>
                    <Grid item>
                      <Button
                        onClick={e => this.toggleEdit()}
                        variant='contained'
                        color='primary'
                      >
                        Cancel
                      </Button>
                    </Grid>
                    <Grid item>
                      <Button
                        onClick={e => this.handleSave(e)}
                        variant='contained'
                        color='secondary'
                      >
                        Save Changes
                      </Button>
                    </Grid>
                  </React.Fragment>
                }
              </Grid>
            </div>
          </Paper>
        </main>
      </div>
    )
  }

  toggleEdit () {
    this.setState({ edit: !this.state.edit })
  }

  handleSave (e) {
    e.preventDefault()
    log.debug('handleSave')
    this.setState({ save: true })
  }

  handleUpdate () {
    log.debug('handleUpdate')
    this.setState({ edit: false, save: false })
  }
}

ManageTeamProfile.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired
}

export default withStyles(styles)(ManageTeamProfile)
