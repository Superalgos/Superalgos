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
    console.log(this.props.team)
    const { classes } = this.props
    const { name, members, profile, createdAt } = this.props.team
    let avatar
    let banner
    if (profile.avatar !== undefined && profile.avatar !== 'a') {
      avatar = profile.avatar
    } else {
      avatar = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EAvatar%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
    }
    if (profile.banner !== undefined && profile.banner !== 'a') {
      banner = profile.banner
    } else {
      banner = 'data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22800%22%20height%3D%22200%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20xmlns%3Asvg%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23banner_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%3E%3Ctitle%3EBanner%20Placeholder%3C%2Ftitle%3E%3Crect%20stroke%3D%22null%22%20id%3D%22svg_1%22%20fill%3D%22%2355595c%22%20height%3D%22200%22%20width%3D%22800%22%2F%3E%3Cg%20stroke%3D%22null%22%20id%3D%22banner_164edaf95ee%22%3E%3Ctext%20stroke%3D%22null%22%20id%3D%22svg_3%22%20y%3D%22106.5%22%20x%3D%22367.73438%22%3EBanner%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E'
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
                <Typography variant='title' id='form-dialog-title'>
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
                  variant='display3'
                  align='center'
                  color='textPrimary'
                  gutterBottom
                >
                  {name}
                </Typography>
                <Typography variant='subheading' color='textSecondary'>
                  {createdAt}
                </Typography>
                <Typography variant='subheading' color='textSecondary'>
                  Motto: {profile.motto}
                </Typography>
                <Typography variant='subheading' color='textSecondary'>
                  Description: {profile.description}
                </Typography>
                <Typography variant='subheading' paragraph gutterBottom>
                  Members: {members.length}
                </Typography>
                <Typography variant='subheading' color='primary'>
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
