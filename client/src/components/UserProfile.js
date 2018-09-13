import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getUserProfileQuery} from '../queries/queries'

// Materia UI

import { withStyles } from '@material-ui/core/styles'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

// Images
import PortraitImage from '../img/portrait.jpg'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 60,
    margin: 2
  },
  card: {
    maxWidth: 800,
    paddingTop: '30'
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop: '30'
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

  displayUserProfile () {
    const {user} = this.props.data
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
                image={PortraitImage}
                title='User Profile'

              />
              <CardContent>
                <Typography className={classes.typography} gutterBottom variant='headline' component='h2'>
                  { user.firstName } { user.lastName } ( {user.alias} )
                </Typography>
                <Divider />

                <Typography className={classes.typography} align='left' gutterBottom variant='subheading' component='h2'>
                  { user.role.name }
                </Typography>
                <Divider />

                <Typography className={classes.typography} component='p'>
                  I am a computer nerd passionate about crypto trading. I entered the crypto space in 2013 and since then I ve been participating in quite a few crypto open source projects.
                </Typography>
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
    const { classes } = this.props
    return (
      <Paper className={classes.root}>
        <Grid container justify='center' spacing={24}>
          {this.displayUserProfile()}
        </Grid>
      </Paper>
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
