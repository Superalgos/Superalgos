import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'

import LoggedInMenu from './LoggedInMenu'

import { GetCurrentMember } from '../../graphql/members'

import { isDefined } from '../../utils/js-helpers'

export const LoggedIn = props => {
  let { data, user, auth } = props
  console.log('LoggedIn :', data, user)
  let displayName = 'No Display Name'

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

  return (
    <div>
      <p>
        <LoggedInMenu menuLabel={displayName} auth={auth} />
      </p>
    </div>
  )
}

LoggedIn.propTypes = {
  data: PropTypes.object,
  user: PropTypes.object.isRequired,
  auth: PropTypes.object.isRequired
}

export default graphql(GetCurrentMember)(LoggedIn) // This binds the querty to the component
