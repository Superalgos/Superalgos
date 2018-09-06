import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import {graphql, compose} from 'react-apollo';
import {getRolesQuery, updateUserMutation, getUsersQuery} from '../queries/queries';

class UpdateUser extends Component {
  constructor(props){
  super(props);
  this.state = {
      id: '5b90fc33ae71ee3798b2317d', // TODO this Id is the one that should be available to all components after the validation that the user is authenticated.
      firstName: '',
      lastName: '',
      isDeveloper: 0,
      isTrader: 0,
      isDataAnalyst: 0,
      roleId: '1'
    };
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
      console.log(this.state);
      e.preventDefault();
      this.props.updateUserMutation({
        variables: {
          id: this.state.id,
          firstName: this.state.firstName,
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

    render(){
        return(
          <div className="row">
              <form className="col s12" onSubmit={this.submitForm.bind(this)}>
                <p>Complete your profile with the following optional information. Providing your real name might help other users trust you more.</p>
                <div className="row">
                  <div className="input-field col s6">
                    <input id="firstName" type="text" className="validate" onChange={ (e) => this.setState({ firstName:e.target.value})}/>
                    <label htmlFor="firstName">First Name</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s6">
                    <input id="last_name" type="text" className="validate" onChange={ (e) => this.setState({ lastName:e.target.value})}/>
                    <label htmlFor="last_name">Last Name</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="isDeveloper" type="checkbox" ref="id2" onChange={this.handleCheckBoxes.bind(this)}/>
                    <label htmlFor="isDeveloper">Developer</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="isTrader" type="checkbox" ref="id3" onChange={this.handleCheckBoxes.bind(this)}/>
                    <label htmlFor="isTrader">Trader</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="isDataAnalyst" type="checkbox" ref="id4" onChange={this.handleCheckBoxes.bind(this)}/>
                    <label htmlFor="isDataAnalyst">Data Analyst</label>
                  </div>
                </div>
                <div className="row">
                    <select id="role" ref="select" onChange={this.handleSelect.bind(this)}>
                        { this.displayRoles() }
                    </select>
                    <label htmlFor="role">Current Role:</label>
                </div>

                <div className="row">
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
) (UpdateUser); // This technique binds more than one query to a single component.
