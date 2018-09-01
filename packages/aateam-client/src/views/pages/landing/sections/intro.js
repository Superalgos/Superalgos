/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const Intro = () => (
  <section class='hero is-navy' key='WhyIntro'>
    <div class='container'>
      <div class='hero-head' />
      <div class='hero-body m-t-0 is-marginless is-paddingless'>
        <div class='section'>
          <div class='columns'>
            <div class='column is-10 is-offset-1'>
              <h1 class='title has-text-centered is-size-3 m-t-1'>
                Welcome to the Advanced Algos Teams Community
              </h1>
              <h2 class='has-text-centered is-size-1 has-text-white has-text-weight-light has-text-uppercase m-b-0 p-b-0'>
                Collaborate. Innovate. Evolve.
              </h2>
            </div>
          </div>
        </div>
      </div>
      <div class='hero-foot' />
    </div>
  </section>
)

export default Intro
