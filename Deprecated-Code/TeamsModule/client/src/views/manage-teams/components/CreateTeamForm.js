import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import FormHelperText from '@material-ui/core/FormHelperText'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import { isEmpty } from '../../../utils/js-helpers'

import CREATE_TEAM from '../../../graphql/teams/CreateTeamMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import log from '../../../utils/log'

const styles = theme => ({
  formContainer: {
    width: '100%',
    margin: '3em 0 1em'
  },
  typography: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 40
  },
  dialogStyle: {
    padding: '3em'
  },
  textField: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 25
  },
  submitButton: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3
  }
})

export class CreateTeamForm extends Component {
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
    const { classes } = this.props
    return (
      <Mutation
        mutation={CREATE_TEAM}
        refetchQueries={[{
          query: GET_TEAMS_BY_OWNER
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
            <FormControl
              required
              error={this.state.nameError !== '' || this.state.botNameError !== '' || error !== null}
              className={classes.formContainer}
            >
              <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
              Give a nice and memorable name to your team.
              </Typography>

              <TextField
                autoFocus
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
              <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
              Give a name for to the bot you are forking.
              </Typography>
              <TextField
                autoFocus
                id='botName'
                label='Team Bot Name'
                type='text'
                fullWidth
                className={classes.textField}
                value={this.state.botName}
                onChange={this.handleChange}
                error={this.state.botNameError !== ''}
              />

              <Grid container justify='center' >
                <Grid item>
                  {this.state.botNameError !== '' && (
                    <FormHelperText>{this.state.botNameError}</FormHelperText>
                  )}
                  {error && <FormHelperText>{errors}</FormHelperText>}
                  {loader}
                </Grid>
                <Grid item>

                  <Button
                    onClick={e => {
                      this.handleSubmit(e, createTeam, this.state.name, this.state.botName)
                    }}
                    variant='contained'
                    color='secondary'
                    className={classes.submitButton}
                >
                  Create Team
                </Button>

                </Grid>
              </Grid>
            </FormControl>
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
    window.canvasApp.eventHandler.raiseEvent('User Profile Changed')
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

CreateTeamForm.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(CreateTeamForm)
