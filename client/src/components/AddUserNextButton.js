import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';

const styles = theme => ({
  button: {
    margin: theme.spacing.unit,
  },
  input: {
    display: 'none',
  },
});

function AddUserNextButton(props) {
  const { classes } = props;
  return (
    <div>
      <Button type="submit" variant="contained" color="primary" className={classes.button}>
        Next
      </Button>
    </div>
  );
}

AddUserNextButton.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(AddUserNextButton);
