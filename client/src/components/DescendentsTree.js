import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getDescendentsQuery} from '../queries/queries'

// Materia UI

import { withStyles } from '@material-ui/core/styles'
import Card from '@material-ui/core/Card'
import CardActionArea from '@material-ui/core/CardActionArea'
import CardActions from '@material-ui/core/CardActions'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Button from '@material-ui/core/Button'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import TextField from '@material-ui/core/TextField'

// components
import UserProfile from './UserProfile'

// Images
import PortraitImage from '../img/portrait.jpg'

const styles = theme => ({
  card: {
    maxWidth: 150,
    minWidth: 150,
    paddingTop: '30',
    marginBottom: 40
  },
  media: {
    height: 0,
    paddingTop: '56.25%', // 16:9,
    marginTop: '30',
    minWidth: 300
  },
  typography: {
    maxWidth: 345,
    minWidth: 300,
    paddingTop: '30'
  },
  appBar: {
    position: 'relative'
  },
  flex: {
    flex: 1
  },
  grid: {
    paddingTop: '30',
    marginTop: 30
  },
  inputField: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 25
  },
  formTypography: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 40
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3
  }
})

class DescendentsTree extends Component {

  constructor (props) {
    super(props)

    this.state = {
      alias: '',
      firstName: '',
      middleName: '',
      lastName: ''
    }
  }

  displayDescendents () {
    let data = this.props.data
    const { classes } = this.props

    if (data.loading) {
      return (<div> Loading Descendents... </div>)
    } else {
      if (data.descendents === undefined) {
        return (<div> No Descendents to Display </div>)
      } else {
        return data.descendents.map(descendent => {
          return (

            <Grid key={descendent.id} item>
              <Card className={classes.card} onClick={(e) => {
                this.setState({ selected: descendent.id})
              }
            }>
                <CardActionArea>
                  <CardMedia
                    className={classes.media}
                    image={PortraitImage}
                    title='User Profile'

                />
                  <CardContent>
                    <Typography gutterBottom variant='headline' component='h2'>
                      {descendent.alias}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Grid container justify='center' spacing={8}>
                    <Grid item />
                  </Grid>
                </CardActions>
              </Card>
            </Grid>

          )
        })
      }
    }
  }

  render () {
    const { classes } = this.props
    return (
      <div>
        <Grid container className={classes.grid} justify='center' spacing={24}>
          {this.displayDescendents()}
        </Grid>
      </div>
    )
  }
}

export default compose(
  graphql(getDescendentsQuery, { // What follows is the way to pass a parameter to a query.
    options: (props) => {
      return {
        variables: {
          name: 'getDescendentsQuery',
          id: props.userId
        }
      }
    }}),
  withStyles(styles)
)(DescendentsTree) // This technique binds more than one query to a single component.
