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
      additional: '',
      amount: 0,
      asset: '',
    };
  }

  render() {
    const {
      from, to, additional, amount, asset,
    } = this.state;
    const { addPrize, closeDialogs } = this.props;
    return (
      <Dialog
        open={true}
        onClose={() => closeDialogs()}
        aria-labelledby='addPrize-dialog-title'
      >
        <DialogContent>
          <DialogContentText>
            Prizes are define textually only. In case of infringement, contact us.
          </DialogContentText>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              addPrize({
                from,
                to,
                additional,
                amount,
                asset,
              });
            }}
          >
            <DialogTitle>
             Conditions :
            </DialogTitle>
            <DialogContentText>
              Examples :
              If you want to make a price for the best bot only, you set both from and to rank to 1.
              If you want the rest of the top 10 to get a price, you add a new price with from rank set to 2 and to rank set to 10.
              Caution :
              - Leaving &quot;from rank&quot; empty considers it to 0.
              - Leaving &quot;to rank&quot; empty considers it as infinite
              - Prizes are define in an additive manner, meaning that if a team qualifies for two prices, it gets both.
              - Additional allows you to write addionnal textual condition, like &quot;positive ROI only&quot; for example.
            </DialogContentText>

            <TextField
              label='From rank'
              value={from}
              onChange={e => this.setState({ from: e.target.value })}
              type="number"
            />
            <TextField
              label='To rank'
              value={to}
              onChange={e => this.setState({ to: e.target.value })}
              type="number"
            />
            <TextField
              label='Additional'
              value={additional}
              onChange={e => this.setState({ additional: e.target.value })}
              fullWidth
            />
            <DialogContentText>
              Pool :
            </DialogContentText>
            <DialogContentText>
              Here you define the pool, the amount is a number whereas asset is a text. For example 1BTC, 200$, or whatever.
            </DialogContentText>
            <TextField
              label='Amount'
              value={amount}
              onChange={e => this.setState({ amount: e.target.value })}
              type="number"
            />
            <TextField
              label='Asset'
              value={asset}
              onChange={e => this.setState({ asset: e.target.value })}
            />
            <Button type='submit' variant='contained' color='secondary'>Create a new prize</Button>
          </form>
          <Button onClick={() => closeDialogs()} variant='contained' color='primary'>Close</Button>
        </DialogContent>
      </Dialog>
    );
  }
}

export default New;
