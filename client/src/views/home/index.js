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
    if (this.state.user !== undefined && this.state.user !== null) {}
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
          <div className='column'>
            <Typography align='justify'>
            Before you begin, please be aware this is an alpha stage deployment.
            The features available as of today are limited but already functional.
            However, you may encounter occasional instability and errors.
            </Typography>
            <Typography align='justify'>
            To try out the Demo version hosted here you will need to Sign Up / Login.
            Once you are logged in, you will find basic instructions on how to proceed,
            at this home page (click the Superalgos logo to return to this home page).
            </Typography>
          </div>
          <div className='column'>
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
