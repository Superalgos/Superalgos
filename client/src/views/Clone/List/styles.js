const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: 10,
    margin: 10
  },
  image: {
    width: 128,
    height: '100%',
    cursor: 'default'
  },
  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: '100%',
    maxHeight: '100%'

  },
  buttonList: {
    margin: theme.spacing.unit,
    float: 'right',
  },
  buttonGrid: {
    marginTop: -20,
  },
  button: {
    display: 'block',
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  textField: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
  },
  textArea: {
    marginLeft: theme.spacing.unit,
    marginRight: theme.spacing.unit,
    whiteSpace: 'pre',
    overflowY:'auto',
    overflowX:'hidden'
  },
  heading: {
    fontSize: theme.typography.pxToRem(18),
    flexBasis: '33.33%',
    fontWeight: '600'
  },
  helper: {
    borderLeft: `2px solid ${theme.palette.divider}`,
    padding: `0px ${theme.spacing.unit * 2}px`,
  },
  logsDialog:{
    width:'1750px',
    overflowY:'auto',
    overflowX:'hidden'
  },
  details:{
    display:'flex'
  },
  column2: {
    flexBasis: '50%',
    maxWidth: '50%'
  },
  column3: {
    flexBasis: '33.33%',
    maxWidth: '33.33%'
  },
  cloneInfoTitle:{
    fontWeight: '600',
    flexBasis: '100%',
    maxWidth: '100%'
  },
  cloneInfoBold:{
    fontWeight: '600',
    paddingLeft: '10px',
    paddingTop: '10px'
  },
  cloneInfoNormal:{
    paddingLeft: '10px',
    paddingTop: '10px'
  },
})

export default styles
