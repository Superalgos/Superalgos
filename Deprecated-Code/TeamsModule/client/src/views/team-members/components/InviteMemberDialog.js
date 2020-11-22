import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'
import { isEmpty } from '../../../utils/js-helpers'

import SEND_MEMBER_INVITE from '../../../graphql/teams/SendMemberInvite'

// import { checkGraphQLError } from '../../../utils/graphql-errors'

const styles = theme => ({
  dialogStyle: {
    padding: '3em'
  },
  buttonRight: {
    // position: 'absolute',
    // right: '3em'
    marginTop: '1em',
    marginRight: 'auto',
    marginLeft: 'auto',
    display: 'block',
    lineHeight: '1em'
  }
})

export class InviteMemberDialog extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.validate = this.validate.bind(this)

    this.state = {
      open: false,
      email: '',
      errors: {
        email: ''
      }
    }
  }

  render () {
    const { classes, teamId } = this.props

    if (this.state.open) {
      return (
        <Mutation mutation={SEND_MEMBER_INVITE} >
          {(sendMemberInvite, { loading, error, data }) => {
            console.log('sendMemberInvite: ', data)
            let errors
            let loader = null
            if (loading) {
              loader = (
                <Typography variant='subtitle1'>Submitting invitation...</Typography>
              )
            }
            if (error) {
              errors = error.graphQLErrors.map(({ message }, i) => {
                // const displayMessage = checkGraphQLError(message)
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
                  variant='fab'
                  color='primary'
                  aria-label='Add'
                  className={classes.buttonRight}
                  onClick={this.handleClickOpen}
                >
                  <AddIcon />
                </Button>
                <Dialog
                  open={this.state.open}
                  onClose={this.handleClose}
                  aria-labelledby='form-dialog-title'
                >
                  <DialogTitle id='form-dialog-title'>Invite a New Team Member</DialogTitle>
                  <DialogContent>
                    {(data === undefined || data.sendMemberInviteSG !== 'Success') && (
                      <FormControl
                        required
                        error={this.state.errors.email !== '' || (error !== undefined || error !== null)}
                      >
                        <TextField
                          autoFocus
                          margin='dense'
                          id='email'
                          label='Email Address'
                          type='text'
                          fullWidth
                          value={this.state.email}
                          onChange={e => this.handleChange(e)}
                          error={this.state.errors.email !== ''}
                        />
                        {this.state.errors.email !== '' && (
                          <FormHelperText>{this.state.errors.email}</FormHelperText>
                        )}
                        {error && <FormHelperText>{errors}</FormHelperText>}
                        {loader}
                      </FormControl>
                    )}
                    {data !== undefined && data.sendMemberInviteSG === 'Success' && (
                      <Typography variant='subtitle1'>Invitation successfully sent!</Typography>
                    )}
                  </DialogContent>
                  <DialogActions>
                    {(data === undefined || data.sendMemberInviteSG !== 'Success') && (
                      <React.Fragment>
                        <Button onClick={this.handleClose} color='primary'>
                          Cancel
                        </Button>
                        <Button
                          onClick={e => {
                            this.handleSubmit(e, sendMemberInvite, this.state.email, teamId)
                          }}
                          color='primary'
                        >
                          Send Invitation
                        </Button>
                      </React.Fragment>
                    )}
                    {data !== undefined && data.sendMemberInviteSG === 'Success' && (
                      <Button onClick={this.handleClose} color='primary'>
                        Close
                      </Button>
                    )}
                  </DialogActions>
                </Dialog>
              </div>
            )
          }}
        </Mutation>
      )
    } else {
      return (
        <Button
          variant='fab'
          color='primary'
          aria-label='Add'
          className={classes.buttonRight}
          onClick={this.handleClickOpen}
        >
          <AddIcon />
        </Button>
      )
    }
  }

  handleClickOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false })
  }

  handleChange (e) {
    const errors = this.validate(e.target.value)
    if (isEmpty(errors)) {
      this.setState({ errors: { email: '' } })
      this.setState({ email: e.target.value })
    } else {
      this.setState({ errors: errors })
      this.setState({ email: e.target.value })
    }
  }

  async handleSubmit (e, sendMemberInvite, email, teamId) {
    e.preventDefault()
    console.log('sendMemberInvite submit: ', email, teamId)
    await sendMemberInvite({ variables: { email, teamId } })
    this.setState({ email: '' })
  }

  validate (data) {
    const errors = {}
    if (data === '') errors.email = 'Please enter an email address'
    return errors
  }
}

InviteMemberDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  teamId: PropTypes.string
}

export default withStyles(styles)(InviteMemberDialog)
