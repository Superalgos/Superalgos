import React, { Component } from 'react'
import { NavLink } from 'react-router-dom'
import { compose } from 'recompose'
import { withStyles } from '@material-ui/core/styles'
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid'

// Images
import AALogo from '../img/aa-logo.png'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 100
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: 120,
    maxHeight: 24
  },
  button: {
    margin: theme.spacing.unit
  }
})

class Footer extends Component {

  constructor (props) {
    super(props)
    this.state = {
      selected: '',
      user: null
    }
  }
  render () {
    const { classes } = this.props
    return (

      <Grid className={classes.button} container justify='center' spacing={24}>
        <Grid item>
          <Button color='primary' className={classes.button}>
            <NavLink color='inherit' exact to='/'>Home</NavLink>
          </Button>
        </Grid>
        <Grid item>
          <Button color='primary' className={classes.button}>
            <NavLink to='/browse'>Browse</NavLink>
          </Button>
        </Grid>
        <Grid item>
          <Button color='primary' className={classes.button}>
            <NavLink to='/search'>Search</NavLink>
          </Button>
        </Grid>
        <Grid item>
          <Button color='primary' className={classes.button}>
            <a href='http://www.advancedalgos.net'><img className={classes.img} alt='complex' src={AALogo} /></a>
          </Button>
        </Grid>
        <Grid item>
          <Button color='primary' className={classes.button}>
            <NavLink color='inherit' exact to='/contact'>Contact</NavLink>
          </Button>
        </Grid>
        <Grid item>
          <Button color='primary' className={classes.button}>
            <NavLink to='/about'>About</NavLink>
          </Button>
        </Grid>
        <Grid item>
          <Button color='primary' className={classes.button}>
            <NavLink to='/modules'>Modules</NavLink>
          </Button>
        </Grid>
      </Grid>

    )
  }
}

export default compose(
  withStyles(styles)
)(Footer)
