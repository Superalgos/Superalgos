import React, { Component } from 'react'
import { Typography } from '@material-ui/core'
import TopBar from './BannerTopBar'

class Home extends Component {

  render() {
    return (
      <React.Fragment>
        <TopBar
          size='big'
          title='Clones Module'
          text='Creating and managing bot clones'
          backgroundUrl='https://superalgos.org/img/photos/clones-original.jpg'
        />

        <div className='homePage container'>
          <Typography variant='h1' align='center' className='title'>
          Clones Module
          </Typography>
          <Typography variant='h2' align='center' className='subtitle'>
          Creating and managing bot clones
          </Typography>
          <div className='column'>
            <Typography align='justify'>
            The clones module allows creating and managing the execution of bot’s code.
            It also stores the metadata information of the clones and handles the interaction
            with the orchestration software.
            </Typography>
            <Typography align='justify'>
            It integrates with other system modules to enable secure and encapsulated execution of the
            bots. On the clone creation process the encapsulation is achieved by deploying a Clone Executor
            Image on a Kubernetes container.
            </Typography>
          </div>
          <div className='column'>
            <Typography align='justify'>
              Bots are executed using the common framework called Clone Executor which provides support for commonly used resources.
            </Typography>
            <Typography align='justify'>
              When creating a new clone, specific execution parameters are selected, for example the exchange and the time period that the bot will operate in.
            </Typography>
          </div>
        </div>

      </React.Fragment>
    )
  }
}

export default Home
