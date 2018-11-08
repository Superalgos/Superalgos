import React from 'react'
import { Link } from 'react-router-dom'

import { isDefined } from '../../../utils/js-helpers'

export const LoggedIn = props => {
  let { user, auth } = props
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

    <li className='primaryLink hasChildren'>
      <Link to='/users/user'> {displayName} </Link>
      <ul className='subMenu'>
        <li><Link to='/users/user' > Profile </Link></li>
        <li><a href='#' onClick={() => auth.logout()}> Logout </a></li>
      </ul>
    </li>
  )
}

export default LoggedIn
