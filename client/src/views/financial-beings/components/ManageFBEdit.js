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

import { ImageUpload } from '@superalgos/web-components'

import UPDATE_FB from '../../../graphql/teams/UpdateFBMutation'
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

export class ManageFBEdit extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleAvatar = this.handleAvatar.bind(this)

    const avatar = props.fb.avatar || ''

    this.state = {
      open: false,
      avatar: avatar
    }
  }

  render () {
    log.debug('ManageFBEdit ', this.props, this.props.slug, this.props.fb)
    const { classes, fb, slug } = this.props
    return (
      <Mutation
        mutation={UPDATE_FB}
        refetchQueries={[
          {
            query: GET_TEAMS_BY_OWNER
          }
        ]}
      >
        {(updateFB, { loading, error, data }) => {
          const AzureStorageUrl = process.env.AZURE_STORAGE_URL_TEAMS
          const AzureStorageSAS = process.env.AZURE_STORAGE_SAS_TEAMS
          const containerName = slug

          let avatar = null
          if (this.state.avatar === null && fb.avatar === undefined) avatar = process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
          if (fb.avatar !== undefined && fb.avatar !== null) avatar = fb.avatar
          if (this.state.avatar !== null) avatar = this.state.avatar

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
              log.debug('updateTeamProfile error:', displayMessage)
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
                    Edit Financial Being
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>Update Financial Beings's Avatar</DialogContentText>
                    <ImageUpload
                      key='avatar'
                      handleUrl={this.handleAvatar}
                      fileName={`${fb.slug}-fb-avatar.jpg`}
                      containerName={containerName}
                      existingImage={avatar}
                      imagePreviewConfig={{ width: 200, title: 'Change FB Avatar' }}
                      cropContainerConfig={{ x: 10, y: 10, width: 200, height: 200 }}
                      cropPreviewBox={{ width: 350, height: 350 }}
                      saveImageConfig={{
                        quality: 0.6,
                        maxWidth: 200,
                        maxHeight: 200,
                        autoRotate: true,
                        mimeType: 'image/jpeg'
                      }}
                      AzureStorageUrl={AzureStorageUrl}
                      AzureSASURL={AzureStorageSAS}
                      cropRatio={1}
                      debug
                    />
                    <TextField
                      autoFocus
                      margin='dense'
                      id='name'
                      label='Team Name'
                      type='text'
                      fullWidth
                      disabled
                      value={fb.name}
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
                        this.handleSubmit(e, updateFB, fb.id, slug)
                      }}
                      color='primary'
                    >
                      Update Financial Being
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

  handleAvatar (avatarUrl) {
    log.debug('handleAvatar: ', avatarUrl)
    this.setState({ avatar: `${avatarUrl}?${Math.random()}` })
  }

  async handleSubmit (e, updateFB, fbId, slug) {
    log.debug('handleSubmit: ', this.state)
    e.preventDefault()

    await updateFB({
      variables: {
        fbId,
        avatar: this.state.avatar
      }
    })
    window.canvasApp.eventHandler.raiseEvent('User Profile Changed')
    this.setState({ open: false })
  }
}

ManageFBEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  fb: PropTypes.object
}

export default withStyles(styles)(ManageFBEdit)
