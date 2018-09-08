import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

// icons
import MenuIcon from '@material-ui/icons/Menu';
import HomeIcon from '@material-ui/icons/Home';
import BrowseIcon from '@material-ui/icons/ImportContacts';
import SearchIcon from '@material-ui/icons/Search';
import ContactIcon from '@material-ui/icons/ContactMail';
import AboutIcon from '@material-ui/icons/FormatShapes';
import ModulesIcon from '@material-ui/icons/QueuePlayNext';

import { Link } from 'react-router-dom';

// components
import LoggedInUser from './LoggedInUser';

const AboutLink = props => <Link to="/about" {...props} />
const ContactLink = props => <Link to="/contact" {...props} />
const SearchLink = props => <Link to="/search" {...props} />
const BrowseLink = props => <Link to="/browse" {...props} />
const HomeLink = props => <Link to="/" {...props} />

const styles = {
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
};

class NavBar extends Component {

  constructor(props){
    super(props);
    this.state = {
      authId: null
    }
  }

  componentDidMount() {
    /*
    this._asyncRequest = window.localStorage.getItem('user').then(
      response => {
        this._asyncRequest = null;
        let user = JSON.parse(response)
        if (user) {
          const authId = user.sub;
          this.setState({ authId: authId });
        }
      }
    );
    */
    const userStored = localStorage.getItem('user');
    console.log(userStored);

    if (userStored !== null && userStored !== undefined && userStored !== 'undefined') {
      const user = JSON.parse(userStored);
      const authId = user.sub;
      this.setState({ authId: authId });
    }
  }
  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="title" color="inherit" className={classes.flex}>
              Users Module
            </Typography>

            <IconButton className={classes.menuButton} color="inherit" title="Home" component={HomeLink}><HomeIcon /></IconButton>
            <IconButton className={classes.menuButton} color="inherit" title="Browse the Users Directory" component={BrowseLink}><BrowseIcon /></IconButton>
            <IconButton className={classes.menuButton} color="inherit" title="Search Users" component={SearchLink}><SearchIcon /></IconButton>
            <IconButton className={classes.menuButton} color="inherit" title="Contact Form" component={ContactLink}><ContactIcon /></IconButton>
            <IconButton className={classes.menuButton} color="inherit" title="About this Module" component={AboutLink}><AboutIcon /></IconButton>
            <IconButton className={classes.menuButton} color="inherit" title="Go to another Module" component={AboutLink}><ModulesIcon /></IconButton>

            <LoggedInUser authId={this.state.authId}/>
          </Toolbar>
        </AppBar>
      </div>
    );
  }
}

NavBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(NavBar);
