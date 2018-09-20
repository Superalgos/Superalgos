import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Mutation } from 'react-apollo'
import Dropzone from 'react-dropzone'
import { Cropper } from 'react-image-cropper'
import * as Azure from '@azure/storage-blob'
import { imgSrcToBlob } from 'blob-util'
import { withStyles } from '@material-ui/core/styles'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Button from '@material-ui/core/Button'

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

class UploadImage extends Component {
  constructor (props) {
    super(props)

    // this.saveToStorage = this.saveToStorage.bind(this)
    this.onDrop = this.onDrop.bind(this)
    this.handleCrop = this.handleCrop.bind(this)
    this.onCropComplete = this.onCropComplete.bind(this)
    this.onCropChange = this.onCropChange.bind(this)
    this.getCroppedImg = this.getCroppedImg.bind(this)
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
      cropped: null,
      rejected: null
    }
  }

  render () {
    const { classes, team, authId } = this.props
    console.log('UploadImage', team, authId, this.state)
    return (
      <div className={classes.dropzoneContainer}>
        {this.state.src === null && (
          <Dropzone
            accept='image/jpeg, image/png'
            onDrop={this.onDrop}
            className={classes.dropzone}
            multiple={false}
          >
            <p>Drag-and-drop team avater here or click to select files. <br /> Only *.jpeg and *.png images</p>
          </Dropzone>
        )}
        {this.state.cropped !== null && (
          <Mutation mutation={GET_AZURE_SAS} >
            {(getAzureSAS, { loading, error, data }) => {
              console.log('getAzureSAS: ', error, data)
              console.log('getAzureSAS keys: ', process.env.AZURE_STORAGE_URL, process.env.AZURE_SAS)
              if (data !== undefined && data.getAzureSAS !== null) {
                this.saveAvatar(data.getAzureSAS, team.slug)
              }
              return (
                <div>
                  <img src={this.state.cropped} className={classes.cropPreview} alt='Crop Preview' />
                  <Button onClick={(e) => this.handleSubmit(e, getAzureSAS, team.slug)}>Save</Button>
                </div>
              )
            }}
          </Mutation>
        )}
        {this.state.src !== null && (
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
                  onClick={this.handleCrop}
                  color='primary'
                >
                  Crop Image
                </Button>
              </DialogActions>
            </div>
          </Dialog>
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

  handleCrop () {
    console.log('handleCrop', this.cropper)
    this.setState({ cropped: this.cropper.crop(), open: false })
  }

  async handleSubmit (e, getAzureSAS, teamSlug) {
    e.preventDefault()

    await getAzureSAS({ variables: { teamSlug } })
  }

  async saveAvatar (SASQueryParameters, teamSlug) {
    const blob = await imgSrcToBlob(this.state.cropped, 'image/png', 'Anonymous')
    console.log('handleSubmit0:', await blob, await blob.type)
    const type = blob.type
    let ext
    if (type === 'image/jpeg') ext = 'jpg'
    if (type === 'image/png') ext = 'png'
    const fileName = `${teamSlug}-avatar.${ext}`
    console.log('saveAvatar SASurl', process.env.AZURE_SAS_URL)
    // const SASurl = `${process.env.AZURE_STORAGE_URL}?${SASQueryParameters}`
    const SASurl = process.env.AZURE_SAS_URL

    const pipeline = Azure.StorageURL.newPipeline(new Azure.AnonymousCredential())
    const serviceURL = new Azure.ServiceURL(SASurl, pipeline)
    console.log('getAzureSAS2: ', serviceURL)
    const containerName = teamSlug
    const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName)
    console.log('getAzureSAS3: ', containerURL)
    const blockBlobURL = Azure.BlockBlobURL.fromContainerURL(containerURL, fileName)

    console.log(Azure.Aborter.None, await blob, blockBlobURL)
    const avatar = await Azure.uploadBrowserDataToBlockBlob(Azure.Aborter.None, blob, blockBlobURL)
    console.log('saveAvatar: ', avatar)
    return avatar
  }

  onCropComplete (crop, pixelCrop) {
    console.log('onCropComplete', crop, pixelCrop, this.state)
    const cropped = this.getCroppedImg(crop, pixelCrop, this.state.src)
    this.setState({ cropped })
  }

  onCropChange (crop) {
    this.setState({ crop })
  }

  getCroppedImg (image, pixelCrop, fileName) {
    const canvas = document.createElement('canvas')
    canvas.width = pixelCrop.width
    canvas.height = pixelCrop.height
    const ctx = canvas.getContext('2d')

    ctx.drawImage(
      image,
      pixelCrop.x,
      pixelCrop.y,
      pixelCrop.width,
      pixelCrop.height,
      0,
      0,
      pixelCrop.width,
      pixelCrop.height
    )

    // As Base64 string
    return canvas.toDataURL('image/jpeg')

    // As a blob
    /*
    return new Promise((resolve, reject) => {
      canvas.toBlob(file => {
        file.name = fileName
        resolve(file)
      }, 'image/jpeg')
    });
    */
  }

  handleClickOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false, src: null })
  }
  /*
  async saveToStorage (file) {
    const blobService = Azure.createBlobService()
    const container = ''

    await uploadBrowserDataToBlockBlob(Aborter.None, file, blockBlobURL, {
      blockSize: 4 * 1024 * 1024, // 4MB block size
      parallelism: 20, // 20 concurrency
      progress: ev => console.log(ev)
    });
  }
  */
}

UploadImage.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.object,
  authId: PropTypes.string.isRequired
}

export default withStyles(styles)(UploadImage)

/*
<ReactCrop
  src={this.state.src}
  crop={this.state.crop}
  onImageLoaded={this.onImageLoaded}
  onComplete={this.onCropComplete}
  onChange={this.onCropChange}
  className={classes.reactCrop}
  imageStyle={{ display: 'block', maxWidth: '100%', maxHeight: 'stretch' }}
/>
*/
