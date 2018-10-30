import React from 'react'
import { Link } from 'react-router-dom'

import {
  Grid, Paper,
  Typography,
  Button
} from '@material-ui/core'
import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 20,
    margin: 10
  },
  image: {
    width: 128,
    height: '100%',
    cursor: 'default'
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%'

  },
  buttonList: {
    margin: theme.spacing.unit,
    float: 'right'
  },
  buttonGrid: {
    marginTop: -20
  }

})

class Event extends React.Component {
  render () {
    const classes = this.props.classes
    const {
      name,
      designator,
      startDatetime,
      finishDatetime,
      host,
      description
    } = this.props.event
    return (
      <Paper className={classes.root}>
        <Grid container spacing={16}>
          <Grid item xs>
            <Typography gutterBottom variant='headline'> {name} </Typography>
            <Typography gutterBottom>From : {startDatetime} </Typography>
            <Typography gutterBottom>To : {finishDatetime} </Typography>
          </Grid>
          <Grid item xs>
            <Typography gutterBottom>Hosted by: {host.alias} ({host.lastName} {host.firstName}) </Typography>
            <Typography gutterBottom>Formula: </Typography>
            <Typography gutterBottom>First prize: </Typography>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction='column' spacing={16}>
              <Grid item xs>
                <Typography gutterBottom variant='headline'> Description : </Typography>
                <Typography gutterBottom> {description} </Typography>
              </Grid>
              <Grid item className={classes.buttonGrid}>
                <Button
                  className={classes.buttonList}
                  variant='outlined'
                  color='primary'
                  size='small'
                  component={Link}
                  to={'/event/' + designator}
                >
                  Show
                </Button>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    )
  }
}

export default withStyles(styles)(Event)
