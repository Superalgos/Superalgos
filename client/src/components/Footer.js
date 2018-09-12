import React from 'react'
import { NavLink } from 'react-router-dom'
import AALogo from '../img/aa-logo-dark-8.png'

const Footer = () => {
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
       
    </footer>
  )
}

export default Footer
