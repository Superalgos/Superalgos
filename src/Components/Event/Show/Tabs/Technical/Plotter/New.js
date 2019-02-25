import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  TextField,
} from '@material-ui/core';

import { Mutation } from 'react-apollo';
import { getOptionsCalls } from '../../../../../../GraphQL/Calls/index';

class New extends React.Component {
  constructor() {
    super();
    this.state = {
      name: '',
      host: '',
      repo: '',
      moduleName: '',
    };
  }

  render() {
    const {
      name, host, repo, moduleName,
    } = this.state;
    const { closeDialogs } = this.props;
    return (
      <Dialog
      open={true}
      onClose={() => closeDialogs()}
      aria-labelledby='createPlotter-dialog-title'
    >
        <DialogTitle id='createPlotter-dialog-title'>
          Create a new plotter
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            At least for now, all the plotters are publically available, creating it here will let you select it in the select element.
          </DialogContentText>

          <Mutation mutation={getOptionsCalls.EVENTS_CREATEPLOTTER}
            update={(store, { data }) => {
              const { events_Plotters: plotters } = store.readQuery({
                query: getOptionsCalls.EVENTS_PLOTTERS,
              });
              store.writeQuery({
                query: getOptionsCalls.EVENTS_PLOTTERS,
                data: { events_Plotters: plotters.concat([data.events_CreatePlotter]) },
              });
              closeDialogs();
            }
            }
          >
            {createPlotter => (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createPlotter({
                    variables: {
                      plotter: {
                        name,
                        host,
                        repo,
                        moduleName,
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
                  label='Host'
                  value={host}
                  onChange={e => this.setState({ host: e.target.value })}
                  fullWidth
                />
                <TextField
                  label='Repository'
                  value={repo}
                  onChange={e => this.setState({ repo: e.target.value })}
                  fullWidth
                />
                <TextField
                  label='Module Name'
                  value={moduleName}
                  onChange={e => this.setState({ moduleName: e.target.value })}
                  fullWidth
                />
                <Button type='submit' variant='contained' color='secondary'>Create a new plotter</Button>
              </form>
            )}
          </Mutation>
          <Button onClick={() => closeDialogs()} variant='contained' color='primary'>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }
}

export default New;
