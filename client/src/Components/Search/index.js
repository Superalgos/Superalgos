import React from 'react'
import { Query } from 'react-apollo'

import { Typography } from '@material-ui/core'

import AppBar from '@material-ui/core/AppBar'
import Tabs from '@material-ui/core/Tabs'
import Tab from '@material-ui/core/Tab'
import ProfileSheetIcon from '@material-ui/icons/Create'
import ProfileImagesIcon from '@material-ui/icons/Wallpaper'
import YourReferrerIcon from '@material-ui/icons/AccessibilityNew'
import DescendentsIcon from '@material-ui/icons/DeviceHub'

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
                      icon={<ProfileSheetIcon />}
                    />
                    <Tab
                      className={classes.tabTitle}
                      label='Future'
                      icon={<ProfileImagesIcon />}
                    />
                    <Tab
                      className={classes.tabTitle}
                      label='Your history'
                      icon={<YourReferrerIcon />}
                    />
                    <Tab
                      className={classes.tabTitle}
                      label='Past'
                      icon={<DescendentsIcon />}
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
