import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getRolesQuery, updateUserMutation, getUsersQuery} from '../queries/queries'

// components

import UserSearch from './UserSearch'

// Material-ui

import { withStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import Input from '@material-ui/core/Input'
import Button from '@material-ui/core/Button'
import Select from '@material-ui/core/Select'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  root: {
    width: '50%',
    flexGrow: 1,
    padding: 10,
    marginLeft: '25%',
    marginTop: '2%'
  },
  typography: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 40
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3
  }
})

class UserReferrals extends Component {

  constructor (props) {
    super(props)

    this.defaultValuesSet = false

    this.state = {
      firstNameError: false,
      middleNameError: false,
      lastNameError: false,
      aliasError: false
    }
  }

  userSelected (user) {
    console.log(user)

    this.setState({referrer: user.id})
  }

  submitForm (e) {
    e.preventDefault()
    this.props.updateUserMutation({
      variables: {
        id: this.state.id,
        firstName: this.state.firstName,
        middleName: this.state.middleName,
        lastName: this.state.lastName,
        bio: this.state.bio,
        isDeveloper: this.state.isDeveloper,
        isTrader: this.state.isTrader,
        isDataAnalyst: this.state.isDataAnalyst,
        roleId: this.state.roleId
      },
      refetchQueries: [{ query: getUsersQuery}] // This allow us to re run whatever queries are necesary after the mutation.
    })

      /* Before we are done, we need to update the state of the local storage. */

    let user = JSON.parse(localStorage.getItem('loggedInUser'))

    user.firstName = this.state.firstName
    user.middleName = this.state.middleName
    user.lastName = this.state.lastName
    user.bio = this.state.bio
    user.isDeveloper = this.state.isDeveloper
    user.isTrader = this.state.isTrader
    user.isDataAnalyst = this.state.isDataAnalyst
    user.role.id = this.state.roleId

    localStorage.setItem('loggedInUser', JSON.stringify(user))
  }

  componentWillMount ()    	{
    	    if (this.defaultValuesSet === false)    	    {
          let userData = localStorage.getItem('loggedInUser')

          if (userData === 'undefined') { return }

          let user = JSON.parse(userData)
  	        this.defaultValuesSet = true

          /* To avoid console warning, we need to take care of the fields that are null. */

          if (user.firstName === null) { user.firstName = '' }
          if (user.middleName === null) { user.middleName = '' }
          if (user.lastName === null) { user.lastName = '' }
          if (user.bio === null) { user.bio = '' }

          /* Now we are ready to set the initial state. */

          this.setState({
            id: user.id,
            alias: user.alias,
            email: user.email,
            emailVerified: user.emailVerified,
            firstName: user.firstName,
            middleName: user.middleName,
            lastName: user.lastName,
            bio: user.bio,
            isDeveloper: user.isDeveloper,
            isTrader: user.isTrader,
            isDataAnalyst: user.isDataAnalyst,
            roleId: user.role.id
          })
    	    }
    	}

  render () {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <Typography className={classes.typography} variant='headline' gutterBottom>
              Referral Program
        </Typography>
        <form onSubmit={this.submitForm.bind(this)}>

          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
        We know that a group often becomes more intelligent when the number of people in the group increases.
        To incentivize members of the community to invite more people to join we have developed this referral
        program in which you can specify who referred you to the project, and see the members who pointed at
        you as their referrer. Later this information will be available at your user profile and add to your
        overall reputation within the project.
        </Typography>

          <UserSearch selectButton onSelect={this.userSelected.bind(this)} selectText="After that press the 'Select' button on the desired user to set it as your referrer. Bear in mind that this action can not be undone." />

        </form>
      </Paper>

    )
  }
}

export default compose(
  graphql(getRolesQuery, {name: 'getRolesQuery'}),
  graphql(updateUserMutation, {name: 'updateUserMutation'}),
  withStyles(styles)
)(UserReferrals) // This technique binds more than one query to a single component.
