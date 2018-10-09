import React from 'react'
import Button from '@material-ui/core/Button'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import CssBaseline from '@material-ui/core/CssBaseline'

class Contact extends React.Component {
  state = {
    open: true
  }

  handleClickOpen = () => {
    this.setState({ open: true })
  }

  handleClose = () => {
    this.setState({ open: false })
  }

  render () {
    return (

      <React.Fragment>
        <CssBaseline />
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'>
          <DialogTitle id='alert-dialog-title'>
            {"Section under development."}
          </DialogTitle>
          <DialogContent>
            <DialogContentText id='alert-dialog-description'>
              The functionality of this section has not been developed yet. We expect to have it for November 2018. Thanks for your understanding.
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color='primary' autoFocus>
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </React.Fragment>
    )
  }
}

export default Contact
