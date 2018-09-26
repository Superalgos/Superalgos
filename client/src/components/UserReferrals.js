import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getRolesQuery, updateUserMutation, getUsersQuery} from '../queries/queries'

// components

import UserSearch from './UserSearch'

// Material-ui

import { withStyles } from '@material-ui/core/styles'
import MenuItem from '@material-ui/core/MenuItem'
import TextField from '@material-ui/core/TextField'
import FormControl from '@material-ui/core/FormControl'
import InputLabel from '@material-ui/core/InputLabel'
import Input from '@material-ui/core/Input'
import Button from '@material-ui/core/Button'
import FormControlLabel from '@material-ui/core/FormControlLabel'
import Checkbox from '@material-ui/core/Checkbox'
import FormGroup from '@material-ui/core/FormGroup'
import Select from '@material-ui/core/Select'
import FormHelperText from '@material-ui/core/FormHelperText'
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

// Images
import AALogo from '../img/aa-logo.png'

const styles = theme => ({
  root: {
    width: '50%',
    flexGrow: 1,
    padding: 10,
    marginLeft: '25%',
    marginTop: '2%'
  },
  inputField: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 25
  },
  typography: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 40
  },
  checkbox: {
    width: 150,
    marginLeft: '0%',
    marginTop: 20
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3
  },
  img: {
    display: 'block',
    marginTop: 20,
    maxWidth: 120,
    maxHeight: 24
  }
})

class UserReferrals extends Component {

  constructor (props) {
    super(props)

    this.defaultValuesSet = false

    this.state = {
      id: '',
      firstName: '',
      middleName: '',
      lastName: '',
      bio: '',
      email: '',
      emailVerified: 0,
      isDeveloper: 0,
      isTrader: 0,
      isDataAnalyst: 0,
      roleId: '1',
      firstNameError: false,
      middleNameError: false,
      lastNameError: false,
      bioError: false
    }
  }

  displayRoles () {
    var data = this.props.getRolesQuery // When there is more than one query binded to a single componente 'data' is replaced by thename of the query given below at the binding operation.
    if (data.loading) {
      return (
        <MenuItem><em>Loading roles</em></MenuItem>
      )
    } else {
      return data.roles.map(role => {
        return (
          <MenuItem key={role.id} value={role.id}>{ role.name }</MenuItem>
        )
      })
    }
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

  handleCheckBoxes (e) {
    let fieldValue
    if (e.target.checked === true) {
      fieldValue = 1
    } else {
      fieldValue = 0

        /* When the user unchecks one of the checkboxes, we need to make sure that that Role is not the one selected at the SELECT,
        and if it is, then we need to automatically select another one */

      switch (e.target.id) {
        case 'isDeveloper':
          if (this.state.roleId === '2') {
            this.setState({ roleId: '1'})
          }
          break

        case 'isTrader':
          if (this.state.roleId === '3') {
            this.setState({ roleId: '1'})
          }
          break

        case 'isDataAnalyst':
          if (this.state.roleId === '4') {
            this.setState({ roleId: '1'})
          }
          break
        default:
      }
    }
    this.setState({ [e.target.id]: fieldValue})
  }

  handleSelect (e) {
      /*
      Whenever the select component changes its value, we need to activate the type of role selected.
      To do so, we change the state of the corresponding type of role here.
      */

    switch (e.target.value) {
      case '2':
        this.setState({ isDeveloper: 1})
        break
      case '3':
        this.setState({ isTrader: 1})
        break
      case '4':
        this.setState({ isDataAnalyst: 1})
        break
      default:
    }

    this.setState({ roleId: e.target.value })
  }

  handleTextField (e) {
      /*
      We will do some basic input validations here. If something is wrong we will turn on the error sign on the textfield.
      */

    let value = e.target.value

    switch (e.target.id) {
      case 'firstName':
        if (value.length > 30) {
          this.setState({firstNameError: true})
        } else {
          this.setState({firstNameError: false, firstName: value})
        }
        break
      case 'middleName':
        if (value.length > 30) {
          this.setState({middleNameError: true})
        } else {
          this.setState({middleNameError: false, middleName: value})
        }
        break
      case 'lastName':
        if (value.length > 50) {
          this.setState({lastNameError: true})
        } else {
          this.setState({lastNameError: false, lastName: value})
        }
        break
      case 'bio':
        if (value.length > 250) {
          this.setState({bioError: true})
        } else {
          this.setState({bioError: false, bio: value})
        }
        break
      default:
    }
  }

  rightCheckboxValue (stateValue) {
    if (stateValue === 1) {
      return true
    } else { return false }
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

          <UserSearch />

          <Grid container justify='center' >
            <Grid item>
              <img className={classes.img} src={AALogo} alt='Advanced Algos' />
            </Grid>
          </Grid>

          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
          Complete your profile with the following optional information. Providing your real name might help other users trust you more.
          </Typography>

          <TextField
            error={this.state.firstNameError}
            id='firstName'
            type='text'
            value={this.state.firstName}
            label='First Name'
            className={classes.inputField}
            onChange={this.handleTextField.bind(this)}
                     />

          <TextField
            error={this.state.middleNameError}
            id='middleName'
            type='text'
            value={this.state.middleName}
            label='Middle Name'
            className={classes.inputField}
            onChange={this.handleTextField.bind(this)}
                     />

          <TextField
            error={this.state.lastNameError}
            id='lastName'
            type='text'
            value={this.state.lastName}
            label='Last Name'
            className={classes.inputField}
            onChange={this.handleTextField.bind(this)}
                     />

          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
           If you wish, you can add a short paragraph with your Bio or anything you would like to communicate to whoever finds your user profile.
           </Typography>

          <TextField
            error={this.state.bioError}
            id='bio'
            type='text'
            value={this.state.bio}
            label='Bio'
            className={classes.inputField}
            onChange={this.handleTextField.bind(this)}
                     />

          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
          Check the following options to enable specialized tools designed for each role. You can allways come back and change these settings later.
          </Typography>

          <FormGroup row className={classes.inputField}>
            <Grid container justify='center' >
              <Grid item>
                <FormControlLabel
                  className={classes.checkbox}
                  control={
                    <Checkbox
                      id='isDeveloper'
                      onChange={this.handleCheckBoxes.bind(this)}
                      checked={this.rightCheckboxValue(this.state.isDeveloper)}
                      color='secondary'
                            />
                          }
                  label='Developer'
                        />
              </Grid>
              <Grid item>
                <FormControlLabel
                  className={classes.checkbox}
                  control={
                    <Checkbox
                      id='isTrader'
                      onChange={this.handleCheckBoxes.bind(this)}
                      checked={this.rightCheckboxValue(this.state.isTrader)}
                      color='secondary'
                          />
                        }
                  label='Trader'
                      />
              </Grid>
              <Grid item>
                <FormControlLabel
                  className={classes.checkbox}
                  control={
                    <Checkbox
                      id='isDataAnalyst'
                      onChange={this.handleCheckBoxes.bind(this)}
                      checked={this.rightCheckboxValue(this.state.isDataAnalyst)}
                      color='secondary'
                            />
                          }
                  label='Data Analyst'
                        />
              </Grid>
            </Grid>
          </FormGroup>

          <p className={classes.typography}>Your current role determines how the system is going to optimize its user interface to best serves your current needs.</p>

          <FormControl className={classes.inputField}>
            <InputLabel shrink htmlFor='select'>
                        Current Role
                      </InputLabel>
            <Select
              id='select'
              ref='select'
              value={this.state.roleId}
              onChange={this.handleSelect.bind(this)}
              input={<Input name='Role' id='role-label-placeholder' />}
              displayEmpty
              name='select'
              className={classes.selectEmpty}
                      >
              { this.displayRoles() }
            </Select>
            <FormHelperText>Select from the list your current role</FormHelperText>
          </FormControl>

          <Grid container justify='center' >
            <Grid item>
              <Button variant='contained' color='secondary' className={classes.button} onClick={this.submitForm.bind(this)}>Update</Button>
            </Grid>
          </Grid>
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
