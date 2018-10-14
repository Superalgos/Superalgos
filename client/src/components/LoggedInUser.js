import React, { Component } from 'react'
import {graphql} from 'react-apollo'
import {getUserByAuthIdQuery} from '../queries/queries'

import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'

// icons
import UserIcon from '@material-ui/icons/Person'
import { Link } from 'react-router-dom'

const UserLink = props => <Link to='/user' {...props} />

class LoggedInUser extends Component {

  displayLoggedInUser () {
    const user = this.props.data.users_UserByAuthId

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

      let authArray = this.props.authId.split('|')
      let identityProvider = authArray[0]

      return (
        <div>
          <IconButton

            color='inherit'
            title='Manage your Profile'
            component={UserLink}>
            <UserIcon />
          </IconButton>
        </div>
      )
    } else {
      return (
        <div />
      )
    }
  }

  componentDidMount () {

  }

  render () {
    if (this.loggedInUserStored !== true) {
      let user = this.props.data.users_UserByAuthId

      if (user !== undefined) {
        localStorage.setItem('loggedInUser', JSON.stringify(this.props.data.users_UserByAuthId))
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
