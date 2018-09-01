/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

export const Intro = () => (
  <section class='hero is-light' key='WhyIntro'>
    <div class='container'>
      <div class='hero-head' />
      <div class='hero-body m-t-0 is-marginless is-paddingless'>
        <div class='section'>
          <div class='columns'>
            <div class='column is-10 is-offset-1'>
              <h1 class='title has-text-centered is-size-1 m-t-1'>
                About the AlgoCommunity
              </h1>
              <h2 class='has-text-centered is-size-3 has-text-black m-b-0 p-b-0'>
                Working together to connect, learn, evolve.
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
