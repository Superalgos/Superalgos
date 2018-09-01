/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const Settings = () => (
  <section
    class='section has-text-centered p-l-5 p-r-5'
    key='SettingsContainer'
  >
    <div class='box p-t-3 p-b-5 p-l-5 p-r-5 m-b-5'>
      <h1 class='title has-text-centered is-uppercase is-condensed is-size-3'>
        Your Settings
      </h1>
      <hr />
      <p class='is-size-4 has-text-weight-light'>Notifications</p>
      <p>Receiving account-related notification by email.</p>
      <hr />
      <p class='is-size-4 has-text-weight-light'>Mailing List</p>
      <p>No mailing lists.</p>
    </div>
  </section>
)

export default Settings
