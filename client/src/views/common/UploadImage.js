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
  cropPreview: {
    width: 200,
    height: 200
  },
  cropBox: {
    width: 350,
    height: 350
  },
  reactCrop: {
  }
})

const imageConfig = {
  quality: 0.5,
  maxWidth: 200,
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
    this.saveAvatar = this.saveAvatar.bind(this)

    this.state = {
      open: false,
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
      image: ''
    }
  }

  render () {
    const { classes, team, authId, handleAvatar } = this.props
    let avatar = null
    if (team.profile !== null && team.profile.avatar !== undefined && team.profile.avatar !== null && team.profile.avatar !== 'a') {
      avatar = team.profile.avatar
    } else {
      if (this.state.image !== '') avatar = this.state.image
    }

    console.log('UploadImage', team, avatar, authId, this.state)
    return (
      <div className={classes.dropzoneContainer}>
        {avatar === null && this.state.src === null && (
          <Dropzone
            accept='image/jpeg, image/png'
            onDrop={this.onDrop}
            className={classes.dropzone}
            multiple={false}
          >
            <p>Drag-and-drop team avater here or click to select files. <br /> Only *.jpeg and *.png images</p>
          </Dropzone>
        )}
        {(avatar !== null || this.state.src !== null) && (
          <Mutation mutation={GET_AZURE_SAS} >
            {(getAzureSAS, { loading, error, data }) => {
              console.log('getAzureSAS: ', error, data)
              if (!this.state.uploaded) {
                if (data !== undefined && data.getAzureSAS !== null) {
                  this.saveAvatar(data.getAzureSAS, team.slug, handleAvatar)
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
                      <img src={avatar} className={classes.cropPreview} alt='Crop Preview' />
                    </div>
                    <Dialog
                      open={this.state.open}
                      onClose={this.handleClose}
                      aria-labelledby='form-dialog-title'
                    >
                      <div classes={classes.dialogContainer}>
                        <DialogContent>
                          <div className={classes.cropBox}>
                            <Cropper
                              src={this.state.src}
                              originX={100}
                              originY={100}
                              ref={ref => { this.cropper = ref }}
                              onImgLoad={this.onImageLoaded}
                            />
                          </div>
                        </DialogContent>
                        <DialogActions>
                          <Button onClick={this.handleClose} color='primary'>
                            Cancel
                          </Button>
                          <Button
                            onClick={(e) => this.handleCrop(e, getAzureSAS, team.slug, handleAvatar)}
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
        )}
      </div>
    )
  }

  onDrop (file) {
    console.log('onDrop', file)
    this.onSelectFile(file)
    this.setState({
      file
    })
  }

  onSelectFile (file) {
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

  async handleCrop (e, getAzureSAS, teamSlug, handleAvatar) {
    e.preventDefault()
    const data = await getAzureSAS({ variables: { teamSlug } })
    console.log('handleCrop', this.cropper, data)
    const cropped = this.cropper.crop()
    const croppedBlob = await imgSrcToBlob(cropped, 'image/png', 'Anonymous')
    let resizedBlob = await readAndCompressImage(croppedBlob, imageConfig)

    return this.setState({ cropped: resizedBlob, cropping: true, open: false }, () => {
      this.saveAvatar(data.getAzureSAS, teamSlug, handleAvatar)
    })
  }

  async handleSubmit (e, getAzureSAS, teamSlug) {
    e.preventDefault()
    await getAzureSAS({ variables: { teamSlug } })
  }

  async saveAvatar (SASQueryParameters, teamSlug, handleAvatar) {
    const fileName = `${teamSlug}-avatar.jpg`
    console.log('saveAvatar SASurl', process.env.AZURE_SAS_URL)
    const SASurl2 = `${process.env.AZURE_STORAGE_URL}?${SASQueryParameters}`
    const SASurl = process.env.AZURE_SAS_URL
    console.log('getAzureSAS2 SASurl: ', SASurl2, SASurl)
    const pipeline = Azure.StorageURL.newPipeline(new Azure.AnonymousCredential())
    const serviceURL = new Azure.ServiceURL(SASurl, pipeline)
    console.log('getAzureSAS2: ', serviceURL)
    const containerName = teamSlug
    const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName)
    console.log('getAzureSAS3: ', containerURL)
    const blockBlobURL = Azure.BlockBlobURL.fromContainerURL(containerURL, fileName)

    console.log('getAzureSAS34: ', blockBlobURL)
    const avatar = await Azure.uploadBrowserDataToBlockBlob(Azure.Aborter.None, this.state.cropped, blockBlobURL)
    console.log('saveAvatar: ', avatar)
    const image = `${process.env.AZURE_STORAGE_URL}${teamSlug}/${fileName}`
    handleAvatar(image)
    this.setState({ cropping: false, uploaded: true, image: image })
    return avatar
  }

  handleClickOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false, src: null })
  }
}

UploadImage.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object,
  authId: PropTypes.string.isRequired,
  handleAvatar: PropTypes.func.isRequired
}

export default withStyles(styles)(UploadImage)
