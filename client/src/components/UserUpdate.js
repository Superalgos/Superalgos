import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {graphql, compose} from 'react-apollo';
import {getRolesQuery, updateUserMutation, getUsersQuery} from '../queries/queries';

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

      console.log("constructor");
    }

    displayRoles(){
        var data = this.props.getRolesQuery; // When there is more than one query binded to a single componente 'data' is replaced by thename of the query given below at the binding operation.
        if(data.loading){
            return( <option disabled>Loading roles</option> );
        } else {
            return data.roles.map(role => {
                return( <option key={ role.id } value={role.id}>{ role.name }</option> );
            });
        }
    }

    submitForm(e){
      console.log("submitting this>", this.state);
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
    }

    handleCheckBoxes(e){
      let fieldValue;
      if (e.target.checked === true) {
        fieldValue = 1;
      } else {
        fieldValue = 0;

        /* When the user unchecks one of the checkboxes, we need to make sure that that Role is not the one selected at the SELECT,
        and if it is, then we need to automatically select another one */

        let select = ReactDOM.findDOMNode(this.refs.select);
        switch (e.target.id) {
          case "isDeveloper":
            if (select.value === "2") {
              select.value = "1";
              this.setState({ roleId: "1"});
            }
            break;

          case "isTrader":
            if (select.value === "3") {
              select.value = "1";
              this.setState({ roleId: "1"});
            }
            break;

          case "isDataAnalyst":
            if (select.value === "4") {
              select.value = "1";
              this.setState({ roleId: "1"});
            }
            break;
          default:
        }
      }
      this.setState({ [e.target.id]: fieldValue})
    }

    handleSelect(e){
      let checkbox;
      switch (e.target.value) {
        case "2":
          checkbox = ReactDOM.findDOMNode(this.refs.id2);
          checkbox.checked = true;
          this.setState({ isDeveloper: 1})
          break;
        case "3":
          checkbox = ReactDOM.findDOMNode(this.refs.id3);
          checkbox.checked = true;
          this.setState({ isTrader: 1})
          break;
        case "4":
          checkbox = ReactDOM.findDOMNode(this.refs.id4);
          checkbox.checked = true;
          this.setState({ isDataAnalyst: 1})
          break;
        default:
      }

      this.setState({ roleId:e.target.value })
    }

    componentDidMount(){
console.log("component did mount");
        this.setState({});
    }

    componentWillUnmount(){
console.log("component will  UNmount");
    }

    componentDidUpdate ()
    	{
        console.log("component did update");
        console.log("state", this.state);
    	    if (this.defaultValuesSet === false)
    	    {
            let user = JSON.parse(localStorage.getItem("loggedInUser"));
            console.log("user", user);
  	        this.defaultValuesSet= true;

            /* Now we can set the default values for the form fields. */

            this.refs.firstName.value = user.firstName;
            this.refs.middleName.value = user.middleName;
  	        this.refs.email.value = user.email;
            this.refs.emailVerified.checked = user.emailVerified;
            this.setState({
              id: user.id,
              firstName: user.firstName,
              middleName: user.middleName
            });
            console.log("setting defaults");
    	    }
    	}

    render(){
console.log("render");

        return(
          <div>
              <form onSubmit={this.submitForm.bind(this)}>

                <p>Complete your profile with the following optional information. Providing your real name might help other users trust you more.</p>

                <div>
                  <div>
                    <input
                        id = "firstName"
                        type = "text"
                        ref = "firstName"
                        onBlur = { (e) => this.setState({ firstName:e.target.value})}>
                    </input>
                    <label htmlFor="firstName">First Name</label>
                  </div>
                </div>
                <div>
                  <div>
                    <input
                        id = "middleName"
                        type = "text"
                        ref = "middleName"
                        onBlur = { (e) => this.setState({ middleName:e.target.value})}>
                    </input>
                    <label htmlFor="middleName">Middle Name</label>
                  </div>
                </div>
                <div>
                  <div>
                    <input
                        id = "last_name"
                        type = "text"
                        ref = "last_name"
                        onBlur = { (e) => this.setState({ last_name:e.target.value})}>
                    </input>
                    <label htmlFor="last_name">Last Name</label>
                  </div>
                </div>
                <div>
                  <div>
                    <input
                        id = "email"
                        type = "text"
                        ref = "email"
                        disabled>
                    </input>
                    <label htmlFor="email">Email</label>
                  </div>
                </div>
                <div>
                  <div>
                    <input id="emailVerified" type="checkbox" ref="emailVerified" disabled/>
                    <label htmlFor="emailVerified">Email Verified</label>
                  </div>
                </div>
                <div>
                  <div>
                    <input id="isDeveloper" type="checkbox" ref="id2" onChange={this.handleCheckBoxes.bind(this)}/>
                    <label htmlFor="isDeveloper">Developer</label>
                  </div>
                </div>
                <div>
                  <div>
                    <input id="isTrader" type="checkbox" ref="id3" onChange={this.handleCheckBoxes.bind(this)}/>
                    <label htmlFor="isTrader">Trader</label>
                  </div>
                </div>
                <div>
                  <div>
                    <input id="isDataAnalyst" type="checkbox" ref="id4" onChange={this.handleCheckBoxes.bind(this)}/>
                    <label htmlFor="isDataAnalyst">Data Analyst</label>
                  </div>
                </div>
                <div>
                    <select id="role" ref="select" onChange={this.handleSelect.bind(this)}>
                        { this.displayRoles() }
                    </select>
                    <label htmlFor="role">Current Role:</label>
                </div>

                <div>
                    <button>Update</button>
                </div>
              </form>
            </div>


        );
    }
}

export default compose(
  graphql(getRolesQuery, {name: "getRolesQuery"}),
  graphql(updateUserMutation, {name: "updateUserMutation"})
) (UserUpdate); // This technique binds more than one query to a single component.
