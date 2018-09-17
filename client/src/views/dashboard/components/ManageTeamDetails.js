import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import DetailsIcon from '@material-ui/icons/Details'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

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

export class ManageTeamDetails extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.state = {
      open: false
    }
  }

  render () {
    console.log(this.props.team)
    const { name, members, profile, createdAt } = this.props.team
    return (
      <div>
        <Button size='small' color='primary' className={this.props.classes.buttonRight} onClick={this.handleClickOpen}>
          <DetailsIcon /> Details
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby='form-dialog-title'
        >
          <div classes={this.props.classes.dialogContainer}>
            <DialogTitle id='form-dialog-title'>{name} Team Details</DialogTitle>
            <DialogContent>
              <Typography
                variant='display3'
                align='center'
                color='textPrimary'
                gutterBottom
              >
                {name}
              </Typography>
              <Typography variant='subheading' color='textSecondary'>
                {createdAt}
              </Typography>
              <Typography variant='subheading' color='textSecondary'>
                Motto: {profile.motto}
              </Typography>
              <Typography variant='subheading' color='textSecondary'>
                Description: {profile.description}
              </Typography>
              <Typography variant='subheading' paragraph gutterBottom>
                Members: {members.length}
              </Typography>
              <Typography variant='subheading' color='primary'>
                Team Admin:
                {
                  members.map(member => {
                    if (member.role === 'OWNER' || member.role === 'ADMIN') {
                      return member.member.alias
                    }
                  })
                }
              </Typography>
            </DialogContent>
            <DialogActions>
              <Button onClick={this.handleClose} color='primary'>
                Close
              </Button>
            </DialogActions>
          </div>
        </Dialog>
      </div>
    )
  }

  handleClickOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false })
  }
}

ManageTeamDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.any
}

export default withStyles(styles)(ManageTeamDetails)
