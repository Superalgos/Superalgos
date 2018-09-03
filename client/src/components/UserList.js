import React, { Component } from 'react';
import {graphql} from 'react-apollo';
import {getUsersQuery} from '../queries/queries';

class UserList extends Component {
  displayUsers(){
    let data = this.props.data;

    if(data.loading){
      return ( <div> Loading Users... </div>);
    } else {
      return data.users.map(user => {
        return (
          <li key={user.id}>{user.alias}</li>
        )
      });
    }
  }
  render() {
    return (
      <div>
        <ul id='user-list'>
          {this.displayUsers()}
        </ul>
      </div>
    );
  }
}

export default graphql(getUsersQuery)(UserList); // This binds the querty to the component
