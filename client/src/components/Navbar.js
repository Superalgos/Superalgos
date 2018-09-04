import React from 'react';
import { NavLink, withRouter } from 'react-router-dom'

const Navbar = (props) => {
  return (
    <header>
      <nav className="nav-wrapper transparent">
        <div className="container">
          <a href="http://www.advancedalgos.net" className="brand-logo">Users Module</a>
          <a href="" className="sidenav-trigger" data-target="mobile-menu">
            <i className="material-icons">menu</i>
          </a>
          <ul className="right hide-on-med-and-down">
            <li><NavLink exact to="/">Home</NavLink></li>
            <li><NavLink to='/profile'>Profile</NavLink></li>
            <li><NavLink to='/browse'>Browse</NavLink></li>
            <li><NavLink to='/search'>Search</NavLink></li>
            <li><NavLink to='/contact'>Contact</NavLink></li>
            <li><NavLink to='/about'>About</NavLink></li>
            <li><a href="http://modules.advancedalgos.net">Modules</a></li>

            <li><a href="" className="tooltipped btn-floating btn-small indigo darken-4" data-position="bottom" data-tooltip="You Tube">
              <i className="fab fa-youtube"></i>
            </a></li>
            <li><a href="" className="tooltipped btn-floating btn-small indigo darken-4" data-position="bottom" data-tooltip="Facebook">
              <i className="fab fa-facebook"></i>
            </a></li>
            <li><a href="" className="tooltipped btn-floating btn-small indigo darken-4" data-position="bottom" data-tooltip="Twitter">
              <i className="fab fa-twitter"></i>
            </a></li>

          </ul>
          <ul className="sidenav grey lighten-2" id="mobile-menu">
            <li><NavLink exact to="/">Home</NavLink></li>
            <li><NavLink to='/profile'>Profile</NavLink></li>
            <li><NavLink to='/browse'>Browse</NavLink></li>
            <li><NavLink to='/search'>Search</NavLink></li>
            <li><NavLink to='/contact'>Contact</NavLink></li>
            <li><NavLink to='/about'>About</NavLink></li>
          </ul>
        </div>
      </nav>
</header>
  )
}

export default withRouter(Navbar)
