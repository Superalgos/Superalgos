import React, { Component } from 'react'
import { BannerTopBar } from '../common'
import { Typography } from '@material-ui/core'

class Home extends Component {
  render () {
    return (
      <React.Fragment>
        <BannerTopBar
          size='big'
          title='Superalgos Platform'
          text='People and machines working together to create Superalgos'
          backgroundUrl='https://superalgos.org/img/photos/superalgos-platform.jpg'
        />
        <div className='homePage container'>
          <Typography variant='h1' align='center' className='title'>Welcome to the Superalgos Platform!</Typography>
          <Typography variant='h2' align='center' className='subtitle'>Enabling the evolutionary race towards the emergence of superalgos</Typography>
          <div className='column'>
            <Typography align='justify'>
              Before you begin, please be aware <strong>this is a development environment in pre-alpha stage</strong>.
              The features available as of today are limited but already functional.
              However, you may encounter occasional instability and errors.
            </Typography>
            <Typography align='justify'>
            The Superalgos Platform is the place is which we meet to collaborate in the quest to make trading algorithms evolve.
            You will be able to register, create or join a team, fork a functional trading bot and eventually put it to compete with other people's forks.
            </Typography>
          </div>
          <div className='column'>
            <Typography align='justify'>
              Feel free to explore the menu in the top-right corner or visit the <a href='https://www.superalgos.org/documentation-quick-start.shtml' target='_blank'>Quick Start Guide</a>.
              Reporting of bugs at the corresponding <a href='https://github.com/Superalgos' target='_blank' rel='nofollow'>Superalgos Github repository</a> is highly appreciated.
            </Typography>
            <Typography align='justify'>
              Get in touch with the rest of the community and get answers to your questions in our <a href='https://t.me/superalgoscommunity' target='_blank' rel='nofollow'>Telegram Group</a>.
              Have fun!
            </Typography>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default Home
