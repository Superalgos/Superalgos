/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const NavUserInfo = () => (state, actions) => {
  const username = state.user.username
  const avatar = state.user.avatar

  if (avatar === '' && username !== null && username !== '') {
    const initial = username.substring(0, 1)
    return (
      <div class='navbar-link has-dropdown avatar-wrapper'>
        <div class='image is-32x32 avatar has-text-white is-uppercase is-red'>
          {initial}
        </div>
        &nbsp; {username}
      </div>
    )
  } else {
    return (
      <div class='avatar-wrapper'>
        <div class='image is-32x32 avatar'>
          <img src={avatar} alt={username} />
        </div>
        &nbsp; {username}
      </div>
    )
  }
}

export default NavUserInfo
