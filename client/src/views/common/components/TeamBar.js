import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'
import AppBar from '@material-ui/core/AppBar'
import Toolbar from '@material-ui/core/Toolbar'
import Typography from '@material-ui/core/Typography'
import IconButton from '@material-ui/core/IconButton'

// icons
import UsersIcon from '@material-ui/icons/People'
import BrowseIcon from '@material-ui/icons/ImportContacts'
import SearchIcon from '@material-ui/icons/Search'
import ContactIcon from '@material-ui/icons/ContactMail'
import AboutIcon from '@material-ui/icons/FormatShapes'

import { Link } from 'react-router-dom'

const AboutLink = props => <Link to='/about' {...props} />
const ContactLink = props => <Link to='/contact' {...props} />
const SearchLink = props => <Link to='/search' {...props} />
const BrowseLink = props => <Link to='/browse' {...props} />
const HomeLink = props => <Link to='/' {...props} />

const styles = {
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1,
    marginLeft: 30
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  }
}

class TeamBar extends Component {
  render () {
    const { classes, user } = this.props
    console.log('TeamBar: ', user)
    return (
      <div className={classes.root}>
        <AppBar position='static' color='secondary'>
          <Toolbar>
            <Typography variant='title' color='inherit' className={classes.flex}>
              Manage Teams
            </Typography>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Users Module Home'
              component={HomeLink}>
              <UsersIcon />
            </IconButton>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Browse the Teams'
              component={BrowseLink}>
              <BrowseIcon />
            </IconButton>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Search Users'
              component={SearchLink}>
              <SearchIcon />
            </IconButton>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='Contact Form'
              component={ContactLink}>
              <ContactIcon />
            </IconButton>
            <IconButton
              className={classes.menuButton}
              color='inherit'
              title='About the Users Module'
              component={AboutLink}>
              <AboutIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
      </div>
    )
  }
}

TeamBar.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object
}

export default withStyles(styles)(TeamBar)
