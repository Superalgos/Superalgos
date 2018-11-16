import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import { withStyles } from '@material-ui/core/styles'

import Grid from '@material-ui/core/Grid'
import TextField from '@material-ui/core/TextField'
import Typography from '@material-ui/core/Typography'

import { ImageUpload } from '@advancedalgos/web-components'

import UPDATE_TEAM_PROFILE from '../../../graphql/teams/UpdateTeamProfileMutation'
import GET_TEAMS_BY_OWNER from '../../../graphql/teams/GetTeamsByOwnerQuery'

import { checkGraphQLError } from '../../../utils/graphql-errors'
import log from '../../../utils/log'

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  layout: {
    width: '100%',
    marginBottom: theme.spacing.unit * 6,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      width: 800,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  paper: {
    marginTop: 0,
    marginBottom: theme.spacing.unit * 3,
    padding: 0,
    [theme.breakpoints.up(800 + theme.spacing.unit * 3 * 2)]: {
      marginTop: theme.spacing.unit * 3,
      marginBottom: theme.spacing.unit * 6,
      padding: `0 0 ${theme.spacing.unit * 2}px`
    }
  },
  heroContent: {
    maxWidth: 800,
    margin: '0 auto',
    padding: `0 0 ${theme.spacing.unit * 2}px`
  },
  teamMeta: {
    borderRight: '1px solid #CCCCCC',
    margin: `${theme.spacing.unit * 3}px 0 0`,
    paddingLeft: `${theme.spacing.unit * 2}px`,
    textAlign: 'center'
  },
  teamContent: {
    '& h2': {
      padding: `${theme.spacing.unit * 4}px ${theme.spacing.unit * 3}px ${theme.spacing.unit * 2}px`
    },
    '& h4': {
      padding: `0 ${theme.spacing.unit * 3}px 0`
    },
    '& h6': {
      padding: `${theme.spacing.unit * 2}px ${theme.spacing.unit * 3}px 0`
    }
  },
  editInput: {
    padding: `0 ${theme.spacing.unit * 3}px ${theme.spacing.unit * 2}px`,
    '& label': {
      padding: `0 ${theme.spacing.unit * 3}px 0`
    }
  },
  banner: {
    maxWidth: '100%',
    height: 'auto',
    width: '100%'
  },
  avatar: {
    maxWidth: 125,
    height: 125,
    margin: `0 auto ${theme.spacing.unit * 2}px`,
    verticalAlign: 'middle',
    borderRadius: '50%'
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
    const { classes, team, match, save, handleUpdate } = this.props
    log.debug('ManageTeamEdit ', this.props, this.props.slug, this.props.team, match)

    const created = new Date(team.createdAt)

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
          if (this.state.avatar === null && team.profile !== null && (team.profile.avatar === undefined || team.profile.avatar === null)) avatar = 'https://aadevelop.blob.core.windows.net/module-teams/module-default/aa-avatar-default.png'
          if (team.profile !== null && team.profile.avatar !== undefined && team.profile.avatar !== null) avatar = team.profile.avatar
          if (this.state.avatar !== null) avatar = this.state.avatar

          let banner = null
          if (this.state.banner === null && team.profile !== null && (team.profile.banner === undefined || team.profile.banner === null)) banner = 'https://aadevelop.blob.core.windows.net/module-teams/module-default/aa-banner-default.png'
          if (team.profile !== null && team.profile.banner !== undefined && team.profile.banner !== null) banner = team.profile.banner
          if (this.state.banner !== null) banner = this.state.banner
          log.debug('team images: ', avatar, banner)

          if (save) {
            this.handleSubmit(updateTeamProfile, team.slug, handleUpdate)
          }

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
            <React.Fragment>
              <ImageUpload
                key='banner'
                handleUrl={this.handleBanner}
                fileName={`${team.slug}-banner.jpg`}
                containerName={containerName}
                existingImage={banner}
                imagePreviewConfig={{ width: 800, title: 'Change Banner' }}
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
              <Grid container>
                <Grid md={3}>
                  <Grid container className={classes.teamMeta} direction='column' justify='center'>
                    <ImageUpload
                      key='avatar1'
                      handleUrl={this.handleAvatar}
                      fileName={`${team.slug}-avatar.jpg`}
                      containerName={containerName}
                      existingImage={avatar}
                      imagePreviewConfig={{ width: 125, title: 'Change Avatar' }}
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
                    <Typography variant='subtitle1' paragraph gutterBottom>
                      Members: {team.members.length}
                    </Typography>
                    <Typography variant='subtitle1' paragraph gutterBottom>
                      Financial Beings: 1
                    </Typography>
                    <Typography variant='subtitle1' paragraph gutterBottom>
                      Created: {created.toLocaleDateString()}
                    </Typography>
                  </Grid>
                </Grid>
                <Grid md={9}>
                  <Grid container className={classes.teamContent} direction='column'>
                    <Typography
                      variant='h2'
                      color='textPrimary'
                      gutterBottom
                    >
                      {team.name}
                    </Typography>
                    <Typography
                      variant='h4'
                      color='textSecondary'
                      gutterBottom
                    >
                      Motto:
                    </Typography>
                    <TextField
                      autoFocus
                      margin='dense'
                      id='motto'
                      label='Team Motto'
                      type='text'
                      fullWidth
                      value={this.state.motto}
                      onChange={this.handleChange}
                      className={classes.editInput}
                    />
                    <Typography variant='h6' color='textPrimary' gutterBottom>
                      Description:
                    </Typography>
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
                      className={classes.editInput}
                    />
                  </Grid>
                </Grid>
                {loader}
                {errors}
              </Grid>
            </React.Fragment>
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

  async handleSubmit (updateTeamProfile, slug, handleUpdate) {
    log.debug('handleSubmit: ', this.state)

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
    handleUpdate()
  }
}

ManageTeamEdit.propTypes = {
  classes: PropTypes.object.isRequired,
  slug: PropTypes.string.isRequired,
  team: PropTypes.object,
  match: PropTypes.object,
  save: PropTypes.bool,
  handleUpdate: PropTypes.func
}

export default withStyles(styles)(ManageTeamEdit)
