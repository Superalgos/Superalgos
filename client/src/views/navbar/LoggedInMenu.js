import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import { Link } from 'react-router-dom'

import ProfileIcon from '@material-ui/icons/Person'
import LogoutIcon from '@material-ui/icons/DirectionsWalk'

const UserLink = props => <Link to='/user' {...props} />
const LogoutLink = props => <Link to='/' {...props} />

class LoggedInUserMenu extends Component {
  constructor (props) {
    super(props)

    this.handleMenu = this.handleMenu.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleLogout = this.handleLogout.bind(this)

    this.state = {
      menu: null
    }
  }

  render () {
    const { menuLabel } = this.props
    return (
      <React.Fragment>
        <Button
          aria-owns={this.state.open ? 'render-props-menu' : null}
          aria-haspopup='true'
          onClick={e => this.handleMenu(e)}
          color='inherit'
        >
          {menuLabel}
        </Button>
        <Menu
          id='render-props-menu'
          anchorEl={this.state.menu}
          open={Boolean(this.state.menu)}
          onClose={this.handleClose}
        >
          <MenuItem onClick={this.handleClose} component={UserLink}>
            <ProfileIcon />
            <div>Profile</div>
          </MenuItem>
          <MenuItem onClick={this.handleLogout} component={LogoutLink}>
            <LogoutIcon />
            <div>Logout</div>
          </MenuItem>
        </Menu>
      </React.Fragment>
    )
  }

  handleMenu (e) {
    this.setState({ menu: e.currentTarget })
  }

  handleClose () {
    this.setState({ menu: null })
  }

  handleLogout () {
    this.props.auth.logout()
    this.setState({ menu: null })
  }
}

LoggedInUserMenu.propTypes = {
  menuLabel: PropTypes.string.isRequired,
  auth: PropTypes.object.isRequired
}

export default LoggedInUserMenu
