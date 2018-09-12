import React from 'react'
import { NavLink } from 'react-router-dom'

const Footer = () => {
  return (
    <footer>
      <div className='container'>
        <div className='row'>
          <div className='col l6 s12'>
            <h5 className='white-text'>Footer Content</h5>
            <p className='grey-text text-lighten-4'>
              You can use rows and columns here to organize your footer content.
            </p>
          </div>
          <div className='col l4 offset-l2 s12'>
            <h5 className='white-text'>Links</h5>
            <ul className='right hide-on-med-and-down'>
              <li>
                <NavLink exact to='/'>
                  Home
                </NavLink>
              </li>
              <li>
                <NavLink to='/browse'>Browse</NavLink>
              </li>
              <li>
                <NavLink to='/search'>Search</NavLink>
              </li>
              <li>
                <NavLink to='/contact'>Contact</NavLink>
              </li>
              <li>
                <NavLink to='/about'>About</NavLink>
              </li>
              <li>
                <a href='http://modules.advancedalgos.net'>Modules</a>
              </li>

              <li>
                <a
                  href=''
                  className='tooltipped btn-floating btn-small indigo darken-4'
                  data-position='bottom'
                  data-tooltip='You Tube'
                >
                  <i className='fab fa-youtube' />
                </a>
              </li>
              <li>
                <a
                  href=''
                  className='tooltipped btn-floating btn-small indigo darken-4'
                  data-position='bottom'
                  data-tooltip='Facebook'
                >
                  <i className='fab fa-facebook' />
                </a>
              </li>
              <li>
                <a
                  href=''
                  className='tooltipped btn-floating btn-small indigo darken-4'
                  data-position='bottom'
                  data-tooltip='Twitter'
                >
                  <i className='fab fa-twitter' />
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className='footer-copyright'>
        <div className='container'>
          © 2018 Copyright
          <a
            className='grey-text text-lighten-4 right'
            href='www.advancedalgos.net'
          >
            Advanced Algos Ltd.
          </a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
