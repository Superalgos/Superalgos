import React from 'react';
import {
  Paper,
  Grid,
  Typography,
} from '@material-ui/core';
import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from 'react-sortable-hoc';

const DragHandle = SortableHandle(() => <div className='dragHandle' />);

const SortableItem = SortableElement(({ value, deletePrize, index }) => (
  <div className='sortableListItem'>
    <Grid container spacing={16}>
      <Grid item>
        <DragHandle />
      </Grid>
      <Grid item xs={12} sm container>
        <Grid item xs container direction="column" spacing={16}>
          <Typography gutterBottom variant="subtitle1">
            {value.from}{value.to}{value.additional}{value.amount}{value.asset}
          </Typography>
          <Typography color="textSecondary">
          </Typography>
        </Grid>
        <Grid item>
          <Typography style={{ cursor: 'pointer' }} onClick={() => deletePrize(index)} >Remove</Typography>
        </Grid>
      </Grid>
    </Grid>
  </div>
));

const SortableList = SortableContainer(({ items, deletePrize }) => (
  <div className='sortableList'>
    {items.map((value, index) => (
      <SortableItem key={`prize-${index}`} index={index} value={value} deletePrize={deleteId => deletePrize(deleteId)} />
    ))}
  </div>
));

class List extends React.Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    const newPrizes = this.props.prizes.slice(0);
    newPrizes.splice(newIndex, 0, newPrizes.splice(oldIndex, 1)[0]);
    this.props.edit(newPrizes);
  }

  deletePrize = (deletedIndex) => {
    const newPrizes = this.props.prizes.slice(0);
    newPrizes.splice(deletedIndex, 1);
    this.props.edit(newPrizes);
  }

  render() {
    return (
      <Paper>
        <SortableList
          items={this.props.prizes}
          onSortEnd={this.onSortEnd}
          useDragHandle={true}
          deletePrize={deleteId => this.deletePrize(deleteId)}
        />
      </Paper>
    );
  }
}

export default List;
