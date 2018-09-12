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

const AboutLink = props => <Link to='/about' {...props} />
const TeamsLink = props => <Link to='/teams' {...props} />
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
  }
})

class NavBar extends Component {
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
        <AppBar position='static' className={classes.appBar}>
          <Toolbar>
            <Typography
              variant='title'
              color='inherit'
              className={classes.toolbarTitle}
            >
              Teams Module
            </Typography>

            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Home'
              component={HomeLink}
            >
              <HomeIcon />
            </IconButton>
            <Button component={TeamsLink}>Teams</Button>
            <Button component={AboutLink}>About</Button>

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

NavBar.propTypes = {
  classes: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
}

export default withStyles(styles)(NavBar)
