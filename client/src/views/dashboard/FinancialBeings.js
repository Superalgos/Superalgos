import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import { MessageCard } from '@advancedalgos/web-components'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

const FinancialBeings = ({ classes }) => (
  <div>
    <Typography variant='display1' gutterBottom>
      Financial Beings
    </Typography>
    <div className={classes.tableContainer}>
      <MessageCard message='Coming soon. View your financial beings by team.' />
    </div>
  </div>
)

FinancialBeings.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(FinancialBeings)
