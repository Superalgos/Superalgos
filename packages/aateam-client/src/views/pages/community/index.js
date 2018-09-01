/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { TeamsListWrapper } from '../../../modules/community/views'

export const CommunityWrapper = props => (state, actions) => (
  <div
    class='is-marginless is-paddingless is-fluid is-relative is-fullheight'
    key='community-box'
  >
    <div class='columns is-gapless'>
      <div class='column is-navy'>
        <TeamsListWrapper />
        <div
          class={`modal ${state.modal.isActive ? 'is-active' : ''}`}
        >
          <div class='modal-background' />
          <div class='modal-content'>
            <section
              class='section has-text-centered p-l-5 p-r-5'
              key='CommunityModalContainer'
            >
              <div class='box p-t-3 p-b-5 p-l-5 p-r-5 m-b-5'>{}</div>
            </section>
          </div>
          <button
            class='modal-close is-large'
            onclick={() =>
              actions.community.toggleModal(state.modal.content)
            }
            aria-label='close'
          />
        </div>
      </div>
    </div>
  </div>
)

export default CommunityWrapper
