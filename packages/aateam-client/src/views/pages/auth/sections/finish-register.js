/* eslint-disable no-unused-vars */
import { h } from 'hyperapp'

import { FinishRegisterForm } from '../../../../modules/auth/views'

export const FinishRegisterWrapper = () => (
  <div class='column is-8 is-offset-2' key='FinishRegisterWrapper'>
    <div class='box'>
      <div class='section p-t-3 p-b-3 p-l-5 p-r-5 has-text-centered'>
        <h1 class='title has-text-grey'>Email address verified!</h1>
        <p class='m-b-2 is-size-4'>
          To finish creating your account, please complete the following:
        </p>
        <FinishRegisterForm />
      </div>
    </div>
  </div>
)
