import React, { Component } from 'react'
import UserList from './UserList'
import CssBaseline from '@material-ui/core/CssBaseline'

class Browse extends Component {

  componentDidMount () {
    window.dispatchEvent(new Event('load')) // This is a workaround to solve the problem that the slider does not show up
  }

  render () {
    return (
      <React.Fragment>

        <section id='mainslider' className='fullwidth no_padding_container no_margin_col'>
          <div className='container'>
            <div className='row'>
              <div className='col-sm-12'>
                <div className='flexslider'>
                  <ul className='slides text-center'>
                    <li>
                      <img src='https://aacorporatesitedevelop.azurewebsites.net/img/photos/connect.jpg' alt='' />
                      <div className='slide_description_wrapper slider_textblock_center'>
                        <div className='slide_description to_animate'>
                          <div data-animation='fadeInUp' align='center'>
                            <div>
                              <div>
                                <h3>Users Directory</h3>
                                <h4 className='white-text'>
                                  <br />Everyone involved in Advanced Algos is here.
                              </h4>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>
        <CssBaseline />
        <UserList />
      </React.Fragment>
    )
  }
}

export default Browse
