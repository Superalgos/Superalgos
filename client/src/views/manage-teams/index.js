import React from 'react'
import PropTypes from 'prop-types'

import { BannerTopBar } from '../common'
import ManageTeamsList from './components/ManageTeamsList'

const ManageTeams = ({ classes, match, ...props }) => (
  <div>
    <BannerTopBar
      size={match.params.slug !== undefined ? 'small' : 'medium'}
      title='Manage Your Teams'
      text='Discover, Create and manage Advanced Algos Teams'
      backgroundUrl='https://advancedalgos.net/img/photos/teams.jpg'
    />
    <div className='container'>
      <ManageTeamsList {...props} match={match} />
    </div>
  </div>
)

ManageTeams.propTypes = {
  classes: PropTypes.object.isRequired,
  match: PropTypes.object
}

export default ManageTeams
