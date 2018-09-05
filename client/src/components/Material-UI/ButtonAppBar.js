import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';

import { NavLink, withRouter } from 'react-router-dom'

import { Link } from 'react-router-dom';

const AboutLink = props => <Link to="/about" {...props} />
const ContactLink = props => <Link to="/contact" {...props} />
const SearchLink = props => <Link to="/search" {...props} />
const BrowseLink = props => <Link to="/browse" {...props} />
const ProfileLink = props => <Link to="/profile" {...props} />
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

function ButtonAppBar(props) {
  const { classes } = props;
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
          <Button color="inherit" component={HomeLink}>Home</Button>
          <Button color="inherit" component={ProfileLink}>Profile</Button>
          <Button color="inherit" component={BrowseLink}>Browse</Button>
          <Button color="inherit" component={SearchLink}>Search</Button>
          <Button color="inherit" component={ContactLink}>Contact</Button>
          <Button color="inherit" component={AboutLink}>About</Button>
        </Toolbar>
      </AppBar>
    </div>
  );
}

ButtonAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ButtonAppBar);
