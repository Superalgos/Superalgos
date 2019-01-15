import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withStyles } from '@material-ui/core/styles'

import Button from '@material-ui/core/Button'
import DetailsIcon from '@material-ui/icons/Details'
import Dialog from '@material-ui/core/Dialog'
import Typography from '@material-ui/core/Typography'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardActions from '@material-ui/core/CardActions'
import CardMedia from '@material-ui/core/CardMedia'

import log from '../../../utils/log'

const styles = theme => ({
  dialogContainer: {
    display: 'block',
    margin: '3em',
    minWidth: 400
  },
  buttonRight: {
    justifyContent: 'flex-end'
  },
  cardGrid: {
    padding: `${theme.spacing.unit * 8}px 0`
  },
  card: {
    display: 'flex',
    width: '100%'
  },
  cardDetails: {
    display: 'flex',
    flex: 1
  },
  cardContent: {
    flex: 1
  },
  cardAvatarMedia: {
    flex: 1,
    width: 100,
    height: 100,
    maxWidth: 100,
    justifyContent: 'flex-start'
  },
  cardBannerMedia: {
    flex: 1,
    width: 600,
    height: 150,
    justifyContent: 'flex-start'
  }
})

export class ManageTeamDetails extends Component {
  constructor (props) {
    super(props)

    this.handleClickOpen = this.handleClickOpen.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.state = {
      open: false
    }
  }

  render () {
    log.debug(this.props.team)
    const { classes } = this.props
    const { name, members, profile, createdAt } = this.props.team
    let avatar
    let banner
    if (profile.avatar !== undefined && profile.avatar !== null) {
      avatar = profile.avatar
    } else {
      avatar = process.env.STORAGE_URL + '/module-teams/module-default/aa-avatar-default.png'
    }
    if (profile.banner !== undefined && profile.banner !== null) {
      banner = profile.banner
    } else {
      banner = process.env.STORAGE_URL + '/module-teams/module-default/aa-banner-default.png'
    }
    return (
      <div>
        <Button
          size='small'
          color='primary'
          className={this.props.classes.buttonRight}
          onClick={this.handleClickOpen}
        >
          <DetailsIcon /> Details
        </Button>
        <Dialog
          open={this.state.open}
          onClose={this.handleClose}
          aria-labelledby='form-dialog-title'
        >
          <div classes={classes.dialogContainer}>
            <Card className={classes.card}>
              <CardContent>
                <Typography variant='h6' id='form-dialog-title'>
                  {name} Team Details
                </Typography>
                <CardMedia
                  className={classes.cardBannerMedia}
                  image={banner}
                  title={`${name} ${banner}`}
                />
                <CardMedia
                  className={classes.cardAvatarMedia}
                  image={avatar}
                  title={`${name} ${avatar}`}
                />
                <Typography
                  variant='h2'
                  align='center'
                  color='textPrimary'
                  gutterBottom
                >
                  {name}
                </Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                  {createdAt}
                </Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                  Motto: {profile.motto}
                </Typography>
                <Typography variant='subtitle1' color='textSecondary'>
                  Description: {profile.description}
                </Typography>
                <Typography variant='subtitle1' paragraph gutterBottom>
                  Members: {members.length}
                </Typography>
                <Typography variant='subtitle1' color='primary'>
                  Team Admin:&nbsp;
                  {members.map(member => {
                    if (member.role === 'OWNER' || member.role === 'ADMIN') {
                      if (member.member !== null &&
                      member.member.alias !== undefined &&
                      member.member.alias !== null
                      ) {
                        return member.member.alias
                      }
                    }
                  })}
                </Typography>
                <CardActions>
                  <Button onClick={this.handleClose} color='primary'>
                    Close
                  </Button>
                </CardActions>
              </CardContent>
            </Card>
          </div>
        </Dialog>
      </div>
    )
  }

  handleClickOpen () {
    this.setState({ open: true })
  }

  handleClose () {
    this.setState({ open: false })
  }
}

ManageTeamDetails.propTypes = {
  classes: PropTypes.object.isRequired,
  team: PropTypes.any
}

export default withStyles(styles)(ManageTeamDetails)
