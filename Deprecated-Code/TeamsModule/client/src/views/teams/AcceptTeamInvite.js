import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { parse } from '../../utils/js-helpers'
import log from '../../utils/log'

import { MessageCard } from '@superalgos/web-components'

class AcceptTeamInvite extends Component {
  render () {
    const { location, auth } = this.props
    const param = parse(location.search)
    log.debug(param, auth)

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
