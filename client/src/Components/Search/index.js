import React from 'react'
import { Query } from 'react-apollo'
import { DateTime } from 'luxon'

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
          const now = ~~(DateTime.local().valueOf() / 1000)
          const inTwoWeeks = ~~(DateTime.local().plus({ weeks: 2 }).valueOf() / 1000)

          const IncomingEvents = data.hosts_Events.filter(event => event.startDatetime > now && event.startDatetime < inTwoWeeks)
          const OngoingEvents = data.hosts_Events.filter(event => event.finishDatetime > now && event.startDatetime < now)
          const FutureEvents = data.hosts_Events.filter(event => event.startDatetime > now)
          const PastEvents = data.hosts_Events.filter(event => event.finishDatetime < now)

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
                {value === 0 && <TabContainer><Incoming IncomingEvents={IncomingEvents} OngoingEvents={OngoingEvents} /></TabContainer>}
                {value === 1 && <TabContainer><Future FutureEvents={FutureEvents} /></TabContainer>}
                {value === 2 && <TabContainer><History /></TabContainer>}
                {value === 3 && <TabContainer><Past PastEvents={PastEvents} /></TabContainer>}
              </div>
            </React.Fragment>
          )
        }}
      </Query>
    )
  }
}

export default withStyles(styles)(Search)
