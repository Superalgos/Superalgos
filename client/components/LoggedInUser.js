import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getUserByAuthIdQuery} from '../queries/queries'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'

import Button from '@material-ui/core/Button'
import IconButton from '@material-ui/core/IconButton'

// icons
import UserIcon from '@material-ui/icons/Person'
import { Link } from 'react-router-dom'

const UserLink = props => <Link to='/users/user' {...props} />

const styles = theme => ({
  root: {
    flexGrow: 1
  },
  flex: {
    flexGrow: 1,
    marginLeft: 30
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  cssRoot: {
    color: '#FFFFFF',
    backgroundColor: theme.palette.secondary,
    '&:hover': {
      backgroundColor: theme.palette.dark
    },
    whiteSpace: 'nowrap',
    paddingRight: 2 * theme.spacing.unit,
    paddingLeft: 2 * theme.spacing.unit
  },
  button: {
    margin: theme.spacing.unit
  },
  leftIcon: {
    marginRight: theme.spacing.unit
  },
  rightIcon: {
    marginLeft: theme.spacing.unit
  },
  iconSmall: {
    fontSize: 20
  }
})

class LoggedInUser extends Component {

  displayLoggedInUser () {
    const user = this.props.data.users_UserByAuthId
    const { classes, match } = this.props

    if (user) {
      let displayName = 'No Display Name'

      if (
        user.alias !== null &&
        user.alias !== ''
      ) { displayName = user.alias }

      if (
        user.firstName !== null &&
        user.firstName !== ''
      ) { displayName = user.firstName }

      if (
        user.firstName !== null &&
        user.firstName !== '' &&
        user.lastName !== null &&
        user.lastName !== ''
      ) { displayName = user.firstName + ' ' + user.lastName }

      let authArray = this.props.authId.split('|')
      let identityProvider = authArray[0]

      return (
        <div>
          <Button
            variant='text'
            size='small'
            className={classNames(classes.button, classes.cssRoot)}
            title='Manage Your Profile'
            component={UserLink}
            to={`${match.url}/user`}>
            <UserIcon className={classNames(classes.leftIcon, classes.iconSmall)} />
            Your Profile
          </Button>
        </div>
      )
    } else {
      return (
        <div />
      )
    }
  }

  componentDidMount () {

  }

  render () {
    if (this.loggedInUserStored !== true) {
      let user = this.props.data.users_UserByAuthId

      if (user !== undefined) {
        localStorage.setItem('loggedInUser', JSON.stringify(this.props.data.users_UserByAuthId))
        this.loggedInUserStored = true
      }
    }

    return (
      <div>
        {this.displayLoggedInUser()}
      </div>
    )
  }
}

export default compose(
  graphql(getUserByAuthIdQuery, { // What follows is the way to pass a parameter to a query.
    options: (props) => {
      return {
        variables: {
          authId: props.authId
        }
      }
    }
  }),
  withStyles(styles)
)(LoggedInUser)
