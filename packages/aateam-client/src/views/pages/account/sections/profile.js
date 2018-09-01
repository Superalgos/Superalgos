/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const Profile = () => (state, actions) => {
  const username = state.user.profile.username
  const avatar = state.user.profile.avatar
  const initial = username.substring(0, 1)
  return (
    <section
      class='section has-text-centered p-l-5 p-r-5'
      key='ProfileContainer'
    >
      <div class='box p-t-3 p-b-5 p-l-5 p-r-5 m-b-5'>
        <h1 class='title has-text-centered is-uppercase is-condensed is-size-3'>
          Your Profile
        </h1>
        {avatar !== null && avatar !== '' ? (
          <div class='image is-96x96 avatar'>
            <img src={avatar} alt={username} />
          </div>
        ) : (
          <div class='image is-96x96 avatar has-text-white is-uppercase is-red is-size-3 is-centered'>
            {initial}
          </div>
        )}
        <p class='title'>{username}</p>
        <p class='subtitle'>{state.user.profile.email}</p>
      </div>
    </section>
  )
}

export default Profile
