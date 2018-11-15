import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {updateReferrerMutation} from '../queries/queries'

// components

import UserSearch from './UserSearch'
import UserProfile from './UserProfile'

// Material-ui

import { withStyles } from '@material-ui/core/styles'
import Paper from '@material-ui/core/Paper'
import Typography from '@material-ui/core/Typography'

const styles = theme => ({
  root: {
    width: '100%',
    flexGrow: 1,
    padding: 10,
    marginTop: '5%',
    marginBottom: '10%'
  },
  typography: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 40,
    marginBottom: 40
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3
  },
  inputField: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 25
  }
})

class YourReferrer extends Component {

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
    this.setState({referrerId: referrerUser.id})

    this.props.updateReferrerMutation({
      variables: {
        referrerId: referrerUser.id
      }
    })

      /* Before we are done, we need to update the state of the local storage. */

    let user = JSON.parse(localStorage.getItem('loggedInUser'))

    user.referrerId = referrerUser.id

    localStorage.setItem('loggedInUser', JSON.stringify(user))
  }

  renderMode () {
    const { classes } = this.props

    if (this.state.referrerId !== null) {
      return (
        <div>
          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
          This is the user who introduced you to the project.
          </Typography>

          <UserProfile userId={this.state.referrerId} />

          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
           This information can not be changed.
           </Typography>
        </div>
      )
    } else {
      return (
        <div>
          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
          We know that a group often becomes more intelligent when the number of people in the group increases.
          To incentivize members of the community to invite more people to join we have developed this referral
          program in which you can specify who referred you to the project, and see the members who pointed at
          you as their referrer. Later this information will be available at your user profile and add to your
          overall reputation within the project.
          </Typography>

          <UserSearch selectButton onSelect={this.userSelected.bind(this)} selectText="After that press the 'Select' button on the desired user to set it as your referrer. Bear in mind that this action can not be undone." />
        </div>
      )
    }
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

  addForm () {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <Typography className={classes.typography} variant='h5' gutterBottom>
      Your Referrer
    </Typography>
        {this.renderMode()}
      </Paper>
    )
  }

  render () {
    return (
      <React.Fragment>
        <div className='container'>
          {this.addForm()}
        </div>
      </React.Fragment>
    )
  }
}

export default compose(
  graphql(updateReferrerMutation, {name: 'updateReferrerMutation'}),
  withStyles(styles)
)(YourReferrer) // This technique binds more than one query to a single component.
