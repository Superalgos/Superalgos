import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getRolesQuery, updateReferrerMutation, getUsersQuery} from '../queries/queries'

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
      id: '',
      referrerId: '',
      firstNameError: false,
      middleNameError: false,
      lastNameError: false,
      aliasError: false
    }
  }

  userSelected (referrerUser) {
    console.log(user)

    this.setState({referrer: referrerUser.id})

    this.props.updateReferrerMutation({
      variables: {
        id: this.state.id,
        referrerId: referrerUser.id
      }
    })

      /* Before we are done, we need to update the state of the local storage. */

    let user = JSON.parse(localStorage.getItem('loggedInUser'))

    user.referrerId = referrerUser.id

    localStorage.setItem('loggedInUser', JSON.stringify(user))
  }

  componentWillMount ()    	{
    	    if (this.defaultValuesSet === false)    	    {
          let userData = localStorage.getItem('loggedInUser')

          if (userData === 'undefined') { return }

          let user = JSON.parse(userData)
  	        this.defaultValuesSet = true

          /* Now we are ready to set the initial state. */

          this.setState({
            id: user.id,
            referrerId: user.referrerId
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

        <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
        We know that a group often becomes more intelligent when the number of people in the group increases.
        To incentivize members of the community to invite more people to join we have developed this referral
        program in which you can specify who referred you to the project, and see the members who pointed at
        you as their referrer. Later this information will be available at your user profile and add to your
        overall reputation within the project.
        </Typography>

        <UserSearch selectButton onSelect={this.userSelected.bind(this)} selectText="After that press the 'Select' button on the desired user to set it as your referrer. Bear in mind that this action can not be undone." />

      </Paper>

    )
  }
}

export default compose(
  graphql(updateReferrerMutation, {name: 'updateReferrerMutation'}),
  withStyles(styles)
)(UserReferrals) // This technique binds more than one query to a single component.
