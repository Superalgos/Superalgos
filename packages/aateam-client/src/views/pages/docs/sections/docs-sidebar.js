/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

export const DocsSidebar = () => (state, actions) => (
  <aside class='menu section is-grey'>
    <ul class='menu-list'>
      <li>
        <Link
          to='/docs/overview'
          class={`navbar-item is-size-5 ${
            state.location.pathname === '/docs/overview' ? 'is-active' : ''
          }`}
        >
          Introduction
        </Link>
      </li>
    </ul>
    <p class='menu-label has-text-yellow'>The AA Platform </p>
    <ul class='menu-list'>
      <li>
        <a class='is-size-6' href='#'>
          Overview
        </a>
      </li>
      <li>
        <a class='is-size-6' href='#'>
          AA Cloud
        </a>
      </li>
      <li>
        <a class='is-size-6' href='#'>
          AA Web
        </a>
      </li>
    </ul>
    <p class='menu-label has-text-yellow'>Algobots </p>
    <ul class='menu-list'>
      <li>
        <a class='is-size-6' href='#'>
          Overview
        </a>
      </li>
      <li>
        <a class='is-size-6' href='#'>
          E-Bots: Extractor Algobots
        </a>
      </li>
      <li>
        <a class='is-size-6' href='#'>
          I-Bots: Indicator Algobots
        </a>
      </li>
      <li>
        <a class='is-size-6' href='#'>
          T-Bots: Trading Algobots
        </a>
      </li>
    </ul>
    <p class='menu-label has-text-yellow'>Competitions</p>
    <ul class='menu-list'>
      <li>
        <a class='is-size-6' href='#'>
          Introduction
        </a>
      </li>
      <li>
        <a class='is-size-6' href='#'>
          Quick start
        </a>
      </li>
      <li>
        <a class='is-size-6' href='#'>
          Advanced
        </a>
      </li>
    </ul>
    <p class='menu-label has-text-yellow'>Advanced Algos</p>
    <ul class='menu-list'>
      <li>
        <a class='is-size-6' href='#'>
          The Startup
        </a>
      </li>
      <li>
        <a class='is-size-6' href='#'>
          The Project
        </a>
      </li>
      <li>
        <a class='is-size-6' href='#'>
          The ALGO Ecosystem
        </a>
      </li>
    </ul>
  </aside>
)

export default DocsSidebar
