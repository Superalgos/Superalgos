import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

import { getItem } from '../../../utils/local-storage'

import UPDATE_TEAM_PROFILE from '../../../graphql/teams/UpdateTeamProfileMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import { checkGraphQLError } from '../../../utils/graphql-errors'

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

export class ManageTeamEdit extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    console.log('ManageTeamEdit', props.team)
    const motto = props.team.profile.motto || ''
    const description = props.team.profile.description || ''
    this.state = {
      open: false,
      motto: motto,
      description: description
    }
  }

  render () {
    console.log(this.props, this.props.slug)
    const { classes, team, authId } = this.props
    return (
      <Mutation
        mutation={UPDATE_TEAM_PROFILE}
        refetchQueries={[
          {
            query: GET_TEAMS_BY_OWNER,
            variables: { authId }
          }
        ]}
      >
        {(updateTeamProfile, { loading, error, data }) => {
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
              console.log('updateTeamProfile error:', displayMessage)
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
                <EditIcon /> Edit
              </Button>
              <Dialog
                open={this.state.open}
                onClose={this.handleClose}
                aria-labelledby='form-dialog-title'
              >
                <div classes={classes.dialogContainer}>
                  <DialogTitle id='form-dialog-title'>
                    Edit Team Details
                  </DialogTitle>
                  <DialogContent>
                    <TextField
                      autoFocus
                      margin='dense'
                      id='name'
                      label='Team Name'
                      type='text'
                      fullWidth
                      disabled
                      value={team.name}
                    />
                    <TextField
                      autoFocus
                      margin='dense'
                      id='motto'
                      label='Team Motto'
                      type='text'
                      fullWidth
                      value={this.state.motto}
                      onChange={this.handleChange}
                    />
                    <DialogContentText>Team description:</DialogContentText>
                    <TextField
                      margin='dense'
                      id='description'
                      label='Team Description'
                      type='text'
                      rows={4}
                      multiline
                      fullWidth
                      value={this.state.description}
                      onChange={this.handleChange}
                    />
                    {loader}
                    {errors}
                  </DialogContent>
                  <DialogActions>
                    <Button onClick={this.handleClose} color='primary'>
                      Cancel
                    </Button>
                    <Button
                      onClick={e => {
                        this.handleSubmit(e, updateTeamProfile, this.props.slug)
                      }}
                      color='primary'
                    >
                      Update Team
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
    switch (e.target.id) {
      case 'motto':
        this.setState({ motto: e.target.value })
        break
      case 'description':
        this.setState({ description: e.target.value })
        break
      default:
    }
  }

  async handleSubmit (e, updateTeamProfile, slug) {
    e.preventDefault()
    const currentUser = await getItem('user')
    let authId = JSON.parse(currentUser)
    authId = authId.authId
    await updateTeamProfile({
      variables: {
        slug,
        owner: authId,
        description: this.state.description,
        motto: this.state.motto
      }
    })
    this.setState({ description: '', motto: '', open: false })
  }
}

ManageTeamEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  authId: PropTypes.string,
  team: PropTypes.object
}

export default withStyles(styles)(ManageTeamEdit)
