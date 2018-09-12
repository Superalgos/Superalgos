import React from 'react'
import { graphql } from 'react-apollo'

import CircularProgress from '@material-ui/core/CircularProgress'
import LoggedInMenu from './LoggedInMenu'

import { GetCurrentMember } from '../../graphql/members'

import { isDefined } from '../../utils/js-helpers'

export const LoggedIn = props => {
  let { error, loading, userByAuthId } = props.data
  let user = userByAuthId

  if (error) return <div> An Error Occurred</div>
  else if (loading) {
    return (
      <div>
        <CircularProgress />
      </div>
    )
  } else {
    let displayName = 'No Display Name'

    if (isDefined(user.alias)) {
      displayName = user.alias
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
          <LoggedInMenu menuLabel={displayName} user={user} />
        </p>
      </div>
    )
  }
}

export default graphql(GetCurrentMember)(LoggedIn) // This binds the querty to the component
