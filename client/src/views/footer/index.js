import React from 'react'
import PropTypes from 'prop-types'
import { NavLink } from 'react-router-dom'
import { withStyles } from '@material-ui/core/styles'
import classNames from 'classnames'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'

import aalogo from '../../assets/logos/advanced-algos/aa-logo-vert.svg'

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

const Footer = ({ classes }) => {
  return (
    <footer className={classNames(classes.footer, classes.layout)}>
      <Grid
        container
        spacing={32}
        justify='space-evenly'
        className={classNames(classes.footerContainer)}
      >
        <Grid item xs>
          <Typography variant='title' color='textPrimary' gutterBottom>
            Pages
          </Typography>
          <NavLink to='/' className={classNames(classes.footerLink)}>
            <Typography variant='subheading' color='textSecondary'>
              Home
            </Typography>
          </NavLink>
          <NavLink to='/browse' className={classNames(classes.footerLink)}>
            <Typography variant='subheading' color='textSecondary'>
              Users
            </Typography>
          </NavLink>
          <NavLink to='/about' className={classNames(classes.footerLink)}>
            <Typography variant='subheading' color='textSecondary'>
              About
            </Typography>
          </NavLink>
        </Grid>
        <Grid item xs>
          <a
            href='https://t.me/advancedalgoscommunity'
            target='_blank>'
            className={classNames(classes.footerLink)}
          >
            <Typography variant='title' color='textPrimary' gutterBottom>
              Support
            </Typography>
          </a>
          <a
            href='https://advancedalgos.net/documentation-quick-start.shtml'
            target='_blank>'
            className={classNames(classes.footerLink)}
          >
            <Typography variant='subheading' color='textSecondary'>
              Documentation
            </Typography>
          </a>
          <NavLink to='/' className={classNames(classes.footerLink)}>
            <Typography variant='subheading' color='textSecondary'>
              Telegram
            </Typography>
          </NavLink>
        </Grid>
        <Grid item xs>
          <Typography variant='title' color='textPrimary' gutterBottom>
            Modules
          </Typography>
          <NavLink to='/' className={classNames(classes.footerLink)}>
            <Typography variant='subheading' color='textSecondary'>
              Teams
            </Typography>
          </NavLink>
          <NavLink to='/' className={classNames(classes.footerLink)}>
            <Typography variant='subheading' color='textSecondary'>
              Users
            </Typography>
          </NavLink>
          <NavLink to='/' className={classNames(classes.footerLink)}>
            <Typography variant='subheading' color='textSecondary'>
              KeyVault
            </Typography>
          </NavLink>
        </Grid>
        <Grid item xs>
          <NavLink to='/'>
            <img src={aalogo} width={98} height={140} />
          </NavLink>
        </Grid>
      </Grid>
    </footer>
  )
}

Footer.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(Footer)
