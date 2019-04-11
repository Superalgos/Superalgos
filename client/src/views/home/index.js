import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { BannerTopBar } from '../common'
import { Typography } from '@material-ui/core'

class Home extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null
    }
  }
  componentDidMount () {
    const user = window.localStorage.getItem('user')
    this.setState({ user })
  }
  render () {
    let user = JSON.parse(this.state.user)
    if(this.state.user !== undefined && this.state.user !== null){}
    return (
      <React.Fragment>
        {this.state.user !== undefined && this.state.user !== null && (
          <BannerTopBar
            size='big'
            title='Superalgos Platform Demo'
            text='Get Started Using the Demo'
            backgroundUrl='https://superalgos.org/img/photos/superalgos-platform.jpg'
          >
            <div className='instructions'>
              <Typography align='center' variant='subtitle1' >1. <Link to='/teams/manage-teams'>Create a Team and Financial Being →</Link></Typography>
              <Typography align='center' variant='subtitle1' >2. <Link to='/strategizer'>Visit the Strategizer and learn how to build a strategy →</Link></Typography>
              <Typography align='center' variant='subtitle1' >3. <Link to='/clones/add'>Run a clone instance of your simulator algobot to test the strategy →</Link></Typography>
              <Typography align='center' variant='subtitle1' >4. <Link to='/charts'>View the results of your strategy in the charts →</Link></Typography>
            </div>
          </BannerTopBar>
        )}
        {(this.state.user === undefined || this.state.user === null) && (
          <BannerTopBar
            size='big'
            title='Superalgos Platform Demo'
            text='People and machines working together to create Superalgos'
            backgroundUrl='https://superalgos.org/img/photos/superalgos-platform.jpg'
          />
        )}
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
              Feel free to explore the menu in the top-right corner or visit the <a href='https://superalgos.org/documentation-quick-start.shtml' target='_blank'>Quick Start Guide</a>.
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
