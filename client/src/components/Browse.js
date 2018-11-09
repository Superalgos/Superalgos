import React, { Component } from 'react'
import UserList from './UserList'
import TopBar from './TopBar'

class Browse extends Component {

  render () {
    return (
      <React.Fragment>
        <TopBar size='medium' title='Users Directory' text='Everyone involved in Advanced Algos is here.' />
        <UserList />
      </React.Fragment>
    )
  }
}

export default Browse
