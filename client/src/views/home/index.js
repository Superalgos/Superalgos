import React, { Component } from 'react'
import BannerTopBar from '../BannerTopBar'

class Home extends Component {
  render () {
    return (
      <BannerTopBar
        size='big'
        title='Advanced Algos Platform'
        text='Enabling the evolutionary race towards the emergence of superalgos'
        backgroundUrl='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg'
      />
    )
  }
}

export default Home
