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
  card: {
    flexGrow: 1,
    padding: 20,
    marginTop: 20,
    marginBottom: 20,
    marginLeft: 400,
    marginRight: 400,
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
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
  bottomButton: {
    padding: 15,
    margin: 20,
  },
});

export default styles;
