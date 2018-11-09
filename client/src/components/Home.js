import React, { Component } from 'react'
import TopBar from './TopBar'

class Home extends Component {

  render () {
    return (
      <React.Fragment>
        <TopBar size='big' title='Users Module' text='Responsible for all human users of the Advanced Algos Platform.' />
      </React.Fragment>
    )
  }
}

export default Home
