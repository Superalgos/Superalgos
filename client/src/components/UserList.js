import React, { Component } from 'react';
import {graphql} from 'react-apollo';
import {getUsersQuery} from '../queries/queries';

// components
import UserProfile from './UserProfile';

class UserList extends Component {
  constructor(props){
    super(props);
    this.state = {
      selected: null
    }
  }
  displayUsers(){
    let data = this.props.data;

    if(data.loading){
      return ( <div> Loading Users... </div>);
    } else {
      return data.users.map(user => {
        return (
          <li key={user.id} onClick={ (e) => {
            this.setState({ selected: user.id});
            }
          } >{user.alias}</li>
        )
      });
    }
  }
  render() {

    return (

      <div>
        <ul>
          {this.displayUsers()}
        </ul>
        <UserProfile userId={this.state.selected}/>
      </div>
    );
  }
}

export default graphql(getUsersQuery)(UserList); // This binds the querty to the component
