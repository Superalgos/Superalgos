import React from 'react'
import PropTypes from 'prop-types'

import { BannerTopBar } from '../common'
import ManageTeamsList from './components/ManageTeamsList'

const ManageTeams = ({ classes, ...props }) => (
  <div>
    <BannerTopBar size='medium' title='Manage Your Teams' text='Discover, Create and manage Advanced Algos Teams' backgroundUrl='https://advancedalgos.net/img/photos/teams.jpg' />
    <div className='container'>
      <ManageTeamsList {...props} />
    </div>
  </div>
)

ManageTeams.propTypes = {
  classes: PropTypes.object.isRequired
}

export default ManageTeams
