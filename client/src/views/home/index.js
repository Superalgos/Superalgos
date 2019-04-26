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
          <Typography variant='h2' align='center' className='subtitle'>TRY OUT THE STRATEGIZER DEMO</Typography>
          <div className='column'>
            <Typography align='justify'>
            Before you begin, please be aware this is an alpha stage deployment.
            The features available as of today are limited but already functional.
            However, you may encounter occasional instability and errors.
            </Typography>
            <Typography align='justify'>
            <strong>At this early stage, the focus of the Superalgos Platform is the Strategizer, a tool directed mostly at traders.</strong>
            To try out the Demo version hosted here you will need to Sign Up / Login.
            Once you are logged in, you will find basic instructions on how to proceed,
            at this home page (click the Superalgos logo to return to this home page).
            </Typography>
          </div>
          <div className='column'>
            <Typography align='justify'>
            <strong>If you are a developer, trying out the Strategizer may open your eyes as of what may be achieved with the
            Strategizer and the Superalgos Platform in general.</strong>
            </Typography>
            <Typography align='justify'>
            The Strategizer is conceived to work with as many indicators and pre programmed strategies as developers are willing to program.
            </Typography>
            <Typography align='justify'>
            If you wish to set up your own indicators and strategies, please get in touch with us and we'll show you how (give us a shout in the Community Telegram)
            </Typography>
          </div>
        </div>
      </React.Fragment>
    )
  }
}

export default Home
