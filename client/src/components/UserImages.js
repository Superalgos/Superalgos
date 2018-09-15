import React from 'react';
import {graphql, compose} from 'react-apollo'
import {getRolesQuery, updateUserMutation, getUsersQuery} from '../queries/queries'

import ReactFilestack from 'filestack-react';

// Material-ui

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid'

const options = {
  accept: 'image/*',
  maxFiles: 5,
  storeTo: {
    location: 's3',
  },
};

const styles = theme => ({
  
  button: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3
  },
})

class UserImages extends React.Component {

  constructor (props) {
    super(props)
    this.state = {
      avatarHandle: ''
    }
  }
  
  onSuccess = (uploadResults) => {
    console.log('onSuccess')
    console.log(uploadResults)

    const handle = uploadResults.filesUploaded[0].handle
    this.setState({avatarHandle: handle})
  }

  onError = () => {
    console.log('onError')
  }

  render() {
    const { classes } = this.props
    return (
      <div>
        <Grid container justify='center' >
          <Grid item>
            <img  src="https://cdn.filestackcontent.com/fzcnGsUSAuHhQquYO48I" alt='1' />
            <img  src={"https://cdn.filestackcontent.com/"  + this.state.avatarHandle} alt='2' />
            <Button variant='contained' color='secondary' className={classes.button}>
              <ReactFilestack
                apikey={'AH97QJOXTHwdBXjydQgABz'}
                options={options}
                onSuccess={this.onSuccess}
                onError={this.onError}
                link
              >Pick your avatar bitch!</ReactFilestack>
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }
}

export default compose(
  graphql(getRolesQuery, {name: 'getRolesQuery'}),
  graphql(updateUserMutation, {name: 'updateUserMutation'}),
  withStyles(styles)
)(UserImages) // This technique binds more than one query to a single component.
