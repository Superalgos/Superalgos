const styles = theme => ({
  root: {
    flexGrow: 1,
    width: '100%',
    backgroundColor: theme.palette.background.paper,
    padding: 0,
    margin: 0,
  },
  tabTitle: {
    width: '25%',
    maxWidth: 'none',
  },
  clickable: {
    cursor: 'pointer',
  },
  buttonList: {
    margin: theme.spacing.unit,
    float: 'right',
  },
  buttonGrid: {
    marginTop: -20,
  },
  title: {
    marginTop: 20,
  },
  paperRoot: {
    flexGrow: 1,
    padding: 10,
    marginTop: 25,
    marginBottom: 25,
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
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  bottomButton: {
    padding: 15,
    margin: 20,
  },
});

export default styles;
