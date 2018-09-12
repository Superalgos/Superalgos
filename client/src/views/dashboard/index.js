import React from 'react'
import PropTypes from 'prop-types'
import { graphql } from 'react-apollo'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'
import Drawer from '@material-ui/core/Drawer'
import List from '@material-ui/core/List'
import Divider from '@material-ui/core/Divider'
import Grid from '@material-ui/core/Grid'
import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'
import CardMedia from '@material-ui/core/CardMedia'
import CardActions from '@material-ui/core/CardActions'
import Button from '@material-ui/core/Button'

import { MainDrawerItems, SecondaryDrawerItems } from './components/DrawerLinks'
import { CreateTeamDialog } from './components/CreateTeam'

import { CreateTeamMutation } from '../../graphql/teams/CreateTeamMutation'

import aaweb from '../../assets/AlgonetWebPlatform.jpg'

const drawerWidth = 240

const styles = theme => ({
  root: {
    display: 'flex'
  },
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1
  },
  drawerPaper: {
    position: 'relative',
    width: drawerWidth,
    whiteSpace: 'nowrap',
    zIndex: 1000
  },
  content: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.default,
    padding: theme.spacing.unit * 3,
    height: '100vh',
    overflow: 'auto',
    width: `calc(90% - ${drawerWidth}px)`
  },
  appBarSpacer: theme.mixins.toolbar,
  tableContainer: {
    height: 320
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
  cardMedia: {
    flex: 1,
    width: 160,
    height: 160,
    justifyContent: 'flex-start'
  },
  aawebMedia: {
    width: '100%',
    height: 320
  },
  buttonRight: {
    justifyContent: 'flex-end'
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  }
})

const Dashboard = ({ classes, createTeamMutation, ...props }) => (
  <div className={classes.root}>
    <Drawer
      variant='permanent'
      classes={{
        paper: classes.drawerPaper
      }}
    >
      <div className={classes.appBarSpacer} />
      <List>{MainDrawerItems}</List>
      <Divider />
      <List>{SecondaryDrawerItems}</List>
    </Drawer>
    <main className={classes.content}>
      <div className={classes.appBarSpacer} />
      <Grid container spacing={24} className={classes.cardGrid}>
        <Grid item md={6}>
          <Typography variant='display1' gutterBottom>
            Teams
          </Typography>
          <Grid container spacing={24} className={classes.cardGrid}>
            <Grid item>
              <Card className={classes.card}>
                <div className={classes.cardDetails}>
                  <CardContent className={classes.createCardContent}>
                    <CreateTeamDialog classes={classes} createTeamMutation={createTeamMutation} />
                  </CardContent>
                </div>
              </Card>
            </Grid>
            <Grid item>
              <Card className={classes.card}>
                <div className={classes.cardDetails}>
                  <CardMedia
                    className={classes.cardMedia}
                    image='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E' // eslint-disable-line max-len
                    title='Image title'
                  />
                  <CardContent className={classes.cardContent}>
                    <Typography variant='headline'>Goodester</Typography>
                    <Typography variant='subheading' color='textSecondary'>
                      09.15.2018
                    </Typography>
                    <Typography variant='subheading' paragraph>
                      Members:6
                    </Typography>
                    <Typography variant='subheading' color='primary'>
                      Now recruiting!
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size='small'
                      color='primary'
                      className={classes.buttonRight}
                    >
                      Details
                    </Button>
                  </CardActions>
                </div>
              </Card>
            </Grid>
            <Grid item>
              <Card className={classes.card}>
                <div className={classes.cardDetails}>
                  <CardMedia
                    className={classes.cardMedia}
                    image='data:image/svg+xml;charset=UTF-8,%3Csvg%20width%3D%22288%22%20height%3D%22225%22%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20288%20225%22%20preserveAspectRatio%3D%22none%22%3E%3Cdefs%3E%3Cstyle%20type%3D%22text%2Fcss%22%3E%23holder_164edaf95ee%20text%20%7B%20fill%3A%23eceeef%3Bfont-weight%3Abold%3Bfont-family%3AArial%2C%20Helvetica%2C%20Open%20Sans%2C%20sans-serif%2C%20monospace%3Bfont-size%3A14pt%20%7D%20%3C%2Fstyle%3E%3C%2Fdefs%3E%3Cg%20id%3D%22holder_164edaf95ee%22%3E%3Crect%20width%3D%22288%22%20height%3D%22225%22%20fill%3D%22%2355595c%22%3E%3C%2Frect%3E%3Cg%3E%3Ctext%20x%3D%2296.32500076293945%22%20y%3D%22118.8%22%3EThumbnail%3C%2Ftext%3E%3C%2Fg%3E%3C%2Fg%3E%3C%2Fsvg%3E' // eslint-disable-line max-len
                    title='Image title'
                  />
                  <CardContent className={classes.cardContent}>
                    <Typography variant='headline'>Goodester</Typography>
                    <Typography variant='subheading' color='textSecondary'>
                      09.15.2018
                    </Typography>
                    <Typography variant='subheading' paragraph>
                      Members:6
                    </Typography>
                    <Typography variant='subheading' color='primary'>
                      Now recruiting!
                    </Typography>
                  </CardContent>
                  <CardActions>
                    <Button
                      size='small'
                      color='primary'
                      className={classes.buttonRight}
                    >
                      Details
                    </Button>
                  </CardActions>
                </div>
              </Card>
            </Grid>
          </Grid>
        </Grid>
        <Grid item md={6}>
          <Typography variant='display1' gutterBottom>
            Develop
          </Typography>
          <Grid container spacing={24} className={classes.cardGrid}>
            <Grid item md={12}>
              <Card className={classes.mainFeaturedPost}>
                <CardMedia
                  className={classes.aawebMedia}
                  image={aaweb}
                  title='Image title'
                />
                <CardContent>
                  <Typography variant='title' color='inherit' aligh='right'>
                    <Button>Start Developing ></Button>
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </main>
  </div>
)

Dashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  createTeamMutation: PropTypes.function
}

const CreateTeamDialogWithMutation = graphql(CreateTeamMutation, {
  name: 'createTeamMutation' // name of the injected prop: this.props.createTeamMutation...
})(Dashboard)

export default withStyles(styles)(CreateTeamDialogWithMutation)
