import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import Card from '@material-ui/core/Card'
import CardContent from '@material-ui/core/CardContent'

const styles = theme => ({
  card: {
    display: 'flex',
    width: '100%',
    margin: '1.5em',
    padding: '3em'
  },
  cardDetails: {
    display: 'flex',
    flex: 1
  },
  cardContent: {
    flex: 1
  }
})

export const MessageCard = ({ classes, message, children }) => (
  <Card className={classes.card}>
    <div className={classes.cardDetails}>
      <CardContent className={classes.cardContent}>
        <Typography variant='headline' align='center' gutterBottom>
          {message}
        </Typography>
        {children}
      </CardContent>
    </div>
  </Card>
)

MessageCard.propTypes = {
  children: PropTypes.node,
  classes: PropTypes.object.isRequired,
  message: PropTypes.string
}

export default withStyles(styles)(MessageCard)
