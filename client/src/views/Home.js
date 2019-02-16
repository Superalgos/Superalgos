import React, { Component } from 'react'
import { Typography } from '@material-ui/core'
import TopBar from './BannerTopBar'

class Home extends Component {

  render () {
    return (
      <React.Fragment>
        <TopBar
          size='big'
          title='Clones Module'
          text='Responsible for manage bot clones.'
          backgroundUrl='https://superalgos.org/img/photos/ecosystem.jpg'
        />

        <div className='homePage container'>
          <Typography variant='h1' align='center' className='title'>
            Welcome to the Clones Module!
          </Typography>
          <Typography variant='h2' align='center' className='subtitle'>
            Responsible for manage bot clones.
          </Typography>
          <div className='column'>
            <Typography align='justify'>
              The Clones module allows you to create instances of your bots
              that will be executed on a virtual machine.
            </Typography>
          </div>
          <div className='column'>
            <Typography align='justify' />
          </div>
        </div>

      </React.Fragment>
    )
  }
}

export default Home
