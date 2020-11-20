import React, { Component } from 'react'
import AddClone from './AddClone'
import { withStyles } from '@material-ui/core/styles'
import styles from './styles'
import {
  Button, Dialog, DialogContent, DialogContentText, DialogTitle
} from '@material-ui/core'

class CloneDialog extends Component {

  constructor (props) {
    super(props)
    this.state = {
      selected:'',
      isNewCloneDialogOpen: false,
    }
  }

  handleNewCloneDialogOpen = () => {
    this.setState({ isNewCloneDialogOpen: true })
  };

  handleNewCloneDialogClose = () => {
    this.setState({ isNewCloneDialogOpen: false })
  };

  render () {
    const { classes } = this.props
    return (
        <div className={classes.root}>
          <Button variant="contained" color="secondary"
            aria-label="addNewClone" className={classes.button}
            onClick={this.handleNewCloneDialogOpen} >
              Add a new Clone
          </Button>
          <Dialog
              open={this.state.isNewCloneDialogOpen}
              onClose={this.handleNewCloneDialogClose}
              aria-labelledby="addClone-dialog-title"
            >
              <DialogTitle id="addClone-dialog-title">
                Add a new Clone
              </DialogTitle>
              <DialogContent>
                <DialogContentText>
                  Description...
                </DialogContentText>
                <AddClone handleNewCloneDialogClose={this.handleNewCloneDialogClose}/>
              </DialogContent>
            </Dialog>
          </div>
    )
  }
}

export default withStyles(styles)(CloneDialog)
