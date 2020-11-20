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

import { MessageCard, ImageUpload } from '@superalgos/web-components'

import log from '../../../utils/log'

import UPDATE_TEAM_PROFILE from '../../../graphql/teams/UpdateTeamProfileMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import { checkGraphQLError } from '../../../utils/graphql-errors'

import GET_AZURE_SAS from '../../../graphql/teams/GetAzureSASMutation'

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
    const avatar = props.team.profile.avatar || ''
    const banner = props.team.profile.banner || ''
    this.authId = props.authId

    this.state = {
      open: false,
      motto: motto,
      description: description,
      avatar: avatar,
      banner: banner
    }
  }

  render () {
    log.debug('ManageTeamEdit ', this.props, this.props.slug, this.props.team)
    const { classes, team } = this.props
    return (
      <Mutation
        mutation={UPDATE_TEAM_PROFILE}
        refetchQueries={[
          {
            query: GET_TEAMS_BY_OWNER,
            variables: { authId: this.authId }
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
                    <Mutation mutation={GET_AZURE_SAS} >
                      {(getAzureSAS, { loading, error, data }) => {
                        log.debug('getAzureSAS: ', loading, error, data, team.profile)
                        const AzureStorageUrl = process.env.AZURE_STORAGE_URL
                        const containerName = team.slug
                        let AzureSASURL
                        if (!loading && data !== undefined) {
                          AzureSASURL = data.getAzureSAS
                        } else {
                          getAzureSAS({ variables: { teamSlug: containerName } })
                        }

                        let avatar = null
                        if (team.profile !== null && team.profile.avatar !== undefined && team.profile.avatar !== null) avatar = team.profile.avatar
                        if (this.state.avatar !== null) avatar = this.state.avatar
                        if (this.state.avatar === null && team.profile !== null && team.profile.avatar === undefined) avatar = process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
                        let banner = null
                        if (team.profile !== null && team.profile.banner !== undefined && team.profile.banner !== null) banner = team.profile.banner
                        if (this.state.banner !== null) banner = this.state.banner
                        if (this.state.banner === null && team.profile !== null && team.profile.banner === undefined) banner = process.env.STORAGE_URL + '/module-teams/module-default/aa-banner-default.png'
                        log.debug('team images: ', avatar, banner)

                        if (loading || data === undefined) {
                          return (<MessageCard message='Loading...' />)
                        } else {
                          return (
                            <React.Fragment>
                              <ImageUpload
                                key='banner'
                                handleUrl={this.handleBanner}
                                fileName={`${team.slug}-banner.jpg`}
                                containerName={containerName}
                                existingImage={banner}
                                cropContainer={{ x: 10, y: 10, width: 800, height: 200 }}
                                cropPreviewBox={{ width: 650, height: 200 }}
                                saveImageConfig={{
                                  quality: 0.6,
                                  maxWidth: 800,
                                  maxHeight: 200,
                                  autoRotate: true,
                                  mimeType: 'image/jpeg'
                                }}
                                AzureStorageUrl={AzureStorageUrl}
                                AzureSASURL={AzureSASURL}
                                cropRatio={4}
                                debug
                              />
                              <ImageUpload
                                key='avatar'
                                handleUrl={this.handleAvatar}
                                fileName={`${team.slug}-avatar.jpg`}
                                containerName={containerName}
                                existingImage={avatar}
                                cropContainer={{ x: 10, y: 10, width: 200, height: 200 }}
                                cropPreviewBox={{ width: 350, height: 350 }}
                                saveImageConfig={{
                                  quality: 0.6,
                                  maxWidth: 200,
                                  maxHeight: 200,
                                  autoRotate: true,
                                  mimeType: 'image/jpeg'
                                }}
                                AzureStorageUrl={AzureStorageUrl}
                                AzureSASURL={AzureSASURL}
                                cropRatio={1}
                                debug
                              />
                            </React.Fragment>
                          )
                        }
                      }}
                    </Mutation>
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
    this.setState({ description: '', motto: '', open: false })
  }
}

ManageTeamEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  team: PropTypes.object,
  authId: PropTypes.string.isRequired
}

export default withStyles(styles)(ManageTeamEdit)
