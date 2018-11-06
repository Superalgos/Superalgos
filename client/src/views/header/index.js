import React, { Component } from 'react'
import PropTypes from 'prop-types'
import jwtDecode from 'jwt-decode'

import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import classNames from 'classnames'

// icons
import HomeIcon from '@material-ui/icons/Home'
import ExitIcon from '@material-ui/icons/ExitToApp'

import { Link } from 'react-router-dom'

import { getItem } from '../../utils/local-storage'

// components
import { LoggedIn } from './LoggedIn'
import { LoggedOut } from './LoggedOut'

// menues
import {UsersMenu} from '@advancedalgos/users-client'

import AALogo from '../../assets/advanced-algos/aa-logo-dark.svg'

const ChartsLink = props => <Link to='/charts' {...props} />
const UsersLink = props => <Link to='/users' {...props} />
const TeamsLink = props => <Link to='/teams' {...props} />
const EventsLink = props => <Link to='/events' {...props} />
const KeyVaultLink = props => <Link to='/key-vault' {...props} />
const HomeLink = props => <Link to='/' {...props} />

const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  root: {
    flexGrow: 1
  },
  colorDefault: {
    color: '#000'
  },
  flex: {
    flexGrow: 1
  },
  toolbarTitle: {
    flex: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  appBar: {
    position: 'relative'
  },
  img: {
    display: 'block',
    maxWidth: 240,
    maxHeight: 48
  },
  externalLink: {
    textDecoration: 'none'
  }
})

class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null,
      open: false
    }
  }

  async componentDidMount () {
    const user = window.localStorage.getItem('user')
    this.setState({ user })
    frontManualStart()  // This call is necesary to start the jQuery based scripts that deals with the Responsive Header.
  }

  render () {
    let { classes, auth } = this.props
    if (window.localStorage.getItem('access_token')) {
      if (jwtDecode(window.localStorage.getItem('access_token')).exp < new Date().getTime() / 1000) {
        window.localStorage.clear()
        window.location.reload()
      }
    }
    let user = JSON.parse(this.state.user)
    return (
      <React.Fragment>
        <div className={classes.root}>

          <AppBar
            position='static'
            classes={{ root: classes.appBar, colorDefault: classes.colorDefault }}
      >

            <header id='header' className='light_section'>
              <div className='container'>
                <div className='row'>
                  <div className='col-sm-12 topWrap styleShaded'>
                    <div className='logo logo_left with_text'>
                      <a href='https://www.advancedalgos.net/index.shtml' className='navbar-brand'><img src='https://www.advancedalgos.net/img/logos/advanced-algos/aa-logo-dark.svg' alt='Advanced Algos Logo' className='logo_main' /></a>
                    </div>
                    <a href='#' className='openResponsiveMenu'>Menu</a>
                    <nav id='mainmenu_wrapper' className='menuTopWrap topMenuStyleLine'>
                      <ul id='mainmenu' className='nav sf-menu inited '>
                        <li>
                          <Button component={HomeLink} color='inherit'>
                              Home
                            </Button>
                        </li>
                        <li>
                          <Button component={ChartsLink} color='inherit'>
                              Charts
                            </Button>
                        </li>
                        <li className='menu-item-has-children'>
                          <Button component={UsersLink} color='inherit'>
                              Users
                            </Button>
                          <UsersMenu />
                        </li>
                        <li className='menu-item-has-children'>
                          <Button component={TeamsLink} color='inherit'>
                              Teams
                            </Button>
                          <ul className='sub-menu'>
                            <li className='menu-item-has-children'>
                              <a href='developers-system-modules.shtml'>System Modules</a>
                              <ul>
                                <li>
                                  <a href='#'>Module A</a>
                                </li>
                                <li>
                                  <a href='#'>Module B</a>
                                </li>
                                <li className='menu-item-has-children'>
                                  <a href='#'>Module C</a>
                                  <ul>
                                    <li><a href='#'>Module C1</a></li>
                                    <li><a href='#'>Module C2</a></li>
                                    <li><a href='#'>Module C3</a></li>
                                  </ul>
                                </li>
                              </ul>
                            </li>
                            <li>
                              <a href='developers-breed-compete.shtml'>Breed &amp; Compete</a>
                            </li>
                            <li>
                              <a href='documentation-quick-start.shtml'>Documentation</a>
                            </li>
                          </ul>

                        </li>
                        <li className='menu-item-has-children'>
                          <Button component={EventsLink} color='inherit'>
                            Events
                          </Button>
                          <ul className='sub-menu'>
                            <li>
                              <a href='https://www.advancedalgos.net/competition.shtml' className='sf-with-ul'>The <span className='red_text'>ALGO</span> Arena</a>
                            </li>
                            <li className='menu-item-has-children'>
                              <a href='#'>Current Events</a>
                              <ul className='sub-menu'>
                                <li>
                                  <a href='https://www.advancedalgos.net/competition-bitcoin-argentina-fb-group.shtml' className='sf-with-ul'>Bitcoin Argentina</a>
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                        <li className='menu-item-has-children'>
                          <Button component={KeyVaultLink} color='inherit'>
                            Key Vault
                          </Button>
                          <ul className='sub-menu'>
                            <li>
                              <a href='https://www.advancedalgos.net/competition.shtml' className='sf-with-ul'>The <span className='red_text'>ALGO</span> Arena</a>
                            </li>
                            <li className='menu-item-has-children'>
                              <a href='#'>Current Events</a>
                              <ul className='sub-menu'>
                                <li>
                                  <a href='https://www.advancedalgos.net/competition-bitcoin-argentina-fb-group.shtml' className='sf-with-ul'>Bitcoin Argentina</a>
                                </li>
                              </ul>
                            </li>
                          </ul>
                        </li>
                        <li>
                          <Button
                            href='https://www.advancedalgos.net/documentation-quick-start.shtml'
                            color='inherit'
                              >
                              Docs
                              </Button>
                        </li>
                        <li>
                          {this.state.user !== undefined && this.state.user !== null ? (
                            <React.Fragment>
                              <LoggedIn user={user} auth={auth} styles={styles} />
                            </React.Fragment>
                            ) : (
                              <LoggedOut auth={auth} styles={styles} />
                            )}
                        </li>
                      </ul>
                    </nav>
                  </div>
                </div>
              </div>
            </header>

          </AppBar>

        </div>
      </React.Fragment>

    )
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
}

export default withStyles(styles)(Header)
