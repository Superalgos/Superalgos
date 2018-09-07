import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import toRenderProps from 'recompose/toRenderProps';
import withState from 'recompose/withState';
import { Link } from 'react-router-dom';

import ProfileIcon from '@material-ui/icons/Person';

const UserLink = props => <Link to="/user" {...props} />
const WithState = toRenderProps(withState('anchorEl', 'updateAnchorEl', null));

class LoggedInUserMenu extends Component {

  constructor(props){
    super(props);
    this.state = {
      property: 'value'
    }
  }

  render() {
    return (
      <WithState>
        {({ anchorEl, updateAnchorEl }) => {
          const open = Boolean(anchorEl);
          const handleClose = () => {
            updateAnchorEl(null);
          };

          return (
            <React.Fragment>
              <Button
                aria-owns={open ? 'render-props-menu' : null}
                aria-haspopup="true"
                onClick={event => {
                  updateAnchorEl(event.currentTarget);
                }}
                color="inherit"
              >
                {this.props.menuLabel}
              </Button>
              <Menu id="render-props-menu" anchorEl={anchorEl} open={open} onClose={handleClose}>
                <MenuItem onClick={handleClose} component={UserLink}><ProfileIcon /><div>Profile</div></MenuItem>
                <MenuItem onClick={handleClose}>Logout</MenuItem>
              </Menu>
            </React.Fragment>
          );
        }}
      </WithState>
    );
  }
}

export default LoggedInUserMenu;
