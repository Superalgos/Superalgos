import React from 'react'
import { Query } from 'react-apollo'
import { HOSTS_EVENTSBYHOST } from './graphql'

import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@material-ui/core'

import { withStyles } from '@material-ui/core/styles'
import styles from './styles'

import New from './New'

class HostedEvent extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      isNewEventOpen: false
    }
  }

  handleNewEventOpen = () => {
    this.setState({ isNewEventOpen: true })
  };

  handleNewEventClose = () => {
    this.setState({ isNewEventOpen: false })
  };

  render () {
    const { classes } = this.props
    return (
      <React.Fragment>
        <Query
          query={HOSTS_EVENTSBYHOST}
        >
          {({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`
            const list = data.hosts_EventsByHost.map((event, index) => {
              return (
                <div key={index}>
                  {event.name}
                </div>
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
            onClick={this.handleNewEventOpen} >
                Host another event
          </Button>
          <Dialog
            open={this.state.isNewEventOpen}
            onClose={this.handleNewEventClose}
            aria-labelledby='addEvent-dialog-title'
          >
            <DialogTitle id='addEvent-dialog-title'>
                  Host an event
            </DialogTitle>
            <DialogContent>
              <DialogContentText>
                    Here you will add just the minimal information, will be settable in the edit page of your event.
              </DialogContentText>
              <New handleNewEventClose={this.handleNewEventClose} classes={classes} />
            </DialogContent>
          </Dialog>
        </React.Fragment>
      </React.Fragment>
    )
  }
}

export default withStyles(styles)(HostedEvent)
