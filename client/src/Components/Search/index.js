import React from 'react'
import { Query } from 'react-apollo'

import {
  Typography,
  AppBar,
  Tabs,
  Tab
} from '@material-ui/core'
import {
  GetApp as IncomingIcon,
  AlarmAdd as FutureIcon,
  History as HistoryIcon
} from '@material-ui/icons'

import { withStyles } from '@material-ui/core/styles'
import styles from './styles'

import { listEventsCalls } from '../../GraphQL/Calls/index'

import {
  Future,
  History,
  Incoming,
  Past
} from './Tabs'
import Event from './Event'

function TabContainer (props) {
  return (
    <Typography component='div' style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  )
}

class Search extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      value: 0
    }
  }

  handleChange = (event, value) => {
    this.setState({ value })
  }

  render () {
    const classes = this.props.classes
    const { value } = this.state
    return (
      <Query
        query={listEventsCalls.HOSTS_EVENTS}
      >
        {({ loading, error, data }) => {
          if (loading) return 'Loading...'
          if (error) return `Error! ${error.message}`
          const list = data.hosts_Events.map((event, index) => {
            return (
              <Event key={index} event={event} />
            )
          })
          return (
            <React.Fragment>
              <div className={classes.root}>
                <AppBar position='static' color='default'>
                  <Tabs
                    value={value}
                    onChange={this.handleChange}
                    scrollable
                    scrollButtons='off'
                    indicatorColor='primary'
                    textColor='primary'
                  >
                    <Tab
                      className={classes.tabTitle}
                      label='Ongoing &amp; Incoming'
                      icon={<IncomingIcon />}
                    />
                    <Tab
                      className={classes.tabTitle}
                      label='Future'
                      icon={<FutureIcon />}
                    />
                    <Tab
                      className={classes.tabTitle}
                      label='Your history'
                      icon={<HistoryIcon />}
                    />
                    <Tab
                      className={classes.tabTitle}
                      label='Past'
                      icon={<HistoryIcon />}
                    />
                  </Tabs>
                </AppBar>
                {value === 0 && <TabContainer><Incoming /></TabContainer>}
                {value === 1 && <TabContainer><Future /></TabContainer>}
                {value === 2 && <TabContainer><History /></TabContainer>}
                {value === 3 && <TabContainer><Past /></TabContainer>}
              </div>
              { list }
            </React.Fragment>
          )
        }}
      </Query>
    )
  }
}

export default withStyles(styles)(Search)
