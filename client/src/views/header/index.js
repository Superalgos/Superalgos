import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'

// icons
import HomeIcon from '@material-ui/icons/Home'
import DashboardIcon from '@material-ui/icons/Dashboard'

import { Link } from 'react-router-dom'

import { getItem } from '../../utils/local-storage'

// components
import { LoggedIn } from './LoggedIn'
import { LoggedOut } from './LoggedOut'

import AALogo from '../../assets/advanced-algos/aa-logo-dark.svg'

const AboutLink = props => <Link to='/about' {...props} />
const TeamsLink = props => <Link to='/teams' {...props} />
const UsersLink = props => <Link to='/users' {...props} />
const KeyVaultLink = props => <Link to='/keys' {...props} />
const DashboardLink = props => <Link to='/dashboard' {...props} />
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
    margin: 20,
    display: 'block',
    maxWidth: 240,
    maxHeight: 48
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
    const user = await getItem('user')
    console.log('NavBar CDM: ', user, this.state)
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
            <Button component={TeamsLink} color='inherit'>
              Teams
            </Button>
            <Button component={UsersLink} color='inherit'>
              Users
            </Button>
            <Button component={KeyVaultLink} color='inherit'>
              API Keys
            </Button>
            <Button component={AboutLink} color='inherit'>
              About
            </Button>

            {this.state.user !== undefined && this.state.user !== null ? (
              <React.Fragment>
                <IconButton
                  className={classes.menuButton}
                  color='inherit'
                  title='Dashboard'
                  component={DashboardLink}
                >
                  <DashboardIcon />
                </IconButton>
                <LoggedIn user={user} auth={auth} styles={styles} />
              </React.Fragment>
            ) : (
              <LoggedOut auth={auth} styles={styles} />
            )}
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
