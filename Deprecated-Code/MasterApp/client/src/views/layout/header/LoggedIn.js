import React from 'react'
import { Link } from 'react-router-dom'

import { isDefined } from '../../../utils/js-helpers'

export const LoggedIn = props => {
  let { user, auth, openedMenu, toggleMenuOpen, closeAll, bigScreen, mouseLeave } = props
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

  displayName = displayName.split('-')[0]
  displayName = displayName.split('.')[0]
  displayName = displayName.split('_')[0]
  displayName = displayName.split(' ')[0]

  return (

    <li
      onMouseEnter={() => toggleMenuOpen(42, bigScreen)}
      onMouseLeave={() => mouseLeave(bigScreen)}
      className={openedMenu === 42 ? 'selected primaryLink hasChildren' : 'primaryLink hasChildren'}
    >
      <Link to='/users/user' onClick={() => toggleMenuOpen(42, true)}> {displayName} </Link>
      <ul className='subMenu'>
        <li><Link to='/users/user' onClick={() => closeAll()}> Your Profile </Link></li>
        <li><Link to='/teams/manage-teams' onClick={() => closeAll()}> Your Team </Link></li>
        <li><a href='#' onClick={() => auth.logout()}> Logout </a></li>
        <li><a href='https://www.superalgos.org/documentation-quick-start.shtml'> Docs </a></li>
        <li><a href='https://superalgos.org'> Exit Platform </a></li>
      </ul>
    </li>
  )
}

export default LoggedIn
