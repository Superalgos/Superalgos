import React from 'react'

import { BannerTopBar } from '../common'

export const EmailSignupConfirm = () => <BannerTopBar
  size='big'
  title=''
  text={['Processing newsletter sign-up...', <br />, 'Thank you for opting-in to recieve updates about the Advanced Algos project!']}
  backgroundUrl='https://aacorporatesitedevelop.azurewebsites.net/img/photos/superalgos-platform.jpg'
/>

export default EmailSignupConfirm
