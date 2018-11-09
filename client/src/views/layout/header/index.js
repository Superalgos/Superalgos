import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import jwtDecode from 'jwt-decode'
import withWidth from '@material-ui/core/withWidth'

// components
import { LoggedIn } from './LoggedIn'

import allMenus from './imports'
import AALogo from '../../../assets/advanced-algos/aa-logo-dark.svg'

class Header extends Component {
  constructor (props) {
    super(props)
    this.state = {
      onTop: true,
      mobileOpen: false,
      openedMenu: null,
      user: null
    }
  }

  handleScroll () {
    if (window.pageYOffset > 0) {
      this.setState({ onTop: false })
    } else {
      this.setState({ onTop: true })
    }
  }

  toggleMobileOpen () {
    this.setState({ mobileOpen: !this.state.mobileOpen })
  }

  toggleMenuOpen (index, allowed) {
    if (allowed) {
      if (this.state.openedMenu === index) {
        this.setState({ openedMenu: null })
      } else {
        this.setState({ openedMenu: index })
      }
    }
  }

  mouseLeave (allowed) {
    if (allowed) {
      this.setState({ openedMenu: null })
    }
  }

  closeAll () {
    this.setState({ openedMenu: null, mobileOpen: false })
  }

  componentDidMount () {
    window.addEventListener('scroll', () => this.handleScroll())
    const user = window.localStorage.getItem('user')
    this.setState({ user })
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', () => this.handleScroll())
  }

  render () {
    const bigScreen = (this.props.width === 'lg' || this.props.width === 'xl')
    let { auth } = this.props
    let { onTop, mobileOpen, openedMenu } = this.state
    if (window.localStorage.getItem('access_token')) {
      if (jwtDecode(window.localStorage.getItem('access_token')).exp < new Date().getTime() / 1000) {
        window.localStorage.clear()
        window.location.reload()
      }
    }
    let user = JSON.parse(this.state.user)

    const menus = allMenus.map(({ to, title, submenus, authenticated }, index) => {
      if (authenticated && !(this.state.user !== undefined && this.state.user !== null)) {
        return
      }
      return (
        <li
          onMouseEnter={() => this.toggleMenuOpen(index, bigScreen)}
          onMouseLeave={() => this.mouseLeave(bigScreen)}
          key={index}
          className={openedMenu === index ? 'primaryLink hasChildren selected' : 'primaryLink hasChildren'}
        >
          <Link to={to} onClick={() => this.toggleMenuOpen(index, true)}> {title} </Link>
          <ul className='subMenu'>
            {
              submenus.map(({ icon: Icon, to: subTo, title: subTitle, externalLink, authenticated: subAuthenticated }, subindex) => {
                if (subAuthenticated && !(this.state.user !== undefined && this.state.user !== null)) {
                  return
                }
                if (externalLink) {
                  return (
                    <li key={subindex}><a href={subTo}> <Icon /> {subTitle} </a></li>
                  )
                }
                return (
                  <li key={subindex}><Link to={subTo} onClick={() => this.closeAll(index)}> <Icon /> {subTitle} </Link></li>
                )
              })}
          </ul>
        </li>
      )
    })

    return (
      <header className={onTop ? 'menu' : 'menu notOnTop'}>
        <div className='container'>
          <Link to='/'> <img className='logo' src={AALogo} alt='Advanced Algos' /> </Link>
          <div className={mobileOpen ? 'mobileHandle openedMobile' : 'mobileHandle'} onClick={() => this.toggleMobileOpen()}>
            Menu
          </div>
          <nav className={mobileOpen ? 'links openedMobile' : 'links'}>
            <ul className='primaryMenu'>
              <li className='primaryLink'>
                <Link to='/charts'> Charts </Link>
              </li>
              {menus}
              <li className='primaryLink'>
                <a href='https://www.advancedalgos.net/documentation-quick-start.shtml'> Docs </a>
              </li>
              {this.state.user !== undefined && this.state.user !== null ? (
                <LoggedIn
                  user={user}
                  auth={auth}
                  bigScreen={bigScreen}
                  openedMenu={openedMenu}
                  toggleMenuOpen={(keyValue, allowedValue) => this.toggleMenuOpen(keyValue, allowedValue)}
                  mouseLeave={(allowedValue) => this.mouseLeave(allowedValue)}
                  closeAll={() => this.closeAll()}
                />
              ) : (

                <li className='primaryLink'>
                  <a href='#' onClick={() => auth.login()}> Login / Sign Up </a>
                </li>
              )}
            </ul>
          </nav>
        </div>
      </header>
    )
  }
}

Header.propTypes = {
  auth: PropTypes.object.isRequired
}

export default withWidth()(Header)
