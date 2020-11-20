import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import Button from '@material-ui/core/Button'
import EditIcon from '@material-ui/icons/Edit'
import Dialog from '@material-ui/core/Dialog'
import DialogContent from '@material-ui/core/DialogContent'
import Typography from '@material-ui/core/Typography'

import { ImageUpload } from '@superalgos/web-components'

import UPDATE_FB from '../../../graphql/teams/UpdateFBMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import { checkGraphQLError } from '../../../utils/graphql-errors'

import log from '../../../utils/log'

const styles = theme => ({
  dialogTitle: {
    textAlign: 'center',
    paddingBottom: `${theme.spacing.unit * 2}px`
  },
  buttonRight: {
    justifyContent: 'flex-end'
  }
})

export class ManageTeamProfileFBEdit extends Component {
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
    log.debug('ManageTeamProfileFBEdit ', this.props, this.props.slug, this.props.fb)
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
              <Typography variant='caption'>Updating avatar...</Typography>
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
          log.debug('ManageTeamProfileFBEdit mutation:', classes)
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
                <DialogContent>
                  <Grid container justify='center' direction='column'>
                    <Grid item className={classes.dialogTitle}>
                      <Typography variant='h4'>
                        Edit Financial Being
                      </Typography>
                    </Grid>
                    <ImageUpload
                      key='avatar'
                      handleUrl={this.handleAvatar}
                      fileName={`${fb.slug}-fb-avatar.jpg`}
                      containerName={containerName}
                      existingImage={avatar}
                      imagePreviewConfig={{
                        width: '125px',
                        height: '125px',
                        title: 'Change FB Avatar',
                        fontSize: '1.5em'
                      }}
                      cropContainerConfig={{ x: 10, y: 10, width: 200, height: 200 }}
                      cropPreviewBox={{ width: 350, height: 350 }}
                      saveImageConfig={{
                        quality: 0.6,
                        maxWidth: 200,
                        maxHeight: 200,
                        autoRotate: true,
                        mimeType: 'image/jpeg'
                      }}
                      containerStyle={{
                        display: 'block',
                        margin: '0 auto 3em',
                        height: '125px',
                        width: '125px',
                        overflow: 'visible'
                      }}
                      dropzoneStyle={{
                        height: 125,
                        title: 'Drop new image or click to select'
                      }}
                      AzureStorageUrl={AzureStorageUrl}
                      AzureSASURL={AzureStorageSAS}
                      cropRatio={1}
                      debug
                    />
                    {loader}
                    {errors}
                    <Grid container justify='center' alignItems='center' direction='column'>
                      <Button
                        onClick={e => {
                          this.handleSubmit(e, updateFB, fb.id, slug)
                        }}
                        color='secondary'
                        variant='contained'
                        size='small'
                      >
                        Update Financial Being
                      </Button>
                      <Button onClick={this.handleClose} color='primary'>
                        Cancel
                      </Button>
                    </Grid>
                  </Grid>
                </DialogContent>
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

ManageTeamProfileFBEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  fb: PropTypes.object
}

export default withStyles(styles)(ManageTeamProfileFBEdit)
