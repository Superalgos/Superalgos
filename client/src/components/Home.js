import React, { Component } from 'react'

// Components

//import ChartUsers from './home/ChartUsers'

// Images

import PortraitImage from '../img/portrait.jpg'
import CityImage from '../img/city.jpg'
import NatureImage from '../img/nature.jpg'

class Home extends Component {

  render(){

    return (
      <div>

      <section className="container section scrollspy" id="photos">
        <div className="row">
          <div className="col s12 l4">
              <img src={PortraitImage} alt="" className="responsive-img materialboxed"></img>
          </div>
          <div className="col s12 l6 offset-l1">
            <h2 className="indigo-text text-darken-4">Title 1</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at lacus congue, suscipit elit nec, tincidunt orci.</p>
          </div>
        </div>
        <div className="row">
          <div className="col s12 l4 offset-l1 push-l7">
              <img src={CityImage} alt="" className="responsive-img materialboxed"></img>
          </div>
          <div className="col s12 l6 offset-l1 pull-l5 right-align">
            <h2 className="indigo-text text-darken-4">Title 2</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at lacus congue, suscipit elit nec, tincidunt orci.</p>
          </div>
        </div>
        <div className="row">
          <div className="col s12 l4">
              <img src={NatureImage} alt="" className="responsive-img materialboxed"></img>
          </div>
          <div className="col s12 l6 offset-l1">
            <h2 className="indigo-text text-darken-4">Title 3</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at lacus congue, suscipit elit nec, tincidunt orci.</p>
          </div>
        </div>
      </section>


      </div>
    )
  }
}

export default Home
