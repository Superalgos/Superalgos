import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import { Mutation } from 'react-apollo'

import Button from '@material-ui/core/Button'
import AssignmentIndIcon from '@material-ui/icons/AssignmentInd'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'
import TextField from '@material-ui/core/TextField'
import MenuItem from '@material-ui/core/MenuItem'

import SET_TEAM_MEMBER_ROLE from '../../../graphql/teams/SetTeamMemberRoleMutation'
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

const roles = [
  { role: 'Admin' },
  { role: 'Member' }
]

export class ManageMemberRole extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.state = {
      open: false,
      role: ''
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
    log.debug(this.props, this.props.teamId)
    const { classes, teamId, authId } = this.props
    return (
      <Mutation
        mutation={SET_TEAM_MEMBER_ROLE}
        refetchQueries={[{ query: GET_TEAMS_BY_OWNER }]}
      >
        {(setTeamMemberRole, { loading, error, data }) => {
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
            <React.Fragment>
              <Button
                size='small'
                color='primary'
                className={classes.buttonRight}
                onClick={this.handleClickOpen}
              >
                <AssignmentIndIcon /> Set Role
              </Button>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby='form-dialog-title'
              >
                <div classes={classes.dialogContainer}>
                  <DialogTitle id='form-dialog-title'>
                    Set Team Member Role
                  </DialogTitle>
                  <DialogContent>
                    <Typography variant='subtitle1'>
                      Admin members can approve new team members, send team invitations, and remove team members.
                    </Typography>
                    <TextField
                      select
                      label='Team Role'
                      value={this.state.role}
                      onChange={(e) => this.setState({ role: e.target.value })}
                      fullWidth
                    >
                      {roles.map(role => (
                        <MenuItem key={role.role} value={role.role}>{role.role}</MenuItem>
                      ))}
                    </TextField>
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
                          setTeamMemberRole,
                          teamId,
                          authId
                        )
                      }}
                      color='primary'
                    >
                      Set Member Role
                    </Button>
                  </DialogActions>
                </div>
              </Dialog>
            </React.Fragment>
          )
        }}
      </Mutation>
    )
  }

  async handleSubmit (e, setTeamMemberRole, teamId, authId) {
    e.preventDefault()
    const role = this.state.role
    await setTeamMemberRole({ variables: { teamId, memberId: authId, role: role } })
    this.setState({ open: false })
  }
}

ManageMemberRole.propTypes = {
  classes: PropTypes.object.isRequired,
  teamId: PropTypes.string.isRequired,
  authId: PropTypes.string.isRequired
}

export default withStyles(styles)(ManageMemberRole)
