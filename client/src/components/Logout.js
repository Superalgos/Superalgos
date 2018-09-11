import React, { Component } from 'react';
import {Redirect} from 'react-router';
import {auth} from '../App';

class Logout extends Component {
  render() {
    //window.localStorage.removeItem("user");
    auth.logout();

    return <Redirect to='/' />
  }
}

export default Logout
