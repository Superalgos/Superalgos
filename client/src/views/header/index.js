import React, { Component } from 'react'
import PropTypes from 'prop-types'

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

import AALogo from '../../assets/advanced-algos/aa-logo-dark.svg'

const ChartsLink = props => <Link to='/charts' {...props} />
const UsersLink = props => <Link to='/users' {...props} />
const TeamsLink = props => <Link to='/teams' {...props} />
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
  }

  render () {
    let { classes, auth } = this.props

    let user = JSON.parse(this.state.user)
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

            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Home'
              component={HomeLink}
            >
              <HomeIcon />
            </IconButton>

            <Button component={ChartsLink} color='inherit'>
              Charts
            </Button>
            <Button component={UsersLink} color='inherit'>
              Users
            </Button>
            <Button component={TeamsLink} color='inherit'>
              Teams
            </Button>
            <Button component={KeyVaultLink} color='inherit'>
              Key Vault
            </Button>

            <Button
              href='https://www.advancedalgos.net/documentation-quick-start.shtml'
              color='inherit'
              target='_blank'
            >
            Documentation
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
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

Header.propTypes = {
  classes: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
}

export default withStyles(styles)(Header)
