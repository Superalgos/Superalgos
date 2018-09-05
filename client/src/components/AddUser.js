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
      isDeveloper: '',
      isTrader: '',
      isDataAnalyst: '',
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
          isDeveloper: this.state.isDeveloper,
          isTrader: this.state.isTrader,
          isDataAnalyst: this.state.isDataAnalyst,
          roleId: this.state.roleId
        },
        refetchQueries: [{ query: getUsersQuery}] // This allow us to re run whatever queries are necesary after the mutation.
      });
    }
    render(){
        return(
          <div className="row">
              <form className="col s12" onSubmit={this.submitForm.bind(this)}>
                <div className="row">
                  <div className="input-field col s6">
                    <input id="alias" type="text" className="validate" onChange={ (e) => this.setState({ alias:e.target.value})}/>
                    <label htmlFor="alias">Alias</label>
                  </div>
                </div>
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
                    <input id="developer" type="checkbox" onChange={ (e) => this.setState({ isDeveloper:e.target.value})}/>
                    <label htmlFor="developer">Developer</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="trader" type="checkbox" onChange={ (e) => this.setState({ isTrader:e.target.value})}/>
                    <label htmlFor="trader">Trader</label>
                  </div>
                </div>
                <div className="row">
                  <div className="input-field col s12">
                    <input id="dataAnalyst" type="checkbox" onChange={ (e) => this.setState({ isDataAnalyst:e.target.value})}/>
                    <label htmlFor="dataAnalyst">Data Analyst</label>
                  </div>
                </div>
                <div className="row">
                    <select id="role" onChange={ (e) => this.setState({ roleId:e.target.value})}>
                        { this.displayRoles() }
                    </select>
                    <label htmlFor="role">Current Role:</label>
                </div>
                <div className="row">
                    <button>+</button>
                </div>
              </form>
            </div>


        );
    }
}

export default compose(
  graphql(getRolesQuery, {name: "getRolesQuery"}),
  graphql(addUserMutation, {name: "addUserMutation"})
) (AddUser); // This technique binds more than one query to a single component.
