/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'
import { Link } from '@hyperapp/router'

import aalogo from '../../assets/logos/advanced-algos/aa-logo.png'

export const Footer = ({ match }) => (state, actions) => (
  <footer class='footer'>
    <div class='container is-dark'>
      <div class='level m-t-1'>
        <div class='level-left'>
          <div class='level-item has-text-grey-light m-t-1'>
            All Rights Reserved &copy; Advanced Algos, Ltd.
          </div>
        </div>
        <div class='level-right'>
          <div class='level-item'>
            <a href='https://advancedalgos.net' target='_blank'>
              <div class='tags has-addons'>
                <span class='tag is-red is-medium has-text-white'>
                  Powered by
                </span>
                <span class='tag is-white is-medium'>
                  <img
                    src={aalogo}
                    height='24'
                    width='120'
                    alt='Advanced Algos'
                  />
                </span>
              </div>
            </a>
          </div>
          <div class='level-item'>
            <a
              class='button is-small is-white is-outlined'
              href='https://github.com/AdvancedAlgos/AATeamModule'
            >
              <span class='icon is-small'>
                <i class='fab fa-github' />
              </span>
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  </footer>
)
