import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import { clones } from '../../../GraphQL/Calls'
import Poloniex from '../../../img/poloniex.png'
import Binance from '../../../img/binance.png'

import {
  Grid, Paper, Typography, Button, TextField, Dialog, DialogContent,
  DialogContentText, DialogTitle, DialogActions,
  ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary,
  ExpansionPanelActions, Chip, Divider

} from '@material-ui/core'

import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

import { isDefined, toLocalTime } from '../../../utils'
import classNames from 'classnames'
import { withStyles } from '@material-ui/core/styles'
import styles from './styles'

class ListClones extends Component {

  constructor (props) {
    super(props)
    this.state = {
      isRemoveDialogOpen: false,
      isLogsDialogOpen: false,
    }
  }

  render () {
    const { classes } = this.props
    const clone = this.props.currentClone
    return (
      <React.Fragment>
      <ExpansionPanel className={classes.root}>
        <ExpansionPanelSummary expandIcon={<ExpandMoreIcon />}>
          <div className={classes.heading}>
            <Typography className={classes.heading}>{clone.teamId}</Typography>
          </div>
          <div className={classes.heading}>
            <Typography className={classes.heading}>{clone.botId}</Typography>
          </div>
          <div className={classes.heading}>
            <Typography className={classes.heading}>{clone.mode}</Typography>
          </div>
        </ExpansionPanelSummary>
        <Divider />
        <ExpansionPanelDetails className={classes.details}>
            <div className={classes.column}>
              <Typography className={classes.cloneInfo1}>Created:</Typography>
              { isDefined(clone.beginDatetime) &&
                <Typography className={classes.cloneInfo1}>Begin:</Typography>
              }
              { isDefined(clone.endDatetime) &&
                <Typography className={classes.cloneInfo1}>End:</Typography>
              }
              { isDefined(clone.waitTime) &&
                <Typography className={classes.cloneInfo1}>Wait Time:</Typography>
              }
              <Typography className={classes.cloneInfo1}>Resume Execution:</Typography>
              <Typography className={classes.cloneInfo1}>Run As Team:</Typography>
            </div>
            <div className={classes.column2}>
              <Typography className={classes.cloneInfo2}>{toLocalTime(clone.createDatetime)}</Typography>
              { isDefined(clone.beginDatetime) &&
                <Typography className={classes.cloneInfo2}>{toLocalTime(clone.beginDatetime)}</Typography>
              }
              { isDefined(clone.endDatetime) &&
                <Typography className={classes.cloneInfo2}>{toLocalTime(clone.endDatetime)}</Typography>
              }
              { isDefined(clone.waitTime) &&
                <Typography className={classes.cloneInfo2}>{clone.waitTime}</Typography>
              }
              <Typography className={classes.cloneInfo2}>{clone.resumeExecution ? 'Yes':'No'}</Typography>
              <Typography className={classes.cloneInfo2}>{clone.runAsTeam ? 'Yes':'No'}</Typography>
            </div>
            <div className={classNames(classes.column3, classes.helper)}>
              <Typography className={classes.cloneInfo1}>Virtual Machine Status</Typography>
              <TextField
                id="outlined-state"
                defaultValue={clone.state}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                multiline
              />
            </div>
        </ExpansionPanelDetails>
        <Divider />
        <ExpansionPanelActions>
          <Button
            className={classes.buttonList}
            variant='contained' color='secondary' size='small'
            onClick={() => this.setState({ isLogsDialogOpen: true })}>
            View Logs
          </Button>
          <Button
            className={classes.buttonList}
            variant='contained' color='secondary' size='small'
            onClick={this.handleRemoveDialogOpen}>
            Delete
          </Button>
        </ExpansionPanelActions>
      </ExpansionPanel>

      <Dialog
          open={this.state.isRemoveDialogOpen}
          onClose={this.handleRemoveDialogClose}
          aria-labelledby="removeClone-dialog-title"
        >
          <DialogTitle id="removeClone-dialog-title">
            Delete Clone
          </DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this clone?
              Deleting this clone will prevent any running bots associated to this clone to access your account at the exchange.
            </DialogContentText>

            <DialogActions>
              <Button onClick={this.handleRemoveDialogOK} className={classes.buttonList}
                variant='contained' color='secondary' size='small'
                >
                Proceed
              </Button>
              <Button onClick={this.handleRemoveDialogCancel}
                className={classes.buttonList}
                variant='contained' color='secondary' size='small'
                >
                Cancel
              </Button>
            </DialogActions>
          </DialogContent>
      </Dialog>

      <Dialog
          open={this.state.isLogsDialogOpen}
          onClose={this.handleLogsDialogClose}
          aria-labelledby="logs-dialog-title"
        >
          <DialogTitle id="logs-dialog-title">
            Last clone logs
          </DialogTitle>
          <DialogContent className={classes.logsDialog}>
            <TextField
              id="outlined-logs"
              label="Last Logs"
              defaultValue={this.props.currentClone.lastLogs}
              className={classes.textArea}
              margin="normal"
              InputProps={{
                readOnly: true,
              }}
              variant="outlined"
              fullWidth
              multiline
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleLogsDialogClose} className={classes.buttonList}
              variant='contained' color='secondary' size='small' autoFocus
              >
              Close
            </Button>
          </DialogActions>
      </Dialog>

      </React.Fragment>
    )
  }

  canStopClone(){
    const state = JSON.parse(this.props.currentClone.state)
    if(isDefined(state) && state.hasOwnProperty("running")){
      return true
    } else {
      return false
    }
  }

  canRestartClone(){
    const state = JSON.parse(this.props.currentClone.state)
    if(isDefined(state) && state.hasOwnProperty("terminated")){
      return true
    } else {
      return false
    }
  }

  removeClone (clone) {
    this.props.mutate({
      variables:{
        id: clone.id
      },
      refetchQueries: [{query: clones.OPERATIONS_LIST_CLONES}]
    })
  }

  showLogs () {
    this.setState({ isLogsDialogOpen: true })
  }

  handleLogsDialogClose = () => {
    this.setState({ isLogsDialogOpen: false })
  }

  handleRemoveDialogOpen = () => {
    this.setState({ isRemoveDialogOpen: true })
  }

  handleRemoveDialogOK = () => {
    this.removeClone(this.props.currentClone)
    this.setState({ isRemoveDialogOpen: false })
  }

  handleRemoveDialogCancel = () => {
    this.setState({ isRemoveDialogOpen: false })
  }
}

export default compose(
  graphql(clones.OPERATIONS_REMOVE_CLONE),
  withStyles(styles)
)(ListClones)
