import React, { Component } from 'react'
import {compose} from 'react-apollo'

// Materia UI

import { withStyles } from '@material-ui/core/styles'
import Typography from '@material-ui/core/Typography'
import Grid from '@material-ui/core/Grid'
import Paper from '@material-ui/core/Paper'

// components
import DescendentsTree from './DescendentsTree'

const styles = theme => ({
  root: {
    width: '50%',
    flexGrow: 1,
    padding: 10,
    marginLeft: '25%',
    marginTop: '5%',
    marginBottom: '10%'
  },
  typography: {
    width: '80%',
    marginLeft: '10%',
    marginTop: 40,
    marginBottom: 40
  },
  grid: {
    paddingTop: '30',
    marginTop: 30
  }
})

class YourDescendents extends Component {

  constructor (props) {
    super(props)

    this.defaultValuesSet = false

    this.state = {
      id: ''
    }
  }

  componentWillMount ()    	{
    if (this.defaultValuesSet === false)    	    {
      let userData = localStorage.getItem('loggedInUser')

      if (userData === 'undefined') { return }

      let user = JSON.parse(userData)
      this.defaultValuesSet = true

      /* Now we are ready to set the initial state. */
      this.setState({
        id: user.id
      })
    }
  }

  componentDidMount () {
    window.dispatchEvent(new Event('load')) // This is a workaround to solve the problem that the slider does not show up
  }

  addSlider () {
    return (
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
                              <h3>Your Descendents</h3>
                              <h4 className='white-text'>
                                <br />Explore here generations of people that discovered Advanced Algos because of you.
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
    )
  }

  addForm () {
    const { classes } = this.props
    return (
      <Paper className={classes.root}>

        <Typography className={classes.typography} variant='body1' gutterBottom align='left'>
        These are your decendents within the project. Your children referred you as the one who brought them to the project, while
        your grandchildren referred your children and so on. In order to be able to see your descendents, the users who you referred
        must first point to you as your referrer.
        </Typography>

        <DescendentsTree userId={this.state.id} />
        <Grid container className={classes.grid} justify='center' spacing={24} />
      </Paper>
    )
  }

  render () {
    return (
      <React.Fragment>
        {this.addSlider()}
        {this.addForm()}
      </React.Fragment>
    )
  }
}

export default compose(
  withStyles(styles)
)(YourDescendents) // This technique binds more than one query to a single component.
