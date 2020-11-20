import React from 'react'
import UserTabs from './UserTabs'
import BannerTopBar from './BannerTopBar'

const User = () => {
  return (
    <React.Fragment>
      <BannerTopBar
        size='medium'
        title='Your Profile'
        text='Manage your profile info, pictures and more.'
        backgroundUrl='https://superalgos.org/img/photos/users.jpg'
      />
      <UserTabs />
    </React.Fragment>
  )
}

export default User
