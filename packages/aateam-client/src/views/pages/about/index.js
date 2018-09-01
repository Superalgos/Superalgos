/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { Intro, Overview } from './sections'

export const About = props => () => (
  <div
    class='is-marginless is-paddingless is-fluid is-relative is-fullheight'
    key='about-box'
  >
    <div class='columns is-gapless'>
      <div class='column'>
        <Intro />
        <Overview />
      </div>
    </div>
  </div>
)

export default About
