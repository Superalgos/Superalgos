import React, { Component } from 'react'
import { graphql, compose } from 'react-apollo'
import {withRouter} from "react-router-dom";
import { clones } from '../../../GraphQL/Calls'
import {
  Typography, Button, TextField, Dialog, DialogContent,
  DialogContentText, DialogTitle, DialogActions,
  ExpansionPanel, ExpansionPanelDetails, ExpansionPanelSummary,
  ExpansionPanelActions, Divider

} from '@material-ui/core'
import Avatar from '@material-ui/core/Avatar';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { tradingStartModesList, indicatorStartModes } from '../../../GraphQL/models'
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
            <Avatar src={clone.teamAvatar} className={classes.avatar} />
            <Typography className={classes.heading}>{clone.teamName}</Typography>
          </div>
          <div className={classes.heading}>
            <Avatar src={clone.botAvatar} className={classes.avatar} />
            <Typography className={classes.heading}>{clone.botName}</Typography>
          </div>
          <div className={classes.heading}>
            <Typography className={classes.heading}>
              { clone.processName } / { clone.botType === 'Trading' ? tradingStartModesList[clone.mode] : indicatorStartModes[clone.mode] }
            </Typography>
          </div>
        </ExpansionPanelSummary>
        <Divider />
        <ExpansionPanelDetails className={classes.details}>
            <div className={classes.column3}>
              <Typography className={classes.cloneInfoTitle}>Context Information</Typography>
              <div className={classes.details}>
                <div className={classes.column4}>
                  <Typography className={classes.cloneInfoBold}>Created:</Typography>
                  <Typography className={classes.cloneInfoBold}>Resume Execution:</Typography>
                  { isDefined(clone.beginDatetime) &&
                    <Typography className={classes.cloneInfoBold}>Begin:</Typography>
                  }
                  { isDefined(clone.endDatetime) &&
                    <Typography className={classes.cloneInfoBold}>End:</Typography>
                  }
                  { isDefined(clone.waitTime) &&
                    <Typography className={classes.cloneInfoBold}>Wait Time:</Typography>
                  }
                  { clone.botType === 'Trading' &&
                    <React.Fragment>
                      <Typography className={classes.cloneInfoBold}>Exchange:</Typography>
                      <Typography className={classes.cloneInfoBold}>Time Period:</Typography>
                      <Typography className={classes.cloneInfoBold}>Initial Balance (BTC):</Typography>
                    </React.Fragment>
                  }
                </div>
                <div className={classes.column4}>
                  <Typography className={classes.cloneInfoNormal}>{toLocalTime(clone.createDatetime)}</Typography>
                  <Typography className={classes.cloneInfoNormal}>{clone.resumeExecution ? 'Yes':'No'}</Typography>
                  { isDefined(clone.beginDatetime) &&
                    <Typography className={classes.cloneInfoNormal}>{toLocalTime(clone.beginDatetime)}</Typography>
                  }
                  { isDefined(clone.endDatetime) &&
                    <Typography className={classes.cloneInfoNormal}>{toLocalTime(clone.endDatetime)}</Typography>
                  }
                  { isDefined(clone.waitTime) &&
                    <Typography className={classes.cloneInfoNormal}>{clone.waitTime}</Typography>
                  }
                  { clone.botType === 'Trading' &&
                  <React.Fragment>
                    <Typography className={classes.cloneInfoNormal}>{clone.exchangeName}</Typography>
                    <Typography className={classes.cloneInfoNormal}>{clone.timePeriod}</Typography>
                    <Typography className={classes.cloneInfoNormal}>{clone.balanceAssetB}</Typography>
                    </React.Fragment>
                  }
                </div>
              </div>
            </div>
            { isDefined(clone.summaryDate) &&
              <React.Fragment>
                <div className={classNames(classes.column3, classes.helper)}>
                  <Typography className={classes.cloneInfoTitle}>Execution Information</Typography>
                  <div className={classes.details}>
                    <div className={classes.column4}>
                      <Typography className={classes.cloneInfoBold}>Last Execution:</Typography>
                      { (clone.botType === 'Trading' && isDefined(clone.assetA) ) &&
                        <React.Fragment>
                          <Typography className={classes.cloneInfoBold}>Buy Average:</Typography>
                          <Typography className={classes.cloneInfoBold}>Sell Average:</Typography>
                          <Typography className={classes.cloneInfoBold}>Market Rate:</Typography>
                          <Typography className={classes.cloneInfoBold}>ROI {clone.assetA}:</Typography>
                          <Typography className={classes.cloneInfoBold}>ROI {clone.assetB}:</Typography>
                        </React.Fragment>
                      }
                    </div>
                    <div className={classes.column4}>
                      <Typography className={classes.cloneInfoNormal}>{ toLocalTime(clone.summaryDate) }</Typography>
                      { (clone.botType === 'Trading' && isDefined(clone.assetA) ) &&
                        <React.Fragment>
                          <Typography className={classes.cloneInfoNormal}>{clone.buyAverage}</Typography>
                          <Typography className={classes.cloneInfoNormal}>{clone.sellAverage}</Typography>
                          <Typography className={classes.cloneInfoNormal}>{clone.marketRate}</Typography>
                          <Typography className={classes.cloneInfoNormal}>{clone.combinedProfitsA}%</Typography>
                          <Typography className={classes.cloneInfoNormal}>{clone.combinedProfitsB}%</Typography>
                        </React.Fragment>
                      }
                    </div>
                  </div>
                </div>
              </React.Fragment>
            }
            { (clone.state !== 'UNPUBLISHED') &&
              <React.Fragment>
                <div className={classNames(classes.column3, classes.helper)}>
                  <Typography className={classes.cloneInfoTitle}>Virtual Machine Status</Typography>
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
            </React.Fragment>
          }
        </ExpansionPanelDetails>
        {
          !this.props.isHistory &&
            <Divider />
        }
        {
          !this.props.isHistory &&
            <ExpansionPanelActions>
              <Button
                className={classes.buttonList}
                variant='contained' color='secondary' size='small'
                onClick={() => this.setState({ isLogsDialogOpen: true })}>
                View Process Output
              </Button>
              <Button
                className={classes.buttonList}
                variant='contained' color='secondary' size='small'
                onClick={() => this.showCloneLogs(clone)}>
                View Logs
              </Button>
              <Button
                className={classes.buttonList}
                variant='contained' color='secondary' size='small'
                onClick={this.handleRemoveDialogOpen}>
                Delete
              </Button>
            </ExpansionPanelActions>
        }
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
          fullScreen
        >
          <DialogTitle id="logs-dialog-title">
            Last clone logs
          </DialogTitle>
          <DialogContent>
            <Typography className={classes.typography} variant='subtitle1' align='justify'>
              Here you can check the clone output directly from the virtual machine.
              The last 20 lines are displayed, but you can check the Logs Module for more details.
            </Typography>
            <div className={classes.logsWrapper}>
              <TextField
                id="outlined-logs"
                defaultValue={this.props.currentClone.lastLogs}
                className={classes.textArea}
                margin="normal"
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
                multiline
              />
            </div>
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

  showCloneLogs(clone) {
    this.props.history.push("/logs/show/"+clone.botSlug+"-"+clone.id+".1.0");
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
  withStyles(styles),
  withRouter
)(ListClones)
