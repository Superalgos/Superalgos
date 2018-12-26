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
    padding: `${theme.spacing.unit}px ${theme.spacing.unit * 2}px`,
  },
  logsDialog:{
    width:'1750px',
    overflowY:'auto',
    overflowX:'hidden'
  },
  details:{
    display:'flex'
  },
  column: {
    flexBasis: '15%',
    maxWidth: '15%'
  },
  column2: {
    flexBasis: '42.5%',
    maxWidth: '42.5%'
  },
  column3: {
    flexBasis: '42.5%',
    maxWidth: '42.5%'
  },
  cloneInfo1:{
    fontWeight: '600',
    paddingLeft: '16px',
    paddingTop: '16px'
  },
  cloneInfo2:{
    paddingLeft: '16px',
    paddingTop: '16px'
  },
})

export default styles
