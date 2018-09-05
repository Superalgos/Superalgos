import React, { Component } from 'react'

// Components

//import ChartUsers from './home/ChartUsers'

// Images

import PortraitImage from '../img/portrait.jpg'
import CityImage from '../img/city.jpg'
import NatureImage from '../img/nature.jpg'
import StreetImage from '../img/street.jpg'
import StarsImage from '../img/stars.jpg'

import {XYPlot, LineSeries} from 'react-vis';

class Home extends Component {

  render(){

    const data = [
      {x: 0, y: 8},
      {x: 1, y: 5},
      {x: 2, y: 4},
      {x: 3, y: 9},
      {x: 4, y: 1},
      {x: 5, y: 7},
      {x: 6, y: 6},
      {x: 7, y: 3},
      {x: 8, y: 2},
      {x: 9, y: 0}
    ];

    return (
      <div>
      <XYPlot height={300} width={300}>
        <LineSeries data={data} />
      </XYPlot>

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


      <div className="parallax-container">
        <div className="parallax">
          <img src={StreetImage} alt="" className="responsive-img"></img>
        </div>
      </div>


      <section className="section container scrollspy" id="services">
        <div className="row">
          <div className="col s12 l4">
            <h2 className="indigo-text text-darken-4">What I do..</h2>
            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at lacus congue, suscipit elit nec, tincidunt orci.</p>
            <p>Mauris dolor augue, vulputate in pharetra ac, facilisis nec libero. Fusce condimentum gravida urna, vitae scelerisque erat ornare nec.</p>
          </div>
          <div className="col s12 l6 offset-l2">

            <ul className="tabs">
              <li className="tab col s6">
                <a href="#photography" className="active indigo-text text-darken-4">Photography</a>
              </li>
              <li className="tab col s6">
                <a href="#editing" className="indigo-text text-darken-4">Editing</a>
              </li>
            </ul>
            <div id="photography" className="col s12">
                <p className="flow-text indigo-text text-darken-4">This</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at lacus congue, suscipit elit nec, tincidunt orci.</p>
                <p>Mauris dolor augue, vulputate in pharetra ac, facilisis nec libero. Fusce condimentum gravida urna, vitae scelerisque erat ornare nec.</p>
            </div>
            <div id="editing" className="col s12">
                <p className="flow-text indigo-text text-darken-4">That</p>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum at lacus congue, suscipit elit nec, tincidunt orci.</p>
                <p>Mauris dolor augue, vulputate in pharetra ac, facilisis nec libero. Fusce condimentum gravida urna, vitae scelerisque erat ornare nec.</p>
            </div>
            </div>
          </div>
      </section>


      <div className="parallax-container">
        <div className="parallax">
          <img src={StarsImage} alt="" className="responsive-img"></img>
        </div>
      </div>




      </div>
    )
  }
}

export default Home
