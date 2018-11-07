const styles = theme => ({
  '@global': {
    body: {
      backgroundColor: theme.palette.common.white
    }
  },
  root: {
    flexGrow: 1
  },
  colorDefault: {
    color: '#000'
  },
  flex: {
    flexGrow: 1
  },
  toolbarTitle: {
    flex: 1
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20
  },
  appBar: {
    position: 'relative'
  },
  img: {
    display: 'block',
    maxWidth: 240,
    maxHeight: 48
  },
  externalLink: {
    textDecoration: 'none'
  },
  dropdownContent: {
    display: 'none',
    position: 'absolute',
    backgroundColor: '#f1f1f1',
    minWidth: '160px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    zIndex: 1
  },
  dropdownContentShown: {
    display: 'block',
    position: 'absolute',
    backgroundColor: '#f1f1f1',
    minWidth: '160px',
    boxShadow: '0px 8px 16px 0px rgba(0,0,0,0.2)',
    zIndex: 1
  },
  dropdownButtons: {
    display: 'block'
  },
  mobileMenu: {
    color: theme.palette.common.white,
    boxShadow: 'none',
    border: `1px solid ${theme.palette.common.white}`,
    background: 'none'
  }
})

export default styles
