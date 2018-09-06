import React, { Component } from 'react';
import {graphql, compose} from 'react-apollo';
import {getRolesQuery, addUserMutation, getUsersQuery} from '../queries/queries';

class AddUser extends Component {
  constructor(props){
  super(props);
  this.state = {
      alias: '',
      authId: '1'
    };
  }

    submitForm(e){
      console.log(this.state);
      e.preventDefault();
      this.props.addUserMutation({
        variables: {
          alias: this.state.alias,
          authId: this.state.authId
        },
        refetchQueries: [{ query: getUsersQuery}] // This allow us to re run whatever queries are necesary after the mutation.
      });
    }

    render(){
        return(
          <div className="row">
              <form className="col s12" onSubmit={this.submitForm.bind(this)}>
                <p>Choose an Alias that will identify you anonimously across the whole Advanced Algos ecosystem. Choose it carefully, since the the Alias can not be changed later.</p>
                <div className="row">
                  <div className="input-field col s6">
                    <input id="alias" type="text" className="validate" onChange={ (e) => this.setState({ alias:e.target.value})}/>
                    <label htmlFor="alias">Alias</label>
                  </div>
                </div>
                <div className="row">
                    <button>Next</button>
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
