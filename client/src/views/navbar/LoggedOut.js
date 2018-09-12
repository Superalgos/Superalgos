import React from 'react'
import PropTypes from 'prop-types'
import Button from '@material-ui/core/Button'

export const LoggedOut = ({ auth }) => (
  <div onClick={() => auth.login()}>
    <Button color='inherit'>Login / Sign up</Button>
  </div>
)

LoggedOut.propTypes = {
  auth: PropTypes.object.isRequired
}

export default LoggedOut // This binds the querty to the component
