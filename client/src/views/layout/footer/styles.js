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
    paddingTop: theme.spacing.unit * 9,
    fontSize: '16px'
  },
  linkLight: {
    color: theme.palette.secondary.main,
    textDecoration: 'none'
  },
  descriptionLeft: {
    marginLeft: 0,
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center'
    }
  },
  descriptionText: {
    fontSize: '16px'
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
  footer: {
    borderTop: `4px solid ${theme.palette.secondary.light}`,
    padding: `${theme.spacing.unit * 6}px 0`,
    backgroundColor: '#19191C' /* #29292c */,
    color: theme.palette.primary.light
  },
  footerContainer: {
    width: 'auto',
    [theme.breakpoints.up(1200 + theme.spacing.unit * 3 * 2)]: {
      width: 1200,
      marginLeft: 'auto',
      marginRight: 'auto'
    }
  },
  footerLogo: {
    marginBottom: theme.spacing.unit * 2
  },
  footerLink: {
    textDecoration: 'none',
    '&:hover': {
      color: theme.palette.secondary.light
    }
  },
  footerInputRoot: {
    'label + &': {
      marginTop: theme.spacing.unit * 3
    },
    [theme.breakpoints.down('xs')]: {
      textAlign: 'center'
    }
  },
  footerInput: {
    borderRadius: 4,
    backgroundColor: theme.palette.common.white,
    border: '1px solid #ced4da',
    fontSize: 16,
    padding: '10px 12px',
    transition: theme.transitions.create(['border-color', 'box-shadow']),
    marginRight: theme.spacing.unit * 1
  },
  footerInputSubmit: {
    boxShadow: 'none',
    textTransform: 'none',
    fontSize: 16,
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
  },
  icon: {
    margin: theme.spacing.unit * 1,
    fontSize: 30
  },
  iconHover: {
    margin: theme.spacing.unit * 1,
    '&:hover': {
      color: theme.palette.secondary.light
    }
  }
})

export default styles
