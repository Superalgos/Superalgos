import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'
import Drawer from '@material-ui/core/Drawer'
import { Link } from 'react-router-dom'

import ProfileIcon from '@material-ui/icons/Person'
import LogoutIcon from '@material-ui/icons/DirectionsWalk'

import UserProfile from './Profile'

const LogoutLink = props => <Link to='/' {...props} />

const styles = {
  drawer: {
    width: 250
  },
  fullList: {
    width: 'auto'
  }
}

class LoggedInUserMenu extends Component {
  constructor (props) {
    super(props)

    this.handleMenu = this.handleMenu.bind(this)
    this.handleClose = this.handleClose.bind(this)
    this.handleLogout = this.handleLogout.bind(this)
    this.toggleDrawer = this.toggleDrawer.bind(this)

    this.state = {
      menu: null,
      open: false
    }
  }

  render () {
    const { menuLabel, user, classes } = this.props
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
          <MenuItem onClick={this.toggleDrawer}>
            <ProfileIcon />
            <div>Profile</div>
          </MenuItem>
          <MenuItem onClick={this.handleLogout} component={LogoutLink}>
            <LogoutIcon />
            <div>Logout</div>
          </MenuItem>
        </Menu>
        <Drawer anchor='right' open={this.state.open} onClose={this.toggleDrawer} className={classes.drawer}>
          <div
            tabIndex={0}
            role='button'
            onClick={this.toggleDrawer}
          >
            <UserProfile user={user} toggleDrawer={this.toggleDrawer} />
          </div>
        </Drawer>
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

  toggleDrawer () {
    this.setState({ open: !this.state.open })
  }
}

LoggedInUserMenu.propTypes = {
  classes: PropTypes.object.isRequired,
  menuLabel: PropTypes.string.isRequired,
  auth: PropTypes.object.isRequired,
  user: PropTypes.object
}

export default withStyles(styles)(LoggedInUserMenu)
