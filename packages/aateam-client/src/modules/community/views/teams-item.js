/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const TeamsItem = ({ team }) => (
  <tr>
    <td>
      {team.profile !== null && team.profile.avatar !== '' ? (
        <div class='image is-16x16 avatar'>
          <img src={team.profile.avatar} alt={team.name} />
        </div>
      ) : (
        <div class='image is-16x16 avatar has-text-white is-uppercase is-green is-size-7 is-centered'>
          {team.name.substring(0, 1)}
        </div>
      )}
    </td>
    <td>
      <strong>{team.name}</strong>
    </td>
    <td>
      <strong>{team.owner.nickname}</strong>
    </td>
    <td>
      <strong>{team.members.length}</strong>
    </td>
  </tr>
)

export default TeamsItem
