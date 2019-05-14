import React, { Component } from 'react'
import UserList from './UserList'
import BannerTopBar from './BannerTopBar'

class Browse extends Component {

  render () {
    return (
      <React.Fragment>
        <BannerTopBar
          size='medium'
          title='Users Directory'
          text='Everyone involved in Advanced Algos is here.'
          backgroundUrl='https://superalgos.org/img/photos/users.jpg'
        />
        <div className='container'>
          <UserList />
        </div>
      </React.Fragment>
    )
  }
}

export default Browse
