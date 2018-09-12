import React, { Component } from 'react';
import { NavLink } from 'react-router-dom'
import { compose } from 'recompose';
import { withStyles } from '@material-ui/core/styles';

// Images
import AALogo from '../img/aa-logo.png'

const styles = theme => ({

  img: {
    margin: 'auto',
    display: 'block',
    maxWidth: 120,
    maxHeight: 24,

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

            <div>
              <h5>Footer Content</h5>
              <p>You can use rows and columns here to organize your footer content.</p>
            </div>
            <div>
              <h5>Links</h5>
              <ul>
                <li><NavLink exact to="/">Home</NavLink></li>
                <li><NavLink to='/browse'>Browse</NavLink></li>
                <li><NavLink to='/search'>Search</NavLink></li>
                <li><NavLink to='/contact'>Contact</NavLink></li>
                <li><NavLink to='/about'>About</NavLink></li>
                <li><a href="http://modules.advancedalgos.net">Modules</a></li>
              </ul>
            </div>


          <div>
          © 2018 Copyright <a href="www.advancedalgos.net">Advanced Algos Ltd.</a>
          </div>
         <img className={classes.img} alt="complex" src={AALogo} />
      </footer>
    )
  }
}

export default compose(
  withStyles(styles)
)(Footer);
