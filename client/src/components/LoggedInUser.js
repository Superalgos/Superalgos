import React, { Component } from 'react'
import {graphql} from 'react-apollo'
import {getUserByAuthIdQuery} from '../queries/queries'
import {auth} from '../App'
import LoggedInUserMenu from './LoggedInUserMenu'
import Button from '@material-ui/core/Button'

class LoggedInUser extends Component {

  displayLoggedInUser () {
    const user = this.props.data.userByAuthId

    if (user) {
      let displayName = 'No Display Name'

      if (
        user.alias !== null &&
        user.alias !== ''
      ) { displayName = user.alias }

      if (
        user.firstName !== null &&
        user.firstName !== ''
      ) { displayName = user.firstName }

      if (
        user.firstName !== null &&
        user.firstName !== '' &&
        user.lastName !== null &&
        user.lastName !== ''
      ) { displayName = user.firstName + ' ' + user.lastName }

      return (
        <div>
          <p><LoggedInUserMenu menuLabel={displayName} /></p>
        </div>
      )
    } else {
      return (
        <div onClick={() => auth.login()}>
          <Button color='inherit'>Login / Sign up</Button>
        </div>
      )
    }
  }

  componentDidMount () {

  }

  render () {
    if (this.loggedInUserStored !== true) {
      let user = this.props.data.userByAuthId

      if (user !== undefined) {
        localStorage.setItem('loggedInUser', JSON.stringify(this.props.data.userByAuthId))
        this.loggedInUserStored = true
      }
    }

    return (
      <div>
        {this.displayLoggedInUser()}
      </div>
    )
  }
}

export default graphql(getUserByAuthIdQuery, { // What follows is the way to pass a parameter to a query.
  options: (props) => {
    return {
      variables: {
        authId: props.authId
      }
    }
  }
})(LoggedInUser) // This binds the querty to the component
