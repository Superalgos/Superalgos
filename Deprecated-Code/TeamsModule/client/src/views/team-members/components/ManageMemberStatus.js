import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import HistoryIcon from '@material-ui/icons/History'
import Dialog from '@material-ui/core/Dialog'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'

import log from '../../../utils/log'

const styles = theme => ({
  dialogContainer: {
    display: 'block',
    margin: '3em',
    minWidth: 400
  },
  buttonRight: {
    justifyContent: 'flex-end'
  }
})

export class ManageMemberStatus extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.state = {
      open: false,
      role: ''
    }
  }

  handleClickOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false })
  }

  handleChange (e) {
    this.setState({ name: e.target.value })
  }

  render () {
    log.debug(this.props, this.props.status)
    const { classes, status } = this.props
    return (
      <div>
        <Button
          size='small'
          color='primary'
          className={this.props.classes.buttonRight}
          onClick={this.handleClickOpen}
        >
          <HistoryIcon /> Status Details
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby='form-dialog-title'
        >
          <div classes={classes.dialogContainer}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant='h6' id='form-dialog-title'>
                  Member Status Details
                </Typography>
                {status !== null && status.map(stat => {
                  return (
                    <Typography variant='h6' id='form-dialog-title' key={stat.createdAt}>
                      {stat.status} | {stat.reason} | {stat.createdAt}
                    </Typography>
                  )
                })}
                <CardActions>
                  <Button onClick={this.handleClose} color='primary'>
                    Close
                  </Button>
                </CardActions>
              </CardContent>
            </Card>
          </div>
        </Dialog>
      </div>
    )
  }
}

ManageMemberStatus.propTypes = {
  classes: PropTypes.object.isRequired,
  status: PropTypes.array
}

export default withStyles(styles)(ManageMemberStatus)
