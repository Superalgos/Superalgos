import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Dropzone from 'react-dropzone'
// import ReactCrop from 'react-image-crop'
import { Cropper } from 'react-image-cropper'
// import azure from 'azure-storage'
import { withStyles } from '@material-ui/core/styles'

import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import Button from '@material-ui/core/Button'

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
          <img src={this.state.cropped} className={classes.cropPreview} alt='Crop Preview' />
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
  saveToStorage (xhr) {
    const blobService = azure.createBlobService()
    const container = ''
    const Stream = require('stream')
    const readable = new Stream.Readable()
    readable.push(xhr.responseText)
    readable.push(null)

    blobService.createBlockBlobFromStream(
      container,
      this.state.accepted[0].name,
      readable,
      xhr.responseText.length,
      (error, result, response) => {
        if (error) return (<p>{error}</p>)
        return 'Success'
      }
    )
    xhr.send()
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
