import React, { Component } from 'react'
import BannerTopBar from './BannerTopBar'

class Home extends Component {

  render () {
    return (
      <React.Fragment>
        <BannerTopBar
          size='big'
          title='Users Module'
          text='Responsible for all human users of the Advanced Algos Platform.'
          backgroundUrl='https://advancedalgos.net/img/photos/users.jpg'
        />
      </React.Fragment>
    )
  }
}

export default Home
