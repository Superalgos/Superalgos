import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Mutation } from 'react-apollo'

import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/Delete'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

import DELETE_TEAM from '../../../graphql/teams/DeleteTeamMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import { checkGraphQLError } from '../../../utils/graphql-errors'
import log from '../../../utils/log'

const styles = theme => ({
  dialogContainer: {
    display: 'block',
    margin: '3em',
    minWidth: 400
  },
  buttonRight: {
    justifyContent: 'flex-end'
  }
})

export class ManageTeamDelete extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.state = {
      open: false
    }
  }

  handleClickOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false })
  }

  handleChange (e) {
    this.setState({ name: e.target.value })
  }

  render () {
    log.debug(this.props, this.props.slug)
    const { classes, authId } = this.props
    return (
      <Mutation
        mutation={DELETE_TEAM}
        refetchQueries={[
          {
            query: GET_TEAMS_BY_OWNER,
            variables: { authId }
          }
        ]}
      >
        {(deleteTeam, { loading, error, data }) => {
          let errors
          let loader
          if (loading) {
            loader = (
              <Typography variant='caption'>Submitting team...</Typography>
            )
          }
          if (error) {
            errors = error.graphQLErrors.map(({ message }, i) => {
              const displayMessage = checkGraphQLError(message)
              log.debug('createTeam error:', displayMessage)
              return (
                <Typography key={i} variant='caption'>
                  {message}
                </Typography>
              )
            })
          }
          return (
            <div>
              <Button
                size='small'
                color='primary'
                className={classes.buttonRight}
                onClick={this.handleClickOpen}
              >
                <DeleteIcon /> Delete
              </Button>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby='form-dialog-title'
              >
                <div classes={classes.dialogContainer}>
                  <DialogTitle id='form-dialog-title'>
                    Delete Team Team
                  </DialogTitle>
                  <DialogContent>
                    <Typography variant='subtitle1' color='primary'>
                      DANGER - Deleting your team cannot be undone
                    </Typography>
                    <Typography variant='subtitle1'>
                      Are you sure you want to delete this team?
                    </Typography>
                    {loader}
                    {errors}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleClose} color='primary'>
                      Cancel
                    </Button>
                    <Button
                      onClick={e => {
                        this.handleSubmit(
                          e,
                          deleteTeam,
                          this.props.slug
                        )
                      }}
                      color='primary'
                    >
                      Delete Team
                    </Button>
                  </DialogActions>
                </div>
              </Dialog>
            </div>
          )
        }}
      </Mutation>
    )
  }

  async handleSubmit (e, deleteTeam, slug) {
    e.preventDefault()
    await deleteTeam({ variables: { slug } })
    this.setState({ open: false })
  }
}

ManageTeamDelete.propTypes = {
  classes: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  authId: PropTypes.string.isRequired
}

export default withStyles(styles)(ManageTeamDelete)
