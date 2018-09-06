import React, { Component } from 'react';
import {graphql} from 'react-apollo';
import {getUserByAuthIdQuery} from '../queries/queries';

class LoggedInUser extends Component {

  displayLoggedInUser(){

    const user = this.props.data.userByAuthId;
    console.log(this.props);
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
        return( <div>Login / Sign up</div> );
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
        id: props.authId
      }
    }
  }
})(LoggedInUser); // This binds the querty to the component
