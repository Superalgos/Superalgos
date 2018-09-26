import React from 'react'
import PropTypes from 'prop-types'
import { Query } from 'react-apollo'

import LoggedInMenu from './LoggedInMenu'
import { MessageCard } from '../common/'

import { UserClient } from '../../App'
import { USER_BY_AUTHID } from '../../graphql/members'

import { isDefined } from '../../utils/js-helpers'

export const LoggedIn = props => {
  let { data, user, auth } = props
  console.log('LoggedIn :', data, user, auth)
  let displayName = 'No Display Name'
  let authId = null
  if (isDefined(user.authId)) {
    authId = user.authId
  }

  if (isDefined(user.alias)) {
    displayName = user.alias
  }

  if (isDefined(user.nickname)) {
    displayName = user.nickname
  }

  if (isDefined(user.firstName)) {
    displayName = user.firstName
  }

  if (isDefined(user.firstName) && isDefined(user.lastName)) {
    displayName = user.firstName + ' ' + user.lastName
  }

  if (authId === null) {
    return (
      <div>Loading...</div>
    )
  }

  return (
    <Query
      query={USER_BY_AUTHID}
      fetchPolicy='network-only'
      variables={{ authId }}
      client={UserClient}
    >
      {({ loading, error, data }) => {
        console.log('USER_BY_AUTHID: ', loading, error, data)

        if (error) {
          error.graphQLErrors.map(({ message }, i) => {
            return <MessageCard message={message} />
          })
        }
        return (
          <p>
            <LoggedInMenu menuLabel={displayName} auth={auth} />
          </p>
        )
      }}
    </Query>
  )
}

LoggedIn.propTypes = {
  data: PropTypes.object,
  user: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
}

export default LoggedIn
