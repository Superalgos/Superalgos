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

const SortableItem = SortableElement(({ value, deleteRule, index }) => (
  <div className='sortableListItem'>
    <Grid container spacing={16}>
      <Grid item>
        <DragHandle />
      </Grid>
      <Grid item xs={12} sm container>
        <Grid item xs container direction="column" spacing={16}>
          <Typography gutterBottom variant="subtitle1">
            {value.title}
          </Typography>
          <Typography color="textSecondary">
            {value.description}
          </Typography>
        </Grid>
        <Grid item>
          <Typography style={{ cursor: 'pointer' }} onClick={() => deleteRule(index)} >Remove</Typography>
        </Grid>
      </Grid>
    </Grid>
  </div>
));

const SortableList = SortableContainer(({ items, deleteRule }) => (
  <div className='sortableList'>
    {items.map((value, index) => (
      <SortableItem key={`rule-${index}`} index={index} value={value} deleteRule={deleteId => deleteRule(deleteId)} />
    ))}
  </div>
));

class List extends React.Component {
  onSortEnd = ({ oldIndex, newIndex }) => {
    const newRules = this.props.rules.slice(0);
    newRules.splice(newIndex, 0, newRules.splice(oldIndex, 1)[0]);
    this.props.edit(newRules);
  }

  deleteRule = (deletedIndex) => {
    const newRules = this.props.rules.slice(0);
    newRules.splice(deletedIndex, 1);
    this.props.edit(newRules);
  }

  render() {
    return (
      <Paper>
        <SortableList
          items={this.props.rules}
          onSortEnd={this.onSortEnd}
          useDragHandle={true}
          deleteRule={deleteId => this.deleteRule(deleteId)}
        />
      </Paper>
    );
  }
}

export default List;
