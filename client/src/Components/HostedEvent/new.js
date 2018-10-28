import React from 'react'
import { Mutation } from 'react-apollo'
import { HOSTS_HOSTEVENT, HOSTS_EVENTSBYHOST } from './graphql'

/*
import classNames from 'classnames'
import {
  Button,
  TextField
} from '@material-ui/core'
*/

class New extends React.Component {
  render () {
    let name
    let description
    let startDatetime
    let finishDatetime
    // const { classes } = this.props
    return (
      <Mutation mutation={HOSTS_HOSTEVENT}
        update={(store, { data }) => {
          const { hosts_EventsByHost: hostedEvents } = store.readQuery({ query: HOSTS_EVENTSBYHOST })
          store.writeQuery({
            query: HOSTS_EVENTSBYHOST,
            data: { hosts_EventsByHost: hostedEvents.concat([data.hosts_HostEvent]) }
          })
        }
        }
      >
        {(hostEvent, { data }) => (
          <div className='container'>
            <form
              onSubmit={e => {
                e.preventDefault()
                hostEvent({ variables: {
                  name: name.value,
                  description: description.value,
                  startDatetime: parseInt(startDatetime.value, 10),
                  finishDatetime: parseInt(finishDatetime.value, 10)
                } })
                this.props.handleNewEventClose()
              }}
            >
              <input
                ref={node => {
                  name = node
                }}
              />
              <input
                ref={node => {
                  description = node
                }}
              />
              <input
                type='number'
                ref={node => {
                  startDatetime = node
                }}
              />
              <input
                type='number'
                ref={node => {
                  finishDatetime = node
                }}
              />
              <button type='submit'>Create New Project</button>
            </form>
            <div className='form-close' onClick={() => this.clearTempStates()} />
          </div>
        )}
      </Mutation>
    )
  }
}

export default New
