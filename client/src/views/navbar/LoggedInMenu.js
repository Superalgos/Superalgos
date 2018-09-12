import React, { Component } from 'react'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { Link } from 'react-router-dom'

import ProfileIcon from '@material-ui/icons/Person'
import LogoutIcon from '@material-ui/icons/DirectionsWalk'

import { getItem } from '../../utils/local-storage'

const UserLink = props => <Link to='/user' {...props} />
const LogoutLink = props => <Link to='/logout' {...props} />

class LoggedInUserMenu extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null,
      open: false
    }
  }

  ComponentDidMount () {
    getItem('user').then(data => this.setState({ user: data })) // Set user to state
  }

  render () {
    const { menuLabel, anchorEl, updateAnchorEl } = this.propTypes
    return (
      <React.Fragment>
        <Button
          aria-owns={this.state.open ? 'render-props-menu' : null}
          aria-haspopup='true'
          onClick={event => {
            updateAnchorEl(event.currentTarget)
          }}
          color='inherit'
        >
          {menuLabel}
        </Button>
        <Menu
          id='render-props-menu'
          anchorEl={anchorEl}
          open={this.state.open}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose} component={UserLink}>
            <ProfileIcon />
            <div>Profile</div>
          </MenuItem>
          <MenuItem onClick={this.handleClose} component={LogoutLink}>
            <LogoutIcon />
            <div>Logout</div>
          </MenuItem>
        </Menu>
      </React.Fragment>
    )
  }

  handleClose () {
    this.setState({ open: !this.state.open })
  }
}

export default LoggedInUserMenu
