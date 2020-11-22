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
    this.state = { name: '' };
  }

  render() {
    const { name } = this.state;
    const { closeDialogs } = this.props;
    return (
      <Dialog
      open={true}
      onClose={() => closeDialogs()}
      aria-labelledby='createFormula-dialog-title'
    >
        <DialogTitle id='createFormula-dialog-title'>
          Create a new formula
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            At least for now, all the formulas are publically available, creating it here will let you select it in the select element.
          </DialogContentText>

          <Mutation mutation={getOptionsCalls.EVENTS_CREATEFORMULA}
            update={(store, { data }) => {
              const { events_Formulas: formulas } = store.readQuery({
                query: getOptionsCalls.EVENTS_FORMULAS,
              });
              store.writeQuery({
                query: getOptionsCalls.EVENTS_FORMULAS,
                data: { events_Formulas: formulas.concat([data.events_CreateFormula]) },
              });
              closeDialogs();
            }
            }
          >
            {createFormula => (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  createFormula({
                    variables: {
                      formula: { name },
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
                <Button type='submit' variant='contained' color='secondary'>Create a new formula</Button>
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
