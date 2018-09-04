import React from 'react'

import UserList from './UserList';
import AddUser from './AddUser';

const Profile = () => {
  return (
    <div id="main">
      <UserList/>
      <AddUser/>
    </div>
  )
}

export default Profile
