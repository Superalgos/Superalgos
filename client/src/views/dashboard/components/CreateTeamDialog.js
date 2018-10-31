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

import CREATE_TEAM from '../../../graphql/teams/CreateTeamMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import log from '../../../utils/log'

const styles = theme => ({
  dialogContainer: {
    display: 'block',
    margin: '3em',
    minWidth: 400
  },
  dialogStyle: {
    padding: '3em'
  },
  textField: {
    width: '60%',
    marginLeft: '20%',
    marginBottom: 10
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

export class CreateTeamDialog extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.validate = this.validate.bind(this)
    this.slugify = this.slugify.bind(this)

    this.state = {
      open: false,
      name: '',
      botName: '',
      nameError: '',
      botNameError: ''
    }
  }

  render () {
    const { classes, authId } = this.props
    return (
      <Mutation
        mutation={CREATE_TEAM}
        refetchQueries={[{
          query: GET_TEAMS_BY_OWNER,
          variables: { authId: authId }
        }]}
      >
        {(createTeam, { loading, error, data }) => {
          let errors
          let loader = null
          if (loading) {
            loader = (
              <Typography variant='subtitle1'>Submitting team...</Typography>
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
                <div classes={classes.dialogContainer}>
                  <DialogTitle id='form-dialog-title'>Create a Team</DialogTitle>
                  <DialogContent>
                    <FormControl
                      required
                      error={this.state.nameError !== '' || this.state.botNameError !== '' || error !== null}
                    >
                      <Typography variant='subtitle1' align='center'>Create a name for your team</Typography>
                      <TextField
                        autoFocus
                        margin='dense'
                        id='name'
                        label='Team Name'
                        type='text'
                        fullWidth
                        className={classes.textField}
                        value={this.state.name}
                        onChange={this.handleChange}
                        error={this.state.nameError !== ''}
                      />
                      {this.state.nameError !== '' && (
                        <FormHelperText>{this.state.nameError}</FormHelperText>
                      )}
                      <Typography variant='subtitle1' align='center' ><br />
                        Create a name for your teams bot.
                      </Typography>
                      <Typography align='center' >
                        <em>(Temporary: In the future, creating multiple Financial Beings <br />
                          will occur in a separate module)</em>
                      </Typography>
                      <TextField
                        autoFocus
                        margin='dense'
                        id='botName'
                        label='Team Bot Name'
                        type='text'
                        fullWidth
                        className={classes.textField}
                        value={this.state.botName}
                        onChange={this.handleChange}
                        error={this.state.botNameError !== ''}
                      />
                      {this.state.botNameError !== '' && (
                        <FormHelperText>{this.state.botNameError}</FormHelperText>
                      )}
                      {error && <FormHelperText>{errors}</FormHelperText>}
                      {loader}
                    </FormControl>
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleClose} color='primary'>
                      Cancel
                    </Button>
                    <Button
                      onClick={e => {
                        this.handleSubmit(e, createTeam, this.state.name, this.state.botName)
                      }}
                      color='primary'
                    >
                      Create Team
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

  handleClickOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false })
  }

  handleChange (e) {
    let id = e.target.id
    let value = e.target.value
    let error = this.validate({ id, value })
    switch (id) {
      case 'name':
        if (!isEmpty(error)) this.setState({ nameError: error })
        this.setState({ name: value })
        break
      case 'botName':
        if (!isEmpty(error)) this.setState({ botNameError: error })
        this.setState({ botName: value })
        break
      default:
    }
  }

  async handleSubmit (e, createTeam, name, botName) {
    e.preventDefault()
    log.debug('createTeam submit: ', name, botName)
    const slug = this.slugify(name)
    const botSlug = this.slugify(botName)
    await createTeam({ variables: { name, slug, botName, botSlug } })
    this.setState({ name: '', open: false })
  }

  validate (data) {
    const errors = {}
    switch (data.id) {
      case 'name':
        if (data.value === '') {
          this.setState({ nameError: 'Please enter a team name' })
        } else {
          this.setState({ nameError: '' })
        }
        break
      case 'botName':
        if (data.value === '') {
          this.setState({ botNameError: 'Please enter a bot name' })
        } else {
          this.setState({ botNameError: '' })
        }
        break
      default:
    }
    return errors
  }

  slugify (string) {
    const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
    const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return string
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w-]+/g, '') // Remove all non-word characters
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  }
}

CreateTeamDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  authId: PropTypes.string
}

export default withStyles(styles)(CreateTeamDialog)
