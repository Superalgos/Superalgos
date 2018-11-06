const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  flex: {
    flexGrow: 1,
    marginLeft: 30,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  cssRoot: {
    color: '#FFFFFF',
    backgroundColor: theme.palette.secondary,
    '&:hover': {
      backgroundColor: theme.palette.dark,
    },
    whiteSpace: 'nowrap',
    paddingRight: 2 * theme.spacing.unit,
    paddingLeft: 2 * theme.spacing.unit,
  },
  button: {
    margin: theme.spacing.unit,
  },
  leftIcon: {
    marginRight: theme.spacing.unit,
  },
  rightIcon: {
    marginLeft: theme.spacing.unit,
  },
  iconSmall: {
    fontSize: 20,
  },
});

export default styles;
