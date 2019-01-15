import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getUserProfileQuery} from '../queries/queries'

// Materia UI

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

// Images
import UserDefaultPicture from '../img/user-default-pic.jpg'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 60,
    margin: 2
  },
  card: {
    maxWidth: 500,
    minWidth: 500,
    paddingTop: '30'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop: '30',
    minWidth: '80%'
  },
  grid: {
    paddingTop: '30',
    marginTop: '30'
  },
  typography: {
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  }

})

class UserProfile extends Component {

  displayNames () {
    const user = this.props.data.users_User
    const { classes } = this.props

    if (user.firstName !== null && user.lastName !== null) {
      return (
        <Typography className={classes.typography} gutterBottom variant='h5' component='h2'>
          { user.firstName + ' ' + user.lastName}
        </Typography>
      )
    }
  }

  displayRole () {
    const user = this.props.data.users_User
    const { classes } = this.props

    if (user.role.name !== null && user.role.name !== 'Not Defined') {
      return (
        <div>
          <Divider />
          <Typography className={classes.typography} align='left' gutterBottom variant='subtitle1' component='h2'>
            { user.role.name }
          </Typography>
        </div>
      )
    }
  }

  displayBio () {
    const user = this.props.data.users_User
    const { classes } = this.props

    if (user.bio !== null && user.bio !== '') {
      return (
        <div>
          <Divider />
          <Typography className={classes.typography} component='p'>
            { user.bio }
          </Typography>
        </div>
      )
    }
  }

  displayUserProfile () {
    const user = this.props.data.users_User
    const { classes } = this.props

    if (user) {
      return (
        <Grid key={user.id} item>

          <Card className={classes.card} onClick={(e) => {
            this.setState({ selected: user.id})
          }
          }>
            <CardActionArea>
              <CardMedia
                className={classes.media}
                image={UserDefaultPicture}
                title='User Profile'

              />
              <CardContent>

                {this.displayNames()}

                <Typography className={classes.typography} gutterBottom variant='h6' component='h3'>
                  {user.alias}
                </Typography>

                {this.displayRole()}
                {this.displayBio()}

              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      )
    } else {
      return (<div>No User selected...</div>)
    }
  }

  render () {
    return (
      <Grid container justify='center' spacing={24}>
        {this.displayUserProfile()}
      </Grid>
    )
  }
}

export default compose(
  graphql(getUserProfileQuery, { // What follows is the way to pass a parameter to a query.
    options: (props) => {
      return {
        variables: {
          name: 'getUserProfileQuery',
          id: props.userId
        }
      }
    }}),
  withStyles(styles)
)(UserProfile) // This technique binds more than one query to a single component.
