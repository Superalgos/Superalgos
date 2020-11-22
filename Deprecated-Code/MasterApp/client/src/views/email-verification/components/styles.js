import lightGreen from '@material-ui/core/colors/lightGreen'

const styles = theme => ({
  textLight: {
    color: theme.palette.primary.light
  },
  textWhite: {
    color: theme.palette.common.white
  },
  textSuccess: {
    color: lightGreen[400]
  },
  copyright: {
    paddingTop: theme.spacing.unit * 3
  },
  linkLight: {
    color: theme.palette.secondary.main,
    textDecoration: 'none'
  },
  signupRight: {
    marginTop: theme.spacing.unit * 2,
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center'
    }
  },
  signupContainer: {
    marginBottom: theme.spacing.unit * 2,
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center'
    }
  },
  signupTitle: {
    fontSize: '25px',
    marginBottom: theme.spacing.unit * 5
  },
  signupText: {
    fontSize: '16px'
  },
  signupInput: {
    borderRadius: 4,
    backgroundColor: theme.palette.common.white,
    border: '1px solid #ced4da',
    fontSize: 20,
    padding: '10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    marginRight: theme.spacing.unit * 1
  },
  signupInputSubmit: {
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 20,
    lineHeight: '1.1875em',
    color: theme.palette.common.white,
    padding: '10px 12px',
    backgroundColor: '#5bc0de',
    borderColor: '#46b8da',
    '&:hover': {
      backgroundColor: '#31b0d5',
      borderColor: '#269abc'
    },
    '&:active': {
      boxShadow: 'none',
      backgroundColor: '#0062cc',
      borderColor: '#005cbf'
    },
    '&:focus': {
      boxShadow: '0 0 0 0.2rem rgba(0,123,255,.5)'
    }
  }
})

export default styles
