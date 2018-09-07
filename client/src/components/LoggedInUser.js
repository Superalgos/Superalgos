import React, { Component } from 'react';
import {graphql} from 'react-apollo';
import {getUserByAuthIdQuery} from '../queries/queries';
import {auth} from '../App';

class LoggedInUser extends Component {

  displayLoggedInUser(){

    const user = this.props.data.userByAuthId;


    console.log(this.props);
    console.log(this.props.data);
    console.log(this.props.data.userByAuthId);

    if(user){
      if (user.firstName) {
        return(
            <div>
                <p>{ user.firstName }</p>
            </div>
        );
      } else {
        return(
            <div>
                <p>{ user.alias }</p>
            </div>
        );
      }

    } else {
      console.log(auth);
        return( <div onClick={() => auth.login()}>Login / Sign up</div> );
    }
  }

  render() {

    return (
      <div>
        {this.displayLoggedInUser()}
      </div>
    );
  }
}

export default graphql(getUserByAuthIdQuery, { // What follows is the way to pass a parameter to a query.
  options: (props) => {
    return {
      variables: {
        authId: props.authId
      }
    }
  }
})(LoggedInUser); // This binds the querty to the component
