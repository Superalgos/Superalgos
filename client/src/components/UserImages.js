import React from 'react';
import {graphql, compose} from 'react-apollo'
import {updateUserImagesMutation, getUsersQuery} from '../queries/queries'
import Avatar from '@material-ui/core/Avatar';
import classNames from 'classnames';

import ReactFilestack from 'filestack-react'
import Portrait from '../img/portrait.jpg'

// Material-ui

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper'
import Grid from '@material-ui/core/Grid'
import Typography from '@material-ui/core/Typography'

const options = {
  accept: ['image/jpeg', 'image/jpg', 'image/png'],
  maxFiles: 1,
  imageDim: [300, 300],
  maxSize: 0.25 * 1024 * 1024, // 1/4 of 1 Mb
  storeTo: {
    location: 's3',
  },
};

const styles = theme => ({

  button: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3
  },
  row: {
  display: 'flex',
  justifyContent: 'center',
  },
  avatar: {
    margin: 10,
  },
  bigAvatar: {
    width: 60,
    height: 60,
  },
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

class UserImages extends React.Component {

  constructor (props) {
    super(props)
    
    this.defaultValuesSet = false

    this.state = {
      avatarHandle: '',
      avatarChangeDate: ''
    }
  }

  submitForm (e) {
    e.preventDefault()
    this.props.updateUserImagesMutation({
      variables: {
        id: this.state.id,
        avatarHandle: this.state.avatarHandle,
        avatarChangeDate: this.state.avatarChangeDate
      },
      refetchQueries: [{ query: getUsersQuery}] // This allow us to re run whatever queries are necesary after the mutation.
    })

      /* Before we are done, we need to update the state of the local storage. */

    let user = JSON.parse(localStorage.getItem('loggedInUser'))

    user.avatarHandle = this.state.avatarHandle
    user.avatarChangeDate = this.state.avatarChangeDate

    localStorage.setItem('loggedInUser', JSON.stringify(user))
  }

  componentWillMount ()    	{
          if (this.defaultValuesSet === false)    	    {
          let userData = localStorage.getItem('loggedInUser')

          if (userData === 'undefined') { return }

          let user = JSON.parse(userData)
            this.defaultValuesSet = true

          /* To avoid console warning, we need to take care of the fields that are null. */

          if (user.avatarHandle === null) { user.avatarHandle = '' }
          if (user.avatarChangeDate === null) { user.avatarChangeDate = '' }

          /* Now we are ready to set the initial state. */

          this.setState({
            id: user.id,
            avatarHandle: user.avatarHandle,
            avatarChangeDate: user.avatarChangeDate
          })
          }
      }
      
  onSuccess = (uploadResults) => {
    console.log('onSuccess')
    console.log(uploadResults)

    const handle = uploadResults.filesUploaded[0].handle
    const currentDate = (new Date()).toString();
    this.setState({avatarHandle: handle, avatarChangeDate: currentDate})
  }

  onError = () => {
    console.log('onError')
  }

  render() {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <Typography className={classes.typography} variant='headline' gutterBottom>
              Profile Images
        </Typography>
        <form onSubmit={this.submitForm.bind(this)}>

        <Grid container justify='center' >
          <Grid item>
            <Avatar
              alt="Avatar"
              src={Portrait}
              className={classNames(classes.bigAvatar)}
            />
          </Grid>
        </Grid>
        
        <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
        This is your current Avatar. If you want, you can choose a new one by picking an image from your computer, camera or the web, and crop it with the following tool.
        </Typography>

          <div>
            <Grid container justify='center' >
              <Grid item>
                                 
                <Button variant='contained' color='secondary' className={classes.button}>
                  <ReactFilestack
                    apikey={'AH97QJOXTHwdBXjydQgABz'}
                    options={options}
                    onSuccess={this.onSuccess}
                    onError={this.onError}
                    link
                  >File Upload Tool</ReactFilestack>
                </Button>
              </Grid>
            </Grid>
          </div>

          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
          This is how your new avatar will look like. Press save to proceed with the change.
          </Typography>

          <Grid container justify='center' >
            <Grid item>
              <Avatar
                alt="Avatar"
                src={"https://cdn.filestackcontent.com/"  + this.state.avatarHandle}
                className={classNames(classes.bigAvatar)}
              />
            </Grid>
          </Grid>

          <Grid container justify='center' >
            <Grid item>
              <Button variant='contained' color='secondary' className={classes.button} onClick={this.submitForm.bind(this)}>Save</Button>
            </Grid>
          </Grid>
        </form>
      </Paper>

    );
  }
}

export default compose(
  graphql(updateUserImagesMutation, {name: 'updateUserImagesMutation'}),
  withStyles(styles)
)(UserImages) // This technique binds more than one query to a single component.
