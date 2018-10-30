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

import Event from './Event'

function TabContainer (props) {
  return (
    <Typography component='div' style={{ padding: 8 * 3 }}>
      {props.children}
    </Typography>
  )
}

class Search extends React.Component {
  state = {
    value: 0
  }

  handleChange = (event, value) => {
    this.setState({ value })
  }

  render () {
    const classes = this.props.classes
    const { value } = this.state
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
                label='Profile Sheet'
                icon={<ProfileSheetIcon />}
              />
              <Tab
                className={classes.tabTitle}
                label='Profile Images'
                icon={<ProfileImagesIcon />}
              />
              <Tab
                className={classes.tabTitle}
                label='Your Referrer'
                icon={<YourReferrerIcon />}
              />
              <Tab
                className={classes.tabTitle}
                label='Your Descendents'
                icon={<DescendentsIcon />}
              />
            </Tabs>
          </AppBar>
          {value === 0 && <TabContainer><p> hahah </p></TabContainer>}
          {value === 1 && <TabContainer><p> hoho </p></TabContainer>}
          {value === 2 && <TabContainer><p> hihi </p></TabContainer>}
          {value === 3 && <TabContainer><p> hehe </p></TabContainer>}
        </div>
        <Typography
          className={classes.title}
          variant='display1'
          align='center'
          color='textPrimary'
          gutterBottom
        >
          Enroll in an competition
        </Typography>
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
                { list }
              </React.Fragment>
            )
          }}
        </Query>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(Search)
