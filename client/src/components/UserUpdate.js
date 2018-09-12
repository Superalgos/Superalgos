import React, { Component } from 'react';
import {graphql, compose} from 'react-apollo';
import {getRolesQuery, updateUserMutation, getUsersQuery} from '../queries/queries';

//Material-ui

import { withStyles } from '@material-ui/core/styles';
import MenuItem from '@material-ui/core/MenuItem';
import TextField from '@material-ui/core/TextField';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import FormGroup from '@material-ui/core/FormGroup';
import Select from '@material-ui/core/Select';
import FormHelperText from '@material-ui/core/FormHelperText';


const styles = theme => ({
  inputField: {
      width: '60%',
      marginLeft:'20%',
      marginTop: 20
    },
  pField: {
      width: '80%',
      marginLeft:'10%',
      marginTop: 40
    },
  checkbox: {
      width: '25%',
      marginLeft:'0%',
      marginTop: 20
    },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  button: {
  margin: theme.spacing.unit,
  marginLeft:'80%',
  },
});

class UserUpdate extends Component {

    constructor(props){

      super(props);

      this.defaultValuesSet = false;

      this.state = {
          id: '',
          firstName: '',
          middleName: '',
          lastName: '',
          email: '',
          emailVerified: 0,
          isDeveloper: 0,
          isTrader: 0,
          isDataAnalyst: 0,
          roleId: '1'
        };
    }

    displayRoles(){
        var data = this.props.getRolesQuery; // When there is more than one query binded to a single componente 'data' is replaced by thename of the query given below at the binding operation.
        if(data.loading){
            return(
              <MenuItem><em>Loading roles</em></MenuItem>
            );
        } else {
            return data.roles.map(role => {
                return(
                  <MenuItem key={ role.id } value={role.id}>{ role.name }</MenuItem>
                );
            });
        }
    }

    submitForm(e){

      e.preventDefault();
      this.props.updateUserMutation({
        variables: {
          id: this.state.id,
          firstName: this.state.firstName,
          middleName: this.state.middleName,
          lastName: this.state.lastName,
          isDeveloper: this.state.isDeveloper,
          isTrader: this.state.isTrader,
          isDataAnalyst: this.state.isDataAnalyst,
          roleId: this.state.roleId
        },
        refetchQueries: [{ query: getUsersQuery}] // This allow us to re run whatever queries are necesary after the mutation.
      });

      /* Before we are done, we need to update the state of the local storage. */

      let user = JSON.parse(localStorage.getItem("loggedInUser"));

      user.firstName = this.state.firstName;
      user.middleName = this.state.middleName;
      user.lastName = this.state.lastName;
      user.firstName = this.state.firstName;
      user.isDeveloper = this.state.isDeveloper;
      user.isTrader = this.state.isTrader;
      user.isDataAnalyst = this.state.isDataAnalyst;
      user.role.id = this.state.roleId;

      localStorage.setItem("loggedInUser", JSON.stringify(user));

    }

    handleCheckBoxes(e){
      let fieldValue;
      if (e.target.checked === true) {
        fieldValue = 1;
      } else {
        fieldValue = 0;

        /* When the user unchecks one of the checkboxes, we need to make sure that that Role is not the one selected at the SELECT,
        and if it is, then we need to automatically select another one */

        switch (e.target.id) {
          case "isDeveloper":
            if (this.state.roleId === "2") {
              this.setState({ roleId: "1"});
            }
            break;

          case "isTrader":
            if (this.state.roleId  === "3") {
              this.setState({ roleId: "1"});
            }
            break;

          case "isDataAnalyst":
            if (this.state.roleId  === "4") {
              this.setState({ roleId: "1"});
            }
            break;
          default:
        }
      }
      this.setState({ [e.target.id]: fieldValue})
    }

    handleSelect(e){

      /*
      Whenever the select component changes its value, we need to activate the type of role selected.
      To do so, we change the state of the corresponding type of role here.
      */

      switch (e.target.value) {
        case "2":
          this.setState({ isDeveloper: 1})
          break;
        case "3":
          this.setState({ isTrader: 1})
          break;
        case "4":
          this.setState({ isDataAnalyst: 1})
          break;
        default:
      }

      this.setState({ roleId:e.target.value })
    }

    rightCheckboxValue(stateValue) {
      if (stateValue === 1)
        return true
      else
      return false;
    }

    componentWillMount ()
    	{
    	    if (this.defaultValuesSet === false)
    	    {
            let userData = localStorage.getItem("loggedInUser");

            if (userData === "undefined") { return;}

            let user = JSON.parse(userData);
  	        this.defaultValuesSet= true;

            this.setState({
              id: user.id,
              alias: user.alias,
              email: user.email,
              emailVerified: user.emailVerified,
              firstName: user.firstName,
              middleName: user.middleName,
              lastName: user.lastName,
              isDeveloper: user.isDeveloper,
              isTrader: user.isTrader,
              isDataAnalyst: user.isDataAnalyst,
              roleId: user.role.id
            });
    	    }
    	}

    render(){

        const { classes } = this.props;
        return(
          <div>

              <form className={classes.container} onSubmit={this.submitForm.bind(this)}>

                <p className={classes.pField}>This is your basic information we got from the social identity provider you used to sign up. This information can not be changed.</p>

                <TextField
                    id = "alias"
                    type = "text"
                    value = {this.state.alias}
                    label="Alias"
                    className={classes.inputField}
                    disabled>
                </TextField>

                <TextField
                    id = "email"
                    type = "text"
                    value = {this.state.email}
                    label = "Email"
                    className={classes.inputField}
                    disabled>
                </TextField>

                <FormControlLabel
                    disabled
                    className={classes.inputField}
                    control={
                      <Checkbox
                        id="emailVerified"
                        checked={this.rightCheckboxValue(this.state.emailVerified)}
                        color="primary"
                      />
                    }
                    label="Email Verified"
                  />

                <p className={classes.pField}>TComplete your profile with the following optional information. Providing your real name might help other users trust you more.</p>

                <TextField
                    id = "firstName"
                    type = "text"
                    value = {this.state.firstName}
                    label = "First Name"
                    className={classes.inputField}
                    onChange={(e)=>this.setState({firstName:e.target.value})}
                    >
                </TextField>

                <TextField
                    id = "middleName"
                    type = "text"
                    value = {this.state.middleName}
                    label = "Middle Name"
                    className={classes.inputField}
                    onChange={(e)=>this.setState({middleName:e.target.value})}
                    >
                </TextField>

                <TextField
                    id = "lastName"
                    type = "text"
                    value = {this.state.lastName}
                    label = "First Name"
                    className={classes.inputField}
                    onChange={(e)=>this.setState({lastName:e.target.value})}
                    >
                </TextField>

                <p className={classes.pField}>Check the following options to enable specialized tools designed for each role. You can allways come back and change these settings later.</p>

                <FormGroup row className={classes.inputField}>
                  <FormControlLabel
                      className={classes.checkbox}
                      control={
                        <Checkbox
                          id="isDeveloper"
                          onChange={this.handleCheckBoxes.bind(this)}
                          checked={this.rightCheckboxValue(this.state.isDeveloper)}
                          color="primary"
                        />
                      }
                      label="Developer"
                    />
                    <FormControlLabel
                      className={classes.checkbox}
                      control={
                        <Checkbox
                          id="isTrader"
                          onChange={this.handleCheckBoxes.bind(this)}
                          checked={this.rightCheckboxValue(this.state.isTrader)}
                          color="primary"
                        />
                      }
                      label="Trader"
                    />
                    <FormControlLabel
                        className={classes.checkbox}
                        control={
                          <Checkbox
                            id="isDataAnalyst"
                            onChange={this.handleCheckBoxes.bind(this)}
                            checked={this.rightCheckboxValue(this.state.isDataAnalyst)}
                            color="primary"
                          />
                        }
                        label="Data Analyst"
                      />
                  </FormGroup>

                  <p className={classes.pField}>Your current role determines how the system is going to optimize its user interface to best serves your current needs.</p>

                  <FormControl className={classes.inputField}>
                      <InputLabel shrink htmlFor="age-label-placeholder">
                        Current Role
                      </InputLabel>
                      <Select
                        id="select"
                        ref="select"
                        value={this.state.roleId}
                        onChange={this.handleSelect.bind(this)}
                        input={<Input name="Role" id="role-label-placeholder" />}
                        displayEmpty
                        name="select"
                        className={classes.selectEmpty}
                      >
                        { this.displayRoles() }
                      </Select>
                      <FormHelperText>Select from the list your current role</FormHelperText>
                    </FormControl>

                    <Button variant="contained" color="primary" className={classes.button} onClick={this.submitForm.bind(this)}>
                            Update
                    </Button>
              </form>

        </div>


        );
    }
}

export default compose(
  graphql(getRolesQuery, {name: "getRolesQuery"}),
  graphql(updateUserMutation, {name: "updateUserMutation"}),
  withStyles(styles)
) (UserUpdate); // This technique binds more than one query to a single component.
