import React, { Component } from 'react'
import PropTypes from 'prop-types'

import queryString from 'query-string'

import { MessageCard } from '../common/'

class AcceptTeamInvite extends Component {
  render () {
    const { location, auth } = this.props
    const param = queryString.parse(location.search)
    console.log(param, auth)

    if (auth === undefined) {
      return <MessageCard message='Loading...' />
    }

    auth.loginInvite(param.token)

    return (
      <MessageCard message='Verifying Invitation' />
    )
  }
}

AcceptTeamInvite.propTypes = {
  location: PropTypes.object.isRequired,
  auth: PropTypes.object
}

export default AcceptTeamInvite
