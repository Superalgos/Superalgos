import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import jwtDecode from 'jwt-decode'

// icons
import ExitIcon from '@material-ui/icons/ExitToApp'

// styles
import './styles.scss'

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

  componentDidMount () {
    window.addEventListener('scroll', () => this.handleScroll())
    const user = window.localStorage.getItem('user')
    this.setState({ user })
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', () => this.handleScroll())
  }

  render () {
    let { auth } = this.props
    let { onTop, mobileOpen } = this.state

    if (window.localStorage.getItem('access_token')) {
      if (jwtDecode(window.localStorage.getItem('access_token')).exp < new Date().getTime() / 1000) {
        window.localStorage.clear()
        window.location.reload()
      }
    }
    let user = JSON.parse(this.state.user)

    const menus = allMenus.map(({ to, title, submenus }, index) => {
      return (
        <li key={index} className='primaryLink hasChildren'>
          <Link to={to}> {title} </Link>
          <ul className='subMenu'>
            {
              submenus.map(({ icon: Icon, to: subTo, title: subTitle }, subindex) => {
                return (
                  <li key={subindex}><Link to={subTo}> <Icon /> {subTitle} </Link></li>
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
          <nav className='links'>
            <ul className='primaryMenu'>
              <li className='primaryLink'>
                <Link to='/'> Charts </Link>
              </li>
              {menus}
              <li className='primaryLink'>
                <a href='https://www.advancedalgos.net/documentation-quick-start.shtml'> Docs </a>
              </li>
              {this.state.user !== undefined && this.state.user !== null ? (
                <LoggedIn user={user} auth={auth} />
              ) : (

                <li className='primaryLink'>
                  <a href='#' onClick={() => auth.login()}> Login / Sign Up </a>
                </li>
              )}
              <li className='primaryLink'>
                <a href='https://www.advancedalgos.net'> <ExitIcon /> </a>
              </li>
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

export default Header
