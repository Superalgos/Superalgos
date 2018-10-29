import React from 'react'

import { toLocalTime } from '../../utils'

import {
  Grid, Paper, Typography, Button,
  Dialog, DialogContent, DialogContentText, DialogTitle
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

class Competition extends React.Component {
  render () {
    const classes = this.props.classes
    const { displayName,
      startDatetime,
      finishDatetime,
      host,
      description,
      formula,
      prizes
    } = this.props.competition
    const firstPrice = prizes.find(prize => {
      return prize.position === 1
    })
    return (
      <Paper className={classes.root}>
        <Grid container spacing={16}>
          <Grid item xs>
            <Typography gutterBottom variant='headline'> { displayName } </Typography>
            <Typography gutterBottom>From : {toLocalTime(startDatetime)} </Typography>
            <Typography gutterBottom>To : {toLocalTime(finishDatetime)} </Typography>
          </Grid>
          <Grid item xs>
            <Typography gutterBottom>Hosted by: { host }</Typography>
            <Typography gutterBottom>Formula: { formula }</Typography>
            <Typography gutterBottom>First prize: { firstPrice ? firstPrice.algoPrize + ' ALGOS' : 'none' }</Typography>
          </Grid>
          <Grid item xs={12} sm container>
            <Grid item xs container direction='column' spacing={16}>
              <Grid item xs>
                <Typography gutterBottom variant='headline'> Description : </Typography>
                <Typography gutterBottom>{ description }</Typography>
              </Grid>
              <Grid item className={classes.buttonGrid}>
                <Button
                  className={classes.buttonList}
                  variant='outlined' color='primary' size='small'
                  onClick={() => this.auditLog()}
                >Apply</Button>
                <Button
                  className={classes.buttonList}
                  variant='outlined' color='primary' size='small'
                  onClick={() => this.editKey()}
                >Get details</Button>
                <Button
                  className={classes.buttonList}
                  variant='outlined' color='primary' size='small'
                  onClick={() => this.editKey()}
                >Edit</Button>

                <Dialog
                  aria-labelledby='addKey-dialog-title'
                >
                  <DialogTitle id='addKey-dialog-title'>
                      Edit Key
                  </DialogTitle>
                  <DialogContent>
                    <DialogContentText>
                        You will need to complete this form with the information from
                        the exchange.
                    </DialogContentText>

                    <p> some stuff </p>

                  </DialogContent>
                </Dialog>

                <Dialog
                  aria-labelledby='auditLog-dialog-title'
                >
                  <DialogTitle id='auditLog-dialog-title'>
                        Audit Log History
                  </DialogTitle>
                  <DialogContent>
                    <p> some stuff </p>
                  </DialogContent>
                </Dialog>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Paper>
    )
  }
}
export default withStyles(styles)(Competition)
