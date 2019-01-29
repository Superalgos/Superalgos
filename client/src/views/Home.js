import React, { Component } from 'react'
import { Typography } from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'
import TopBar from './BannerTopBar'

class Home extends Component {

  render () {
    return (
      <React.Fragment>
        <TopBar
          size='big'
          title='Operations Module'
          text='Responsible for manage bot clones.'
          backgroundUrl='https://superalgos.org/img/photos/ecosystem.jpg'
        />

        <div className='homePage container'>
          <Typography variant='h1' align='center' className='title'>
            Welcome to the Operations Module!
          </Typography>
          <Typography variant='h2' align='center' className='subtitle'>
            Responsible for manage bot clones.
          </Typography>
          <div className='column'>
            <Typography align='justify'>
              The Operations module allows you to create copies of your bot
              that will be executed on a virtual machine.
            </Typography>
          </div>
          <div className='column'>
            <Typography align='justify'>
              
            </Typography>
          </div>
        </div>

      </React.Fragment>
    )
  }
}

export default Home
