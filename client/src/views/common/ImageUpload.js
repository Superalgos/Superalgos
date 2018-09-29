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

const styles = theme => ({
  dropzoneContainer: {
    display: 'block',
    margin: '1em',
    height: 200
  },
  dropzone: {
    display: 'block',
    padding: '3em',
    height: 200,
    borderWidth: 2,
    borderColor: '#999',
    backgroundColor: '#eee'
  },
  dropzoneText: {
    textAlign: 'center'
  },
  existingImagePreview: {
    width: 100,
    height: 100
  },
  cropImageBox: {
    width: 350,
    height: 350
  }
})

// placeholder image if no existing image
const placeHolder = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EAvatar%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'

// config for image resize and quality
const imageResizeConfig = {
  quality: 0.6,
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
    this.handleChangeImage = this.handleChangeImage.bind(this)
    this.cancelChangeImage = this.cancelChangeImage.bind(this)
    this.saveImage = this.saveImage.bind(this)

    this.state = {
      open: false,
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
      uploaded: false,
      image: null,
      sasqr: null
    }
  }

  render () {
    const { classes, cropContainer, saveImageConfig, containerName, fileName, existingImage, handleUrl, AZURE_SAS_QUERY } = this.props
    let image = null
    let resizeImage = null
    if (existingImage !== undefined && existingImage !== null) {
      image = existingImage
    } else {
      image = placeHolder
    }

    if (saveImageConfig !== undefined && saveImageConfig !== null) {
      resizeImage = saveImageConfig
    } else {
      resizeImage = imageResizeConfig
    }

    return (
      <div className={classes.dropzoneContainer}>
        <Mutation mutation={AZURE_SAS_QUERY} >
          {(getAzureSAS, { loading, error, data }) => {
            if (this.state.cropping) {
              return (
                <Typography variant='title' color='primary' >Cropping...</Typography>
              )
            } else {
              return (
                <React.Fragment>
                  <div>
                    {(this.state.change || this.state.src === null) && (
                      <React.Fragment>
                        <Dropzone
                          accept='image/jpeg, image/png'
                          onDrop={(e) => this.onDrop(e, this.state.edit)}
                          className={classes.dropzone}
                          multiple={false}
                        >
                          <p>Drag-and-drop image here or click to select <br /> Only *.jpeg and *.png images</p>
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
                        <img src={image} className={classes.existingImagePreview} alt='Existing Image Preview' />
                        <Button
                          onClick={e => this.handleChangeImage(e, cropContainer)}
                          color='primary'
                        >
                          Change Image
                        </Button>
                      </React.Fragment>
                    )}
                    {this.state.image !== null && (
                      <Typography variant='title' color='primary' >Save profile to save image changes!</Typography>
                    )}
                  </div>
                  <Dialog
                    open={this.state.open}
                    onClose={this.handleClose}
                    aria-labelledby='form-dialog-title'
                  >
                    <div classes={classes.dialogContainer}>
                      <DialogContent>
                        <div className={classes.cropImageBox} >
                          {this.state.src !== null && (
                            <Cropper
                              src={this.state.src}
                              originX={100}
                              originY={100}
                              ref={ref => { this.cropper = ref }}
                              onImgLoad={this.onImageLoaded}
                              ratio={1}
                            />
                          )}
                        </div>
                      </DialogContent>
                      <DialogActions>
                        <Button onClick={this.handleClose} color='primary'>
                          Cancel
                        </Button>
                        <Button
                          onClick={(e) => this.handleCrop(e, getAzureSAS, resizeImage, containerName, fileName, handleUrl)}
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

  async handleCrop (e, getAzureSAS, resizeImage, containerName, fileName, handleUrl) {
    e.preventDefault()
    const data = await getAzureSAS({ variables: { containerName } })

    const cropped = this.cropper.crop()
    const croppedBlob = await imgSrcToBlob(cropped, 'image/png', 'Anonymous')
    let resizedBlob = await readAndCompressImage(croppedBlob, resizeImage)

    return this.setState({ cropped: resizedBlob, cropping: true, open: false }, () => {
      this.saveImage(data.getAzureSAS, containerName, fileName, handleUrl)
    })
  }

  async saveImage (SASQueryParameters, containerName, fileName, handleUrl) {
    const SASurl = `${process.env.AZURE_STORAGE_URL}?${this.state.sasqr}`

    // create Azure BlockBlobURL to save image to
    const pipeline = Azure.StorageURL.newPipeline(new Azure.AnonymousCredential())
    const serviceURL = new Azure.ServiceURL(SASurl, pipeline)

    const containerURL = Azure.ContainerURL.fromServiceURL(serviceURL, containerName)
    const blockBlobURL = Azure.BlockBlobURL.fromContainerURL(containerURL, fileName)

    await Azure.uploadBrowserDataToBlockBlob(Azure.Aborter.None, this.state.cropped, blockBlobURL)

    const image = `${process.env.AZURE_STORAGE_URL}${containerName}/${fileName}?${Math.random()}` // random number keeps browser from using cached version of existing image
    handleUrl(image) // pass image URL up to be save to DB
    this.setState({ cropping: false, uploaded: true, change: false, image: image })
    return image
  }

  handleChangeImage (e, cropContainer) {
    e.preventDefault()
    let crop = cropContainer // dimensions of cropContainer passed from above
    this.setState({
      change: true,
      crop: crop
    })
  }

  cancelChangeImage () {
    this.setState({ change: false })
  }

  handleClickOpen (e) {
    e.preventDefault()
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false, src: null, change: false })
  }
}

UploadImage.propTypes = {
  classes: PropTypes.object.isRequired,
  cropContainer: PropTypes.object, // { x: 10, y: 10, width: 200, height: 200 } (default)
  saveImageConfig: PropTypes.object, // see imageResizeConfig above for default (default)
  containerName: PropTypes.string.isRequired, // name of Azure Container image will be saved in
  fileName: PropTypes.string.isRequired, // filename to save image as
  existingImage: PropTypes.string, // image url of existing image (optional)
  handleUrl: PropTypes.func.isRequired, // function that handles uploaded image file url
  AZURE_SAS_QUERY: PropTypes.any.isRequired // GraphQL for getting Azure SAS URL
}

export default withStyles(styles)(UploadImage)
