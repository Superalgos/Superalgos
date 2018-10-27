import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import aalogo from '../../assets/advanced-algos/aa-logo-vert.svg'

const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  layout: {
    width: 'auto',
    marginTop: theme.spacing.unit * 7,
    marginLeft: theme.spacing.unit * 3,
    marginRight: theme.spacing.unit * 3,
    [theme.breakpoints.up(1200 + theme.spacing.unit * 3 * 2)]: {
      width: 1200,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  footer: {
    borderTop: `1px solid ${theme.palette.divider}`,
    padding: `${theme.spacing.unit * 6}px 0`
  },
  footerContainer: {
    marginRight: theme.spacing.unit * 8,
    marginLeft: theme.spacing.unit * 8
  },
  footerLink: {
    textDecoration: 'none'
  }
})

class Footer extends Component {

  componentDidMount () {
    console.log('componentDidMount')
  }

  componentWillUnmount () {
    console.log('componentWillUnmount')
  }

  render () {
    let { classes } = this.props
    console.log('SHOW_FOOTER', window.SHOW_FOOTER)
    if (window.SHOW_FOOTER === false) {
      return (<div />)
    } else {
      return (
        <footer className={classNames(classes.footer, classes.layout)}>
          <Grid
            container
            spacing={32}
            justify='space-evenly'
            className={classNames(classes.footerContainer)}
        >
            <Grid item xs>
              <Typography variant='h6' color='textPrimary' gutterBottom>
              Pages
            </Typography>
              <NavLink to='/' className={classNames(classes.footerLink)}>
                <Typography variant='subtitle1' color='textSecondary'>
                Home
              </Typography>
              </NavLink>
              <NavLink to='/teams' className={classNames(classes.footerLink)}>
                <Typography variant='subtitle1' color='textSecondary'>
                Teams
              </Typography>
              </NavLink>
              <NavLink to='/key-vault' className={classNames(classes.footerLink)}>
                <Typography variant='subtitle1' color='textSecondary'>
                Key Vault
              </Typography>
              </NavLink>
            </Grid>
            <Grid item xs>
              <Typography variant='h6' color='textPrimary' gutterBottom>
              Support
            </Typography>

              <a
                href='https://advancedalgos.net/documentation-quick-start.shtml'
                target='_blank>'
                className={classNames(classes.footerLink)}
            >
                <Typography variant='subtitle1' color='textSecondary'>
                Documentation
              </Typography>
              </a>
              <a
                href='https://t.me/advancedalgoscommunity'
                target='_blank>'
                className={classNames(classes.footerLink)}
            >
                <Typography variant='subtitle1' color='textSecondary'>
                Telegram
              </Typography>
              </a>
            </Grid>
            <Grid item xs>
              <Typography variant='h6' color='textPrimary' gutterBottom>
              Modules
            </Typography>
              <a
                href='https://develop.advancedalgos.net'
                target='_blank>'
                className={classNames(classes.footerLink)}
            >
                <Typography variant='subtitle1' color='textSecondary'>
                Platform
              </Typography>
              </a>
              <a
                href='https://users.advancedalgos.net'
                target='_blank>'
                className={classNames(classes.footerLink)}
            >
                <Typography variant='subtitle1' color='textSecondary'>
                Users
              </Typography>
              </a>
              <a
                href='https://teams.advancedalgos.net'
                target='_blank>'
                className={classNames(classes.footerLink)}
            >
                <Typography variant='subtitle1' color='textSecondary'>
                Teams
              </Typography>
              </a>
              <a
                href='https://keyvault.advancedalgos.net'
                target='_blank>'
                className={classNames(classes.footerLink)}
            >
                <Typography variant='subtitle1' color='textSecondary'>
                Key Vault
              </Typography>
              </a>
            </Grid>
            <Grid item xs>
              <NavLink to='/'>
                <img alt='' src={aalogo} width={98} height={140} />
              </NavLink>
            </Grid>
          </Grid>
        </footer>
      )
    }
  }
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Footer)
