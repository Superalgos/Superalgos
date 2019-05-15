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

import UPDATE_TEAM_PROFILE from '../../../graphql/teams/UpdateTeamProfileMutation'
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

export class ManageTeamEdit extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleAvatar = this.handleAvatar.bind(this)
    this.handleBanner = this.handleBanner.bind(this)

    log.debug('ManageTeamEdit', props.team)
    const motto = props.team.profile.motto || ''
    const description = props.team.profile.description || ''
    const avatar = props.team.profile.avatar || null
    const banner = props.team.profile.banner || null

    this.state = {
      open: false,
      motto: motto,
      description: description,
      avatar: avatar,
      banner: banner
    }
  }

  render () {
    const { classes, team, match } = this.props
    log.debug('ManageTeamEdit ', this.props, this.props.slug, this.props.team, match)
    return (
      <Mutation
        mutation={UPDATE_TEAM_PROFILE}
        refetchQueries={[
          {
            query: GET_TEAMS_BY_OWNER
          }
        ]}
      >
        {(updateTeamProfile, { loading, error, data }) => {
          const AzureStorageUrl = process.env.AZURE_STORAGE_URL_TEAMS
          const AzureStorageSAS = process.env.AZURE_STORAGE_SAS_TEAMS
          const containerName = team.slug
          let avatar = null
          if (this.state.avatar === null && team.profile !== null && (team.profile.avatar === undefined || team.profile.avatar === null)) avatar = process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
          if (team.profile !== null && team.profile.avatar !== undefined && team.profile.avatar !== null) avatar = team.profile.avatar
          if (this.state.avatar !== null) avatar = this.state.avatar

          let banner = null
          if (this.state.banner === null && team.profile !== null && (team.profile.banner === undefined || team.profile.banner === null)) banner = process.env.STORAGE_URL + '/module-teams/module-default/aa-banner-default.png'
          if (team.profile !== null && team.profile.banner !== undefined && team.profile.banner !== null) banner = team.profile.banner
          if (this.state.banner !== null) banner = this.state.banner
          log.debug('team images: ', avatar, banner)

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
                    Edit Team Details
                  </DialogTitle>
                  <DialogContent>
                    <ImageUpload
                      key='banner'
                      handleUrl={this.handleBanner}
                      fileName={`${team.slug}-banner.jpg`}
                      containerName={containerName}
                      existingImage={banner}
                      imagePreviewConfig={{ width: 450, title: 'Change Banner' }}
                      cropContainerConfig={{ x: 10, y: 10, width: 800, height: 200 }}
                      cropPreviewBox={{ width: 650, height: 200 }}
                      saveImageConfig={{
                        quality: 0.6,
                        maxWidth: 800,
                        maxHeight: 200,
                        autoRotate: true,
                        mimeType: 'image/jpeg'
                      }}
                      AzureStorageUrl={AzureStorageUrl}
                      AzureSASURL={AzureStorageSAS}
                      cropRatio={4}
                      debug
                    />
                    <ImageUpload
                      key='avatar1'
                      handleUrl={this.handleAvatar}
                      fileName={`${team.slug}-avatar.jpg`}
                      containerName={containerName}
                      existingImage={avatar}
                      imagePreviewConfig={{ width: 200, title: 'Change Avatar' }}
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

  handleAvatar (avatarUrl) {
    log.debug('handleAvatar: ', avatarUrl)
    this.setState({ avatar: `${avatarUrl}?${Math.random()}` })
  }

  handleBanner (bannerUrl) {
    log.debug('handleBanner: ', bannerUrl)
    this.setState({ banner: `${bannerUrl}?${Math.random()}` })
  }

  async handleSubmit (e, updateTeamProfile, slug) {
    log.debug('handleSubmit: ', this.state)
    e.preventDefault()

    await updateTeamProfile({
      variables: {
        slug,
        owner: this.authId,
        description: this.state.description,
        motto: this.state.motto,
        avatar: this.state.avatar,
        banner: this.state.banner
      }
    })
    window.canvasApp.eventHandler.raiseEvent('User Profile Changed')
    this.setState({ description: '', motto: '', open: false })
  }
}

ManageTeamEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  team: PropTypes.object,
  match: PropTypes.object
}

export default withStyles(styles)(ManageTeamEdit)
