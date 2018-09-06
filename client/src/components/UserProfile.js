import React, { Component } from 'react';
import {graphql} from 'react-apollo';
import {getUserProfileQuery} from '../queries/queries';

class UserProfile extends Component {

  displayUserProfile(){

    const {user} = this.props.data;

    if(user){
        return(
            <div>
                <h2>{ user.alias }</h2>
                <p>{ user.firstName }</p>
                <p>{ user.lastName }</p>
                <p>{ user.role.name }</p>
            </div>
        );
    } else {
        return( <div>No User selected...</div> );
    }
  }

  render() {

    return (
      <div>
        {this.displayUserProfile()}
      </div>
    );
  }
}

export default graphql(getUserProfileQuery, { // What follows is the way to pass a parameter to a query.
  options: (props) => {
    return {
      variables: {
        id: props.userId
      }
    }
  }
})(UserProfile); // This binds the querty to the component
