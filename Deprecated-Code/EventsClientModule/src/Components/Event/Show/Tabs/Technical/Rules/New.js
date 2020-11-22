import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  Button,
  TextField,
} from '@material-ui/core';

class New extends React.Component {
  constructor() {
    super();
    this.state = {
      title: '',
      description: '',
    };
  }

  render() {
    const {
      title, description,
    } = this.state;
    const { addRule, closeDialogs } = this.props;
    return (
      <Dialog
        open={true}
        onClose={() => closeDialogs()}
        aria-labelledby='addRule-dialog-title'
      >
        <DialogTitle id='addRule-dialog-title'>
          Create a new rule
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Rules are define textually only. In case of infringement, contact us.
          </DialogContentText>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addRule(
                title,
                description,
              );
            }}
          >
            <TextField
              label='Title'
              value={title}
              onChange={e => this.setState({ title: e.target.value })}
              fullWidth
            />
            <TextField
              label='Description'
              value={description}
              onChange={e => this.setState({ description: e.target.value })}
              fullWidth
            />
            <Button type='submit' variant='contained' color='secondary'>Create a new rule</Button>
          </form>
          <Button onClick={() => closeDialogs()} variant='contained' color='primary'>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }
}

export default New;
