import { mergeDeep } from '../../../utils/js-helpers'

export const nav = {
  top: {
    toggleMobileMenu: () => state => {
      const menu = { mobileMenu: !state.mobileMenu }
      return mergeDeep(menu, state.top)
    },
    more: () => state => {
      const more = { more: !state.more }
      return mergeDeep(more, state.top)
    }
  }
}

export default nav
