import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import Dropzone from 'react-dropzone'
import { Cropper } from 'react-image-cropper'
import * as Azure from '@azure/storage-blob'
import readAndCompressImage from 'browser-image-resizer'
import { imgSrcToBlob } from 'blob-util'
import { withStyles } from '@material-ui/core/styles'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'

import MessageCard from './MessageCard'

import GET_AZURE_SAS from '../../graphql/teams/GetAzureSASMutation'

const styles = theme => ({
  dropzoneContainer: {
    display: 'block',
    margin: '1em',
    minWidth: 200,
    height: 200
  },
  dropzone: {
    display: 'block',
    padding: '3em',
    minWidth: 200,
    height: 200,
    borderWidth: 2,
    borderColor: '#999',
    backgroundColor: '#eee'
  },
  dropzoneText: {
    textAlign: 'center'
  },
  cropAvatarPreview: {
    width: 100,
    height: 100
  },
  cropBannerPreview: {
    width: 400,
    height: 100
  },
  cropAvatarBox: {
    width: 350,
    height: 350
  },
  cropBannerBox: {
    width: 650,
    height: 350
  },
  reactCrop: {
  }
})

const imageAvatarConfig = {
  quality: 0.6,
  maxWidth: 200,
  maxHeight: 200,
  autoRotate: true,
  debug: true,
  mimeType: 'image/jpeg'
}

const imageBannerConfig = {
  quality: 0.6,
  maxWidth: 800,
  maxHeight: 200,
  autoRotate: true,
  debug: true,
  mimeType: 'image/jpeg'
}

class UploadImage extends Component {
  constructor (props) {
    super(props)

    this.onDrop = this.onDrop.bind(this)
    this.handleCrop = this.handleCrop.bind(this)
    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)
    this.handleChangeImage = this.handleChangeImage.bind(this)
    this.cancelChangeImage = this.cancelChangeImage.bind(this)
    this.saveImage = this.saveImage.bind(this)

    this.state = {
      open: false,
      edit: 'avatar',
      change: false,
      file: null,
      src: null,
      crop: {
        x: 10,
        y: 10,
        width: 200,
        height: 200
      },
      cropping: false,
      cropped: null,
      rejected: null,
      uploaded: false,
      avatarImage: null,
      bannerImage: null,
      sasqr: null
    }
  }

  render () {
    const { classes, team, handleAvatar, handleBanner } = this.props
    let avatar = null
    let banner = null
    if ((team.profile !== null && team.profile.avatar !== undefined && team.profile.avatar !== null && team.profile.avatar !== 'a') || this.state.avatarImage !== null) {
      avatar = this.state.avatarImage !== null ? this.state.avatarImage : `${team.profile.avatar}?${Math.random()}`
    } else {
      avatar = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EAvatar%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
    }
    if ((team.profile !== null && team.profile.banner !== undefined && team.profile.banner !== null && team.profile.banner !== '') || this.state.bannerImage !== null) {
      banner = this.state.bannerImage !== null ? this.state.bannerImage : `${team.profile.banner}?${Math.random()}`
    } else {
      banner = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23banner_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%3E%3Ctitle%3EBanner%20Placeholder%3C%2Ftitle%3E%3Crect%20stroke%3D%22null%22%20id%3D%22svg_1%22%20fill%3D%22%2355595c%22%20height%3D%22200%22%20width%3D%22800%22%2F%3E%3Cg%20stroke%3D%22null%22%20id%3D%22banner_164edaf95ee%22%3E%3Ctext%20stroke%3D%22null%22%20id%3D%22svg_3%22%20y%3D%22106.5%22%20x%3D%22367.73438%22%3EBanner%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
    }

    let handleImage
    this.state.edit === 'avatar' ? handleImage = handleAvatar : handleImage = handleBanner

    console.log('UploadImage', team, avatar, banner, this.state)
    return (
      <div className={classes.dropzoneContainer}>
        <Mutation mutation={GET_AZURE_SAS} >
          {(getAzureSAS, { loading, error, data }) => {
            console.log('getAzureSAS: ', error, data)
            if (!this.state.uploaded) {
              if (data !== undefined && data.getAzureSAS !== null) {
                this.saveImage(data.getAzureSAS, team.slug, handleImage)
              }
              // this.handleSubmit(getAzureSAS, team.slug)
            }
            if (this.state.cropping) {
              return (
                <div>
                  <MessageCard message='Cropping...' />
                </div>
              )
            } else {
              return (
                <React.Fragment>
                  <div>
                    {(this.state.change || (avatar === null && banner === null && this.state.src === null)) && (
                      <React.Fragment>
                        <Dropzone
                          accept='image/jpeg, image/png'
                          onDrop={(e) => this.onDrop(e, this.state.edit)}
                          className={classes.dropzone}
                          multiple={false}
                        >
                          <p>Drag-and-drop team {this.state.edit} here or click to select files. <br /> Only *.jpeg and *.png images</p>
                        </Dropzone>
                        <Button
                          onClick={(e) => this.cancelChangeImage()}
                          color='primary'
                        >
                          Cancel Image Change
                        </Button>
                      </React.Fragment>
                    )}
                    {!this.state.change && (
                      <React.Fragment>
                        <img src={banner} className={classes.cropBannerPreview} alt='Banner Crop Preview' />
                        <Button
                          onClick={(e) => this.handleChangeImage(e, 'banner')}
                          color='primary'
                        >
                          Change Banner
                        </Button>
                      </React.Fragment>
                    )}
                    {!this.state.change && (
                      <React.Fragment>
                        <img src={avatar} className={classes.cropAvatarPreview} alt='AvatarCrop Preview' />
                        <Button
                          onClick={(e) => this.handleChangeImage(e, 'avatar')}
                          color='primary'
                        >
                          Change Avatar
                        </Button>
                      </React.Fragment>
                    )}
                    {(this.state.avatarImage !== null || this.state.bannerImage !== null) && (
                      <Typography variant='title' color='primary' >Click Update Team to save image changes!</Typography>
                    )}
                  </div>
                  <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby='form-dialog-title'
                  >
                    <div classes={classes.dialogContainer}>
                      <DialogContent>
                        <div className={this.state.edit === 'avatar' ? classes.cropAvatarBox : classes.cropBannerBox}>
                          {this.state.src !== null && (
                            <Cropper
                              src={this.state.src}
                              originX={100}
                              originY={100}
                              ref={ref => { this.cropper = ref }}
                              onImgLoad={this.onImageLoaded}
                              ratio={this.state.edit === 'avatar' ? 1 : 4}
                            />
                          )}
                        </div>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={this.handleClose} color='primary'>
                          Cancel
                        </Button>
                        <Button
                          onClick={(e) => this.handleCrop(e, getAzureSAS, team.slug, handleImage)}
                          color='primary'
                        >
                          Crop Image
                        </Button>
                      </DialogActions>
                    </div>
                  </Dialog>
                </React.Fragment>
              )
            }
          }}
        </Mutation>
      </div>
    )
  }

  onDrop (file, editImageType) {
    console.log('onDrop', file)
    this.onSelectFile(file, editImageType)
    this.setState({
      file
    })
  }

  onSelectFile (file, editImageType) {
    if (file && file.length > 0) {
      const reader = new window.FileReader()
      reader.addEventListener(
        'load',
        () =>
          this.setState({
            src: reader.result,
            open: true
          }),
        false
      )
      reader.readAsDataURL(file[0])
    }
  }

  async handleCrop (e, getAzureSAS, teamSlug, handleImage) {
    e.preventDefault()
    const data = await getAzureSAS({ variables: { teamSlug } })
    console.log('handleCrop', this.cropper, data)
    const cropped = this.cropper.crop()
    const croppedBlob = await imgSrcToBlob(cropped, 'image/png', 'Anonymous')
    let imageConfig = this.state.edit === 'avatar' ? imageAvatarConfig : imageBannerConfig
    let resizedBlob = await readAndCompressImage(croppedBlob, imageConfig)

    return this.setState({ cropped: resizedBlob, cropping: true, open: false }, () => {
      this.saveImage(data.getAzureSAS, teamSlug, handleImage)
    })
  }

  async handleSubmit (e, getAzureSAS, teamSlug) {
    e.preventDefault()
    let SAS = await getAzureSAS({ variables: { teamSlug } })
    console.log('handleSubmit: ', await SAS)
    return this.setState({ sasqr: SAS })
  }

  async saveImage (SASQueryParameters, teamSlug, handleImage) {
    const fileName = this.state.edit === 'avatar' ? `${teamSlug}-avatar.jpg` : `${teamSlug}-banner.jpg`
    let SASurl
    if (this.state.sasqr === null) {
      SASurl = process.env.AZURE_SAS_URL
    } else {
      SASurl = `${process.env.AZURE_STORAGE_URL}?${this.state.sasqr}`
    }
    console.log('getAzureSAS2 SASurl: ', SASurl, this.state.sasqr)

    const pipeline = Azure.StorageURL.newPipeline(new Azure.AnonymousCredential())
    const serviceURL = new Azure.ServiceURL(SASurl, pipeline)

    const containerName = teamSlug
    const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName)
    const blockBlobURL = Azure.BlockBlobURL.fromContainerURL(containerURL, fileName)

    await Azure.uploadBrowserDataToBlockBlob(Azure.Aborter.None, this.state.cropped, blockBlobURL)

    const image = `${process.env.AZURE_STORAGE_URL}${teamSlug}/${fileName}?${Math.random()}`
    handleImage(image)
    let avatarImage = this.state.edit === 'avatar' ? image : null
    let bannerImage = this.state.edit === 'banner' ? image : null
    this.setState({ cropping: false, uploaded: true, change: false, avatarImage: avatarImage, bannerImage: bannerImage })
    return image
  }

  handleChangeImage (e, editImageType) {
    e.preventDefault()
    let crop = editImageType === 'avatar' ? { x: 10, y: 10, width: 200, height: 200 } : { x: 10, y: 10, width: 800, height: 200 }
    this.setState({
      edit: editImageType,
      change: true,
      crop: crop
    })
  }

  cancelChangeImage () {
    this.setState({ change: false })
  }

  handleClickOpen (e, editImageType) {
    e.preventDefault()
    this.setState({
      open: true
    })
  }

  handleClose () {
    this.setState({ open: false, src: null, change: false })
  }
}

UploadImage.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object,
  handleAvatar: PropTypes.func.isRequired,
  handleBanner: PropTypes.func.isRequired
}

export default withStyles(styles)(UploadImage)
