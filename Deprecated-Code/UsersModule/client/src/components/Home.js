import React, { Component } from 'react'
import BannerTopBar from './BannerTopBar'
import { Typography } from '@material-ui/core'

class Home extends Component {

  render () {
    return (
      <React.Fragment>
        <BannerTopBar
          size='big'
          title='Users Module'
          text='Responsible for all human users of the Advanced Algos Platform.'
          backgroundUrl='https://superalgos.org/img/photos/users.jpg'
        />
        <div className='homePage container'>
          <Typography variant='h1' align='center' className='title'>Welcome to the Users Module!</Typography>
          <Typography variant='h2' align='center' className='subtitle'>The human component of the Advanced Algos Ecosystem.</Typography>
          <div className='column'>
            <Typography align='justify'>
              The Advanced Algos Ecosystem is made out of humans, financial beings and other entities such as teams.
            </Typography>
            <Typography align='justify'>
            Humans are either <strong>users</strong> or <strong>guests</strong>. If you haven’t signed up yet or you are logged off, then you are acting as a guest, with limited features. Please sign-up or log-in for a richer experience.
            </Typography>
          </div>
          <div className='column'>
            <Typography align='justify'>
              Users may have different roles, such as developer, trader, analyst, etc. Each of these roles usually have personalized features throughout the system.
            </Typography>
            <Typography align='justify'>
              The Users Module allows you to handle all of your details as a user of the system as well as finding other people in the ecosystem.
            </Typography>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default Home
