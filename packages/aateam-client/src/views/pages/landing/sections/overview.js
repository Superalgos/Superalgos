/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

import { auth } from '../../../../index'

export const Overview = () => (
  <section class='hero is-navy m-t-0 p-b-10' key='WhyProbSol'>
    <div class='container m-t-0'>
      <div class='hero-head' />
      <div class='hero-body m-t-0'>
        <div class='section m-t-0 has-text-centered'>
          <a class='button is-large is-red' onclick={() => auth.login()}>
            Join the Community
          </a>
        </div>
      </div>
      <div class='hero-foot' />
    </div>
  </section>
)

export default Overview
