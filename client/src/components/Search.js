import React, { Component } from 'react'
import UserSearch from './UserSearch'
import {compose} from 'react-apollo'
import CssBaseline from '@material-ui/core/CssBaseline'
import Paper from '@material-ui/core/Paper'

// Materia UI

import { withStyles } from '@material-ui/core/styles'

const styles = theme => ({
  root: {
    width: '50%',
    flexGrow: 1,
    padding: 10,
    marginLeft: '25%',
    marginTop: '5%',
    marginBottom: '10%'
  }
})

class Search extends Component {

  constructor (props) {
    super(props)
    this.state = {
    }
  }
  render () {
    const { classes } = this.props
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
                                <h3>Users Search</h3>
                                <h4 className='white-text'>
                                  <br />Find anyone involved in Advanced Algos here.
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
        <Paper className={classes.root}>
          <UserSearch />
        </Paper>
      </React.Fragment>
    )
  }
}

export default compose(
	withStyles(styles)
)(Search)
