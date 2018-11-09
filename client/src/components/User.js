import React from 'react'
import UserTabs from './UserTabs'
import TopBar from './TopBar'

const User = () => {
  return (
    <React.Fragment>
      <TopBar size='medium' title='Your Profile' text='Manage your profile info, pictures and more.' />
      <UserTabs />
    </React.Fragment>
  )
}

export default User
