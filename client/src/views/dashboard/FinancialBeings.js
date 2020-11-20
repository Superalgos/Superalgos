import React from 'react'
import PropTypes from 'prop-types'

import Typography from '@material-ui/core/Typography'
import { withStyles } from '@material-ui/core/styles'

import ManageFBList from './components/ManageFBList'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

const FinancialBeings = ({ classes }) => (
  <div>
    <Typography variant='h4' gutterBottom>
      Financial Beings
    </Typography>
    <ManageFBList />
  </div>
)

FinancialBeings.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(FinancialBeings)
