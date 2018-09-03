import React, { Component } from 'react';
import {graphql, compose} from 'react-apollo';
import {getRolesQuery, addUserMutation, getUsersQuery} from '../queries/queries';

class AddUser extends Component {
  constructor(props){
  super(props);
  this.state = {
      alias: '',
      firstName: '',
      lastName: '',
      idRole: ''
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
      e.preventDefault();
      this.props.addUserMutation({
        variables: {
          alias: this.state.alias,
          firstName: this.state.firstName,
          lastName: this.state.lastName,
          roleId: this.state.roleId
        },
        refetchQueries: [{ query: getUsersQuery}] // This allow us to re run whatever queries are necesary after the mutation.
      });
    }
    render(){
        return(
            <form id="add-user" onSubmit={this.submitForm.bind(this)}>
                <div className="field">
                    <label>Alias:</label>
                    <input type="text" onChange={ (e) => this.setState({ alias:e.target.value})}/>
                </div>
                <div className="field">
                    <label>First Name:</label>
                    <input type="text" onChange={ (e) => this.setState({ firstName:e.target.value})}/>
                </div>
                <div className="field">
                    <label>Last Name:</label>
                    <input type="text" onChange={ (e) => this.setState({ lastName:e.target.value})}/>
                </div>
                <div className="field">
                    <label>Main Role:</label>
                    <select onChange={ (e) => this.setState({ roleId:e.target.value})}>                        
                        { this.displayRoles() }
                    </select>
                </div>
                <button>+</button>

            </form>
        );
    }
}

export default compose(
  graphql(getRolesQuery, {name: "getRolesQuery"}),
  graphql(addUserMutation, {name: "addUserMutation"})
) (AddUser); // This technique binds more than one query to a single component.
