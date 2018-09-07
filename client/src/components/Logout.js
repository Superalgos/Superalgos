import React, { Component } from 'react';
import {Redirect} from 'react-router';

class Logout extends Component {
  render() {
    window.localStorage.removeItem("user");

    return <Redirect to='/' />
  }
}

export default Logout
