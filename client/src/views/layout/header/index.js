import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import jwtDecode from 'jwt-decode'
import withWidth from '@material-ui/core/withWidth'
import { NotListedLocation as TutorialIcon } from '@material-ui/icons'

// components
import { LoggedIn } from './LoggedIn'

import allMenus from './imports'
import AALogo from '../../../assets/superalgos/Superalgos-logo-horz-dark.svg'

class Header extends Component {
  constructor (props) {
    super(props)
    this.renderSubMenu = this.renderSubMenu.bind(this)
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

  scrollToTop () {
    document.body.scrollTop = 0 // For Safari
    document.documentElement.scrollTop = 0 // For Chrome, Firefox, IE and Opera
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
        window.localStorage.removeItem('access_token')
        window.localStorage.removeItem('user')
        window.localStorage.removeItem('name')
        window.location.reload()
      }
    }
    let user = JSON.parse(this.state.user)

    const menus = allMenus.map(({ icon: Icon, to, title, submenus, authenticated }, index) => {
      if (authenticated && !(this.state.user !== undefined && this.state.user !== null)) {
        return
      }
      let cssChildren = submenus.length === 0 ? null : 'hasChildren'
      return (
        <li
          onMouseEnter={() => this.toggleMenuOpen(index, bigScreen)}
          onMouseLeave={() => this.mouseLeave(bigScreen)}
          key={index}
          className={openedMenu === index ? `primaryLink ${cssChildren} selected` : `primaryLink ${cssChildren}`}
        >
          { bigScreen
            ? <Link to={to} onClick={() => this.toggleMenuOpen(index, true)}> {title} </Link>
            : <a onClick={() => this.toggleMenuOpen(index, true)}> {title} </a>
          }
          {this.renderSubMenu(Icon, to, title, submenus, authenticated, index, bigScreen)}
        </li>
      )
    })

    return (
      <React.Fragment>
        <header className={onTop ? 'menu' : 'menu notOnTop'}>
          <div className='container'>
            <Link to='/'> <img className='logo' src={AALogo} alt='Superalgos' /> </Link>
            <div className={mobileOpen ? 'mobileHandle openedMobile' : 'mobileHandle'} onClick={() => this.toggleMobileOpen()}>
              Menu
            </div>
            <nav className={mobileOpen ? 'links openedMobile' : 'links'}>
              <ul className='primaryMenu'>
                <li className='primaryLink'>
                  <Link to='/charts'> Charts </Link>
                </li>
                {menus}
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
                  <React.Fragment>
                    <li className='primaryLink'>
                      <a href='https://www.superalgos.org/documentation-quick-start.shtml'> Docs </a>
                    </li>
                    <li className='primaryLink'>
                      <a href='#' onClick={() => auth.login()}> Login / Sign Up </a>
                    </li>
                  </React.Fragment>
                )}
              </ul>
            </nav>
          </div>
        </header>
        {onTop ? '' : <div className='toTop' onClick={() => { this.scrollToTop() }} />}
      </React.Fragment>
    )
  }

  renderSubMenu (Icon, to, title, submenus, authenticated, index, bigScreen) {
    return submenus.length === 0 ? null : (
      <ul className='subMenu'>
        { bigScreen
          ? ''
          : <li key={index + 'home'}><Link to={to}> <Icon /> Module Home Page </Link></li>
        }
        { submenus.length > 0 &&
          submenus.map(({ icon: SubIcon, to: subTo, title: subTitle, externalLink, authenticated: subAuthenticated }, subindex) => {
            if (subAuthenticated && !(this.state.user !== undefined && this.state.user !== null)) {
              return
            }
            if (externalLink) {
              return (
                <li key={subindex}><a href={subTo} target='_blank'> <SubIcon /> {subTitle} </a></li>
              )
            }
            return (
              <li key={subindex}><Link to={subTo} onClick={() => this.closeAll(index)}> <SubIcon /> {subTitle} </Link></li>
            )
          })}
      </ul>
    )
  }
}

Header.propTypes = {
  auth: PropTypes.object.isRequired
}

export default withWidth()(Header)
