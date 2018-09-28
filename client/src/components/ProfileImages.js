import React from 'react';
import {graphql, compose} from 'react-apollo'
import {updateUserImagesMutation, getUsersQuery} from '../queries/queries'
import Avatar from '@material-ui/core/Avatar';
import classNames from 'classnames';

import ReactFilestack from 'filestack-react'

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
  }
})

class ProfileImages extends React.Component {

  constructor (props) {
    super(props)

    this.defaultValuesSet = false

    this.state = {
      avatarHandle: '',
      avatarChangeDate: '',
      newAvatarHandle: '',
      saveDisabled: true,
      uploadToolDisabled: false,
      showNewAvatar: false,
      needToWait: false,
      removeCurrentAvatar: false
    }
  }

  submitForm (e) {
    e.preventDefault()
    this.props.updateUserImagesMutation({
      variables: {
        id: this.state.id,
        avatarHandle: this.state.newAvatarHandle,
        avatarChangeDate: this.state.avatarChangeDate
      },
      refetchQueries: [{ query: getUsersQuery}] // This allow us to re run whatever queries are necesary after the mutation.
    })

    this.setState({saveDisabled: true, removeCurrentAvatar:true})

    /* Before we are done, we need to update the state of the local storage. */

    let user = JSON.parse(localStorage.getItem('loggedInUser'))

    user.avatarHandle = this.state.newAvatarHandle
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

          /* Here we will check that the user does not change the avatar more often than once a day. */

          let avatarChangeDate = (new Date(user.avatarChangeDate)).valueOf()
          let now = (new Date()).valueOf()
          let timePassed = now - avatarChangeDate
          let oneDay = 1000 * 60 * 60 * 24

 

          if (timePassed < oneDay) {
            this.setState({
              needToWait: true
            })
          } else {
            this.setState({
              needToWait: false
            })
          }

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

    let localDate = new Date()
    let currentDate = new Date(Date.UTC(
      localDate.getUTCFullYear(),
      localDate.getUTCMonth(),
      localDate.getUTCDate(),
      localDate.getUTCHours(),
      localDate.getUTCMinutes(),
      localDate.getUTCSeconds(),
      localDate.getUTCMilliseconds())
    )

    currentDate.toISOString()

    this.setState(
      {
        newAvatarHandle: handle,
        avatarChangeDate: currentDate,
        showNewAvatar: true,
        uploadToolDisabled: true,
        saveDisabled: false
      }
    )
  }

  onError = (err) => {
    console.log('onError')
    console.log(err)
  }

  onRemoveSuccess = (err) => {
    console.log('onRemoveSuccess')
    console.log(err)
  }

  showCurrentAvatar() {

      const { classes } = this.props

      if (this.state.removeCurrentAvatar === false) {

        return (
          <div>
            <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
            This is your current Avatar:
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
          </div>
        )

      } else {

        return (
          <div>
          <ReactFilestack
            apikey={'AH97QJOXTHwdBXjydQgABz'}
            mode="remove"
            options={options}
            fileHandle={this.state.avatarHandle}
            onSuccess={this.onRemoveSuccess}
            onError={this.onError}
            link
          ></ReactFilestack>
          </div>
        )
      }


  }

  showNewAvatar() {
    if (this.state.showNewAvatar === true) {
      const { classes } = this.props
      return (
        <div>
          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
          This is how your new avatar will look like. Press save to proceed with the change.
          </Typography>

          <Grid container justify='center' >
            <Grid item>
              <Avatar
                alt="Avatar"
                src={"https://cdn.filestackcontent.com/"  + this.state.newAvatarHandle}
                className={classNames(classes.bigAvatar)}
              />
            </Grid>
          </Grid>
        </div>
      )
    }
  }

  showUploadTool() {
    const { classes } = this.props
    if (this.state.needToWait === true) {
      return (
        <div>
          <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
          You updated your Avatar in the last 24 hours. As a protection against denial of service attacks, the system does not allow users to update their Avatar in less than 24 hs since their last update. Please come back tomorrow.
          </Typography>
        </div>
      )
    } else {
      return(
        <div>
        <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
        If you want, you can choose a new one by picking an image from your computer, camera or the web, and crop it with the following tool.
        </Typography>
            <Grid container justify='center' >
              <Grid item>
                <Button
                  disabled={this.state.uploadToolDisabled}
                  variant='contained'
                  color='secondary'
                  className={classes.button}>
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
      )
    }
  }

  render() {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <Typography className={classes.typography} variant='headline' gutterBottom>
              Profile Images
        </Typography>
        <form onSubmit={this.submitForm.bind(this)}>

          {this.showCurrentAvatar()}
          {this.showUploadTool()}
          {this.showNewAvatar()}

          <Grid container justify='center' >
            <Grid item>
              <Button
                disabled={this.state.saveDisabled}
                variant='contained'
                color='secondary'
                className={classes.button}
                onClick={this.submitForm.bind(this)}
                >Save</Button>
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
)(ProfileImages) // This technique binds more than one query to a single component.
