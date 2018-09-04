import React from 'react';
import { Link, NavLink, withRouter } from 'react-router-dom'

const Navbar = (props) => {
  return (
    <nav className="nav-wrapper red darken-3">
      <div className="container">
        <Link className="brand-logo" to="/">Advanced Algos Users Module</Link>
        <ul className="right">
          <li><NavLink exact to="/">Home</NavLink></li>
          <li><NavLink to='/profile'>Profile</NavLink></li>
          <li><NavLink to='/browse'>Browse</NavLink></li>
          <li><NavLink to='/search'>Search</NavLink></li>
          <li><NavLink to='/contact'>Contact</NavLink></li>
          <li><NavLink to='/about'>About</NavLink></li>
        </ul>
      </div>
    </nav>
  )
}

export default withRouter(Navbar)
