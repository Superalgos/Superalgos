import React, { Component } from 'react'
import toRenderProps from 'recompose/toRenderProps'
import withState from 'recompose/withState'
import { Link } from 'react-router-dom'
import {compose} from 'react-apollo'

// Materia UI

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Menu from '@material-ui/core/Menu'
import MenuItem from '@material-ui/core/MenuItem'

// Images
import GithubLogo from '../img/github-head-negative.png'
import EmailIcon from '../img/email.png'
import ProfileIcon from '@material-ui/icons/Person'
import LogoutIcon from '@material-ui/icons/DirectionsWalk'

const UserLink = props => <Link to='/user' {...props} />
const LogoutLink = props => <Link to='/logout' {...props} />

const WithState = toRenderProps(withState('anchorEl', 'updateAnchorEl', null))

const styles = {
  img: {
    margin: 20,
    display: 'block',
    maxWidth: 15,
    maxHeight: 15
  }
}

class LoggedInUserMenu extends Component {

  constructor (props) {
    super(props)
    this.state = {
      user: {}
    }
  }

  displayIdentityProvider () {
    const { classes } = this.props
    switch (this.props.identityProvider) {
      case 'github':
        return (
          <img className={classes.img} src={GithubLogo} alt='Github' />
        )
        break
      case 'auth0':
        return (
          <img className={classes.img} src={EmailIcon} alt='Auth0' />
        )
        break
      default:

    }
  }

  render () {
    const { classes } = this.props
    return (
      <WithState>
        {({ anchorEl, updateAnchorEl }) => {
          const open = Boolean(anchorEl)
          const handleClose = () => {
            updateAnchorEl(null)
          }

          return (
            <React.Fragment>
              <Button
                aria-owns={open ? 'render-props-menu' : null}
                aria-haspopup='true'
                onClick={event => {
                  updateAnchorEl(event.currentTarget)
                }}
                color='inherit'
              >
                {this.displayIdentityProvider()}
                {this.props.menuLabel}
              </Button>
              <Menu id='render-props-menu' anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={handleClose} component={UserLink}><ProfileIcon /><div>Profile</div></MenuItem>
                <MenuItem onClick={handleClose} component={LogoutLink}><LogoutIcon /><div>Logout</div></MenuItem>
              </Menu>
            </React.Fragment>
          )
        }}
      </WithState>
    )
  }
}

export default compose(
  withStyles(styles)
)(LoggedInUserMenu)
