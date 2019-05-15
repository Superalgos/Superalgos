import React from 'react'
import PropTypes from 'prop-types'

import { withStyles } from '@material-ui/core/styles'

import { BannerTopBar } from '../common'
import ManageFBList from './components/ManageFBList'

const styles = theme => ({
  tableContainer: {
    height: 320
  }
})

const FinancialBeings = ({ classes }) => (
  <div>
    <BannerTopBar size='medium' title='Manage Your Financial Beings' text='Manage your Superalgos Financial Beings' backgroundUrl='https://superalgos.org/img/photos/teams.jpg' />
    <ManageFBList />
  </div>
)

FinancialBeings.propTypes = {
  classes: PropTypes.object.isRequired
}

export default withStyles(styles)(FinancialBeings)
