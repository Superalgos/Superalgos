import React, { Component } from 'react'
import {graphql, compose} from 'react-apollo'
import {getUsersBySearchFields} from '../queries/queries'

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

class YourDescendents extends Component {

  constructor (props) {
    super(props)

    this.state = {
      alias: '',
      firstName: '',
      middleName: '',
      lastName: ''
    }
  }

  submitForm (e) {
    e.preventDefault()

    this.props.getUsersBySearchFields.variables.alias = this.state.alias
    this.props.getUsersBySearchFields.variables.firstName = this.state.firstName
    this.props.getUsersBySearchFields.variables.middleName = this.state.middleName
    this.props.getUsersBySearchFields.variables.lastName = this.state.lastName

    this.props.getUsersBySearchFields.refetch({})
  }

  displayUsers () {
    let data = this.props.getUsersBySearchFields
    const { classes } = this.props

    if (data.loading) {
      return (<div> Loading Users... </div>)
    } else {
      if (data.usersSearch === undefined) {
        return (<div> No Users to Display </div>)
      } else {
        return data.usersSearch.map(user => {
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
                    <Typography gutterBottom variant='headline' component='h2'>
                      {user.alias}
                    </Typography>
                  </CardContent>
                </CardActionArea>
                <CardActions>
                  <Grid container justify='center' spacing={8}>
                    <Grid item>
                      {this.selectButton(user)}
                    </Grid>
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
        <form onSubmit={this.submitForm.bind(this)}>

          <Typography className={classes.formTypography} variant='body1' gutterBottom align='left'>
           These are your decendents within the project. Your children referred you as the one who brought them to the project, while
           your grandchildren referred your children and so on.
          </Typography>

          <Grid container justify='center' >
            <Grid item>
              <Button variant='contained' color='secondary' className={classes.button} onClick={this.submitForm.bind(this)}>Search</Button>
            </Grid>
          </Grid>
        </form>

        <Grid container className={classes.grid} justify='center' spacing={24}>
          {this.displayUsers()}
        </Grid>
      </div>
    )
  }
}

export default compose(
  graphql(getUsersBySearchFields, {name: 'getUsersBySearchFields'}),
  withStyles(styles)
)(YourDescendents) // This technique binds more than one query to a single component.
