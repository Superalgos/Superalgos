import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Divider from '@material-ui/core/Divider';

// Images
import AALogo from '../img/aa-logo.png'

const styles = theme => ({

  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: 120,
    maxHeight: 24,
  },
  link: {
    width: '100',
    font: 'Courier New'
  },
 horizontal:
  {
    display: 'inline',
    margin: theme.spacing.unit,
  },
  copyright: {
    position: 'relative',
    left: 30,
    top: 30,
  },
  links: {
    position: 'relative',
    left: '10%',
    top: 30,
  },
  button: {
  margin: theme.spacing.unit,
  },
});

class Footer extends Component {

  constructor(props){
    super(props);
    this.state={
      selected:'',
      user:null
    }
  }
  render() {
    const { classes } = this.props;
    return (
      <footer>

          <div className={classes.links}>            
            <Divider />
            <ul>
              <li className={classes.horizontal}>
                <Button color="primary" className={classes.button}>
                  <NavLink color="inherit" exact to="/">Home</NavLink>
                </Button>
              </li>
              <li className={classes.horizontal}>
                <Button color="primary" className={classes.button}>
                  <NavLink to='/browse'>Browse</NavLink>
                </Button>
              </li>
              <li className={classes.horizontal}>
                <Button color="primary" className={classes.button}>
                  <NavLink to='/search'>Search</NavLink>
                </Button>
              </li>
              <li className={classes.horizontal}>
                <Button color="primary" className={classes.button}>
                  <a href="http://www.advancedalgos.net"><img className={classes.img} alt="complex" src={AALogo} /></a>
                </Button>
              </li>
              <li className={classes.horizontal}>
                <Button color="primary" className={classes.button}>
                  <NavLink color="inherit" exact to="/contact">Contact</NavLink>
                </Button>
              </li>
              <li className={classes.horizontal}>
                <Button color="primary" className={classes.button}>
                  <NavLink to='/about'>About</NavLink>
                </Button>
              </li>
              <li className={classes.horizontal}>
                <Button color="primary" className={classes.button}>
                  <a href="http://modules.advancedalgos.net">Modules</a>
                </Button>
              </li>
            </ul>
          </div>
      </footer>
    )
  }
}

export default compose(
  withStyles(styles)
)(Footer);
