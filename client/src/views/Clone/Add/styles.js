const styles = theme => ({
  root: {
    width: '100%',
    flexGrow: 1,
    padding: 10,
    marginTop: '5%',
    marginBottom: '10%'
  },
  container: {
    display: 'flex',
    flexWrap: 'wrap',
    padding: 20,
    height: '100%'
  },
  textField: {
    width: '80%',
    marginLeft: '10%',
    marginBottom: 10
  },
  actionButton: {
    textAlign: 'center',
    marginTop: 10
  },
  typography: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 20
  },
  form: {
    marginTop: 20
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  }
})

export default styles
