import React, { Component } from 'react'
import PropTypes from 'prop-types'

// Materia UI

import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import Typography from '@material-ui/core/Typography'
import Divider from '@material-ui/core/Divider'

// Images

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 60,
    margin: 2
  },
  card: {
    maxWidth: 240,
    minWidth: 240,
    paddingTop: '30'
  },
  media: {
    paddingTop: '56.25%', // 16:9,
    marginTop: '30',
    width: 100,
    height: 100,
    maxWidth: 100
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
  render () {
    const { classes, user, toggleDrawer } = this.props
    return (
      <Grid container justify='center' spacing={24}>
        <Grid key={user.id} item>

          <Card className={classes.card}>
            <CardContent>
              <Button
                onClick={toggleDrawer}
                color='inherit'
              >
                Close Profile
              </Button>
              <CardMedia
                className={classes.media}
                image='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
                title='User Profile'

              />
              <Typography className={classes.typography} gutterBottom variant='headline' component='h2'>
                { user.firstName } { user.lastName } ( {user.alias} )
              </Typography>
              <Divider />

              <Typography className={classes.typography} align='left' gutterBottom variant='subheading' component='h2'>
                { user.role.name }
              </Typography>
              <Divider />

              <Typography className={classes.typography} component='p'>
                { user.bio }
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    )
  }
}

UserProfile.propTypes = {
  classes: PropTypes.object.isRequired,
  user: PropTypes.object,
  toggleDrawer: PropTypes.func
}
export default withStyles(styles)(UserProfile)
