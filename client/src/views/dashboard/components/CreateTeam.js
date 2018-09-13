import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withRouter } from 'react-router-dom'
import Button from '@material-ui/core/Button'
import AddIcon from '@material-ui/icons/Add'
import TextField from '@material-ui/core/TextField'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import Typography from '@material-ui/core/Typography'

import { getItem } from '../../../utils/local-storage'

export class CreateTeamDialog extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handlePost = this.handlePost.bind(this)
    this.slugify = this.slugify.bind(this)
    this.handleChange = this.handleChange.bind(this)

    this.state = {
      open: false,
      name: ''
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
    console.log(this.props)
    return (
      <div>
        <Button
          variant='extendedFab'
          aria-label='AddTeam'
          className={this.props.classes.button}
          onClick={this.handleClickOpen}
        >
          <AddIcon className={this.props.classes.extendedIcon} />
          <Typography variant='subheading'>Create A Team</Typography>
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby='form-dialog-title'
        >
          <DialogTitle id='form-dialog-title'>Subscribe</DialogTitle>
          <DialogContent>
            <Typography variant='subheading'>Team Creation</Typography>
            <DialogContentText>Name your team!</DialogContentText>
            <TextField
              autoFocus
              margin='dense'
              id='teamname'
              label='Team Name'
              type='text'
              fullWidth
              value={this.state.name}
              onChange={this.handleChange}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color='primary'>
              Cancel
            </Button>
            <Button onClick={this.handlePost} color='primary'>
              Create Team
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    )
  }

  slugify (string) {
    const a = 'àáäâãåèéëêìíïîòóöôùúüûñçßÿœæŕśńṕẃǵǹḿǘẍźḧ·/_,:;'
    const b = 'aaaaaaeeeeiiiioooouuuuncsyoarsnpwgnmuxzh------'
    const p = new RegExp(a.split('').join('|'), 'g')

    return string
      .toString()
      .toLowerCase()
      .replace(/\s+/g, '-') // Replace spaces with -
      .replace(p, c => b.charAt(a.indexOf(c))) // Replace special characters
      .replace(/&/g, '-and-') // Replace & with 'and'
      .replace(/[^\w-]+/g, '') // Remove all non-word characters
      .replace(/--+/g, '-') // Replace multiple - with single -
      .replace(/^-+/, '') // Trim - from start of text
      .replace(/-+$/, '') // Trim - from end of text
  }

  async handlePost (e) {
    e.preventDefault()
    const { name } = this.state
    const slug = this.slugify(name)
    const currentUser = await getItem('user')
    let authId = JSON.parse(currentUser)
    authId = authId.sub
    console.log('createPage cu:', JSON.parse(currentUser))
    await this.props.createTeamMutation({
      variables: {
        name,
        slug,
        owner: authId
      }
    })
    this.setState({ open: false })
  }
}

CreateTeamDialog.propTypes = {
  classes: PropTypes.object.isRequired,
  createTeamMutation: PropTypes.function
}

export default withRouter(CreateTeamDialog)
