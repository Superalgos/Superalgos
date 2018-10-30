import React from 'react'
import { Query } from 'react-apollo'

import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core'

import { withStyles } from '@material-ui/core/styles'
import styles from './styles'

import { hostedEventsCalls } from '../GraphQL/Calls/index'

import New from './New'
import Event from './Event'

class HostedEvent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isNewEventOpen: false
    }
  }

  handleNewEvent = (event) => {
    this.props.history.push(`/event/${event.designator}/edit`)
  };

  render () {
    const { classes } = this.props
    return (
      <React.Fragment>
        <Query
          query={hostedEventsCalls.HOSTS_EVENTSBYHOST}
        >
          {({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`
            const list = data.hosts_EventsByHost.map((event, index) => {
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

        <React.Fragment>
          <Button variant='contained' color='secondary'
            aria-label='addNewEvent' className={classes.centered}
            onClick={() => { this.setState({ isNewEventOpen: true }) }} >
                Host another event
          </Button>
          <Dialog
            open={this.state.isNewEventOpen}
            onClose={() => { this.setState({ isNewEventOpen: false }) }}
            aria-labelledby='addEvent-dialog-title'
          >
            <DialogTitle id='addEvent-dialog-title'>
                  Host an event
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                    Here you will add just the minimal information, will be settable in the edit page of your event.
              </DialogContentText>
              <New handleNewEvent={this.handleNewEvent} classes={classes} />
            </DialogContent>
          </Dialog>
        </React.Fragment>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(HostedEvent)
