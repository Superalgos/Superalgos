import React from 'react';
import { Mutation } from 'react-apollo';
import { DateTime } from 'luxon';

import {
  Button,
  TextField,
} from '@material-ui/core';
import { ChevronLeft, ChevronRight } from '@material-ui/icons';
import { DateTimePicker } from 'material-ui-pickers';
import { withStyles } from '@material-ui/core/styles';
import styles from './styles';

import { hostedEventsCalls } from '../../../GraphQL/Calls';

class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      description: '',
      startDatetime: DateTime.local().plus({ days: 1 }).startOf('day'),
      finishDatetime: DateTime.local().plus({ days: 8 }).startOf('day'),
    };
  }

  render() {
    const {
      name, description, startDatetime, finishDatetime,
    } = this.state;
    return (
      <Mutation mutation={hostedEventsCalls.EVENTS_CREATEEVENT}
        update={(store, { data }) => {
          this.props.history.push(`/edit/${data.events_CreateEvent.id}`);
        }
        }
      >
        {hostEvent => (
          <div className='container'>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                hostEvent({
                  variables: {
                    event: {
                      name,
                      description,
                      startDatetime: startDatetime.valueOf() / 1000,
                      finishDatetime: startDatetime.valueOf() / 1000,
                    },
                  },
                });
              }}
            >
              <TextField
                label='Name'
                value={name}
                onChange={e => this.setState({ name: e.target.value })}
                fullWidth
              />
              <TextField
                multiline
                label='Description'
                value={description}
                onChange={e => this.setState({ description: e.target.value })}
                fullWidth
              />
              <DateTimePicker
                autoOk
                disablePast
                format="DD' at 'HH:mm"
                ampm={false}
                showTabs={false}
                leftArrowIcon={<ChevronLeft />}
                rightArrowIcon={<ChevronRight />}
                value={startDatetime}
                onChange={date => this.setState({ startDatetime: date })}
                helperText='Competition start date'
              />
              <DateTimePicker
                autoOk
                disablePast
                format="DD' at 'HH:mm"
                ampm={false}
                showTabs={false}
                leftArrowIcon={<ChevronLeft />}
                rightArrowIcon={<ChevronRight />}
                value={finishDatetime}
                onChange={date => this.setState({ finishDatetime: date })}
                helperText='Competition finishing date'
              />
              <Button type='submit' variant='contained' color='secondary'>Create New Project</Button>
            </form>
            <div className='form-close' onClick={() => this.clearTempStates()} />
          </div>
        )}
      </Mutation>
    );
  }
}

export default withStyles(styles)(Create);
