import React, { Component } from 'react'
import BannerTopBar from '../BannerTopBar'
import { Typography } from '@material-ui/core'

class Home extends Component {
  render () {
    return (
      <React.Fragment>
        <BannerTopBar
          size='big'
          title='Advanced Algos Platform'
          text='Enabling the evolutionary race towards the emergence of superalgos'
          backgroundUrl='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg'
        />
        <div className='homePage'>
          <Typography variant='h1' align='center' className='title'>Welcome to the Advanced Algos Platform!</Typography>
          <Typography variant='h2' align='center' className='subtitle'>CO-CREATE >> COMPETE >> EVOLVE</Typography>
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
              Feel free to explore the menu in the top-right corner or visit the <a href='https://www.advancedalgos.net/documentation-quick-start.shtml' target='_blank'>Quick Start Guide</a>.
              Reporting of bugs at the corresponding <a href='https://github.com/AdvancedAlgos' target='_blank' rel='nofollow'>Advanced Algos Github repository</a> is highly appreciated.
            </Typography>
            <Typography align='justify'>
              Get in touch with the rest of the community and get answers to your questions in our <a href='https://t.me/advancedalgoscommunity' target='_blank' rel='nofollow'>Telegram Group</a>.
              Have fun!
            </Typography>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default Home
