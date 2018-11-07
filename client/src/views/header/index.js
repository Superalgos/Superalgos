import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import withWidth from '@material-ui/core/withWidth'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'

// icons
import HomeIcon from '@material-ui/icons/Home'
import ExitIcon from '@material-ui/icons/ExitToApp'
import MenuIcon from '@material-ui/icons/Menu'

import { Link } from 'react-router-dom'

// components
import { LoggedIn } from './LoggedIn'
import { LoggedOut } from './LoggedOut'

import allMenus from './imports'
import AALogo from '../../assets/advanced-algos/aa-logo-dark.svg'

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
  },
  dropdownContent: {
    display: 'none',
    position: 'absolute',
    backgroundColor: '#f1f1f1',
    minWidth: '160px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    zIndex: 1
  },
  dropdownContentShown: {
    display: 'block',
    position: 'absolute',
    backgroundColor: '#f1f1f1',
    minWidth: '160px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    zIndex: 1
  },
  dropdownButtons: {
    display: 'block'
  },
  mobileMenu: {
    color: theme.palette.common.white,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.common.white}`,
    background: 'none'
  }
})

class Header extends Component {
  constructor (props) {
    super(props)
    this.toggleMenu = this.toggleMenu.bind(this)
    this.state = {
      user: null,
      open: null,
      mobileOpen: false
    }
  }

  async componentDidMount () {
    const user = window.localStorage.getItem('user')
    this.setState({ user })
  }

  render () {
    let { classes, auth, width } = this.props
    let { open } = this.state

    let user = JSON.parse(this.state.user)

    const menus = allMenus.map((menu, index) => {
      return (
        <div className='dropdown'
          onMouseEnter={() => this.setState({ open: index })}
          onMouseLeave={() => this.setState({ open: null })}
        >
          <Button component={Link} to={menu.to} color='inherit'>
            {menu.title}
          </Button>
          <div className={open === index ? classes.dropdownContentShown : classes.dropdownContent} >
            {
              menu.submenus.map((submenu, subindex) => {
                // const Icon = submenu.icon
                return (
                  <Button key={subindex} component={Link} to={submenu.to} className={classes.dropdownButtons}>{submenu.title}</Button>
                )
              })}
          </div>
        </div>
      )
    })

    const mobileMenusButton = (
      <Button onClick={() => this.toggleMenu} className={classes.mobileMenu} variant='extendedFab' >
        <MenuIcon /> MENU
      </Button>
    )

    const mobileMenus = allMenus.map((menu, index) => {
      return (
        <div className='dropdown'
          onMouseEnter={() => this.setState({ open: index })}
          onMouseLeave={() => this.setState({ open: null })}
        >
          <Button component={Link} to={menu.to} color='inherit'>
            Mobile {menu.title}
          </Button>
          <div className={open === index ? classes.dropdownContentShown : classes.dropdownContent} >
            {
              menu.submenus.map((submenu, index) => {
                // const Icon = submenu.icon
                return (
                  <Button component={Link} to={submenu.to} className={classes.dropdownButtons}>{submenu.title}</Button>
                )
              })}
          </div>
        </div>
      )
    })

    return (
      <div className={classes.root}>
        <AppBar
          position='static'
          classes={{ root: classes.appBar, colorDefault: classes.colorDefault }}
        >
          <Toolbar>
            <img className={classes.img} src={AALogo} alt='Advanced Algos' />
            <Typography
              variant='h6'
              color='inherit'
              className={classes.toolbarTitle}
            >
              &nbsp;
            </Typography>
            {(width !== 'xs' && width !== 'sm') &&
              <React.Fragment>
                <IconButton
                  className={classes.menuButton}
                  color='inherit'
                  title='Home'
                  component={Link}
                  to='/'
                >
                  <HomeIcon />
                </IconButton>

                <Button component={Link} to='/charts' color='inherit'>
                  Charts
                </Button>

                <Button
                  href='https://www.advancedalgos.net/documentation-quick-start.shtml'
                  color='inherit'
                  target='_blank'
                >
                Docs
                </Button>

                {this.state.user !== undefined && this.state.user !== null ? (
                  <React.Fragment>
                    <LoggedIn user={user} auth={auth} styles={styles} />
                  </React.Fragment>
                ) : (
                  <LoggedOut auth={auth} styles={styles} />
                )}

                <IconButton
                  className={classes.menuButton}
                  color='inherit'
                  title='Exit'
                  href='http://www.advancedalgos.net/'
                >
                  <ExitIcon />
                </IconButton>
              </React.Fragment>
            }
            { (width === 'xs' || width === 'sm') ? mobileMenusButton : menus }
            { (width === 'xs' || width === 'sm') && this.state.mobileOpen ? mobileMenus : '' }
          </Toolbar>
        </AppBar>
      </div>
    )
  }

  toggleMenu () {
    this.setState({ mobileOpen: !this.state.mobileOpen })
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired,
  width: PropTypes.string
}

const HeaderWithStyles = withStyles(styles)(Header)

export default withWidth()(HeaderWithStyles)
