import React, { Component } from 'react'
import { Route, BrowserRouter, Switch } from 'react-router-dom'

import { MessageCard } from '@advancedalgos/web-components'
import { getItem } from './utils/local-storage'

import TopBar from './Components/TopBar'
import Search from './Components/Search'

const Base = () => (
  <div>
    <p>Base component</p>
    <MessageCard message='That can also wrap other components' >
      <div className='loader'>Loading...</div>
    </MessageCard>
  </div>
)

const Added = () => (
  <p>
    Added component
  </p>
)

class App extends Component {
  constructor (props) {
    super(props)
    this.state = {
      user: null
    }
  }

  async componentDidMount () {
    let user = await getItem('user')

    if (user !== null && user !== undefined && user !== 'undefined') {
      user = JSON.parse(user)
      this.setState({ user: user })
    }
  }

  render () {
    let loggedIn
    if (this.state.user !== null) {
      loggedIn = (<TopBar match={this.props.match} user={this.state.user} />)
    } else {
      loggedIn = ''
    }
    return (
      <BrowserRouter basename={this.props.match.path}>
        <div>
          {loggedIn}
          <Switch>
            <Route exact path='/' component={Search} />
            <Route path='/added' component={Added} />
          </Switch>
        </div>
      </BrowserRouter>
    )
  }
}

export default App
