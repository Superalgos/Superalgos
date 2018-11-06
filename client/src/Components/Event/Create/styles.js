const styles = theme => ({
  root: {
    width: '50%',
    flexGrow: 1,
    padding: 10,
    marginLeft: '25%',
    marginTop: '2%',
  },
  inputField: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 25,
  },
  typography: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 40,
  },
  checkbox: {
    width: 150,
    marginLeft: '0%',
    marginTop: 20,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  button: {
    margin: theme.spacing.unit,
    marginTop: theme.spacing.unit * 3,
  },
  img: {
    display: 'block',
    marginTop: 20,
    maxWidth: 120,
    maxHeight: 24,
  },
});

export default styles;
