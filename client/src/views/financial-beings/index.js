import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'

import { TopBar } from '../common'
import ManageFBList from './components/ManageFBList'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

const FinancialBeings = ({ classes }) => (
  <div>
    <TopBar size='medium' title='Manage Your Financial Beings' text='Manage your Advanced Algos Financial Beings' />
    <ManageFBList />
  </div>
)

FinancialBeings.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(FinancialBeings)
