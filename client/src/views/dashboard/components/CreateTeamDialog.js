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
<<<<<<< HEAD
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

import { getItem } from '../../../utils/local-storage'
=======
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'
>>>>>>> feature/client-refactor-react
import { isEmpty } from '../../../utils/js-helpers'

import CREATE_TEAM from '../../../graphql/teams/CreateTeamMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

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
      errors: {
        name: ''
      }
    }
  }

  render () {
    const { classes, authId } = this.props
    return (
      <Mutation
        mutation={CREATE_TEAM}
        refetchQueries={[
          {
            query: GET_TEAMS_BY_OWNER,
            variables: { authId }
          }
        ]}
      >
        {(createTeam, { loading, error, data }) => {
          let errors
          let loader = null
          if (loading) {
<<<<<<< HEAD
            loader = <Typography variant='subheading'>Submitting team...</Typography>
=======
            loader = (
              <Typography variant='subheading'>Submitting team...</Typography>
            )
>>>>>>> feature/client-refactor-react
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
<<<<<<< HEAD
              <Button variant='fab' color='primary' aria-label='Add' className={classes.buttonRight} onClick={this.handleClickOpen}>
=======
              <Button
                variant='fab'
                color='primary'
                aria-label='Add'
                className={classes.buttonRight}
                onClick={this.handleClickOpen}
              >
>>>>>>> feature/client-refactor-react
                <AddIcon />
              </Button>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby='form-dialog-title'
              >
                <DialogTitle id='form-dialog-title'>Create a Team</DialogTitle>
                <DialogContent>
<<<<<<< HEAD
                  <DialogContentText>Team Name:</DialogContentText>
                  <FormControl required error={e => (this.state.errors.name !== '' || error)}>
=======
                  <FormControl
                    required
                    error={this.state.errors.name !== '' || error}
                  >
>>>>>>> feature/client-refactor-react
                    <TextField
                      autoFocus
                      margin='dense'
                      id='teamname'
                      label='Team Name'
                      type='text'
                      fullWidth
                      value={this.state.name}
                      onChange={this.handleChange}
                      error={this.state.errors.name !== '' || error}
                    />
<<<<<<< HEAD
                    {this.state.errors.name !== '' && (<FormHelperText>{this.state.errors.name}</FormHelperText>)}
                    {error && (<FormHelperText>{errors}</FormHelperText>)}
=======
                    {this.state.errors.name !== '' && (
                      <FormHelperText>{this.state.errors.name}</FormHelperText>
                    )}
                    {error && <FormHelperText>{errors}</FormHelperText>}
>>>>>>> feature/client-refactor-react
                    {loader}
                  </FormControl>
                </DialogContent>
                <DialogActions>
                  <Button onClick={this.handleClose} color='primary'>
                    Cancel
                  </Button>
<<<<<<< HEAD
                  <Button onClick={e => {
                    this.handleSubmit(e, createTeam, this.state.name)
                  }} color='primary'>
=======
                  <Button
                    onClick={e => {
                      this.handleSubmit(e, createTeam, this.state.name, authId)
                    }}
                    color='primary'
                  >
>>>>>>> feature/client-refactor-react
                    Create Team
                  </Button>
                </DialogActions>
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
    const errors = this.validate(e.target.value)
    if (isEmpty(errors)) {
      this.setState({ errors: { name: '' } })
      this.setState({ name: e.target.value })
    } else {
      this.setState({ errors: errors })
      this.setState({ name: e.target.value })
    }
  }

<<<<<<< HEAD
  async handleSubmit (e, createTeam, name) {
    e.preventDefault()
    const currentUser = await getItem('user')
    let authId = JSON.parse(currentUser)
    authId = authId.authId
    console.log('createTeam submit: ', authId, name)
    const slug = this.slugify(name)
    await createTeam({ variables: { name, slug, owner: authId } })
    this.setState({ name: '' })
=======
  async handleSubmit (e, createTeam, name, authId) {
    e.preventDefault()
    console.log('createTeam submit: ', authId, name)
    const slug = this.slugify(name)
    await createTeam({ variables: { name, slug, owner: authId } })
    this.setState({ name: '', open: false })
>>>>>>> feature/client-refactor-react
  }

  validate (data) {
    const errors = {}
    if (data === '') errors.name = 'Please enter a team name'
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
