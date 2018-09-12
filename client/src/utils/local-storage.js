const getStateFromStorage = version => {
  const localState = JSON.parse(window.localStorage.getItem('aa-team'))

  try {
    if (localState !== undefined && localState !== null) {
      if (
        localState.appVersion !== undefined &&
        localState.appVersion !== null
      ) {
        if (localState.appVersion === version) {
          return localState
        }
      }
    } else {
      throw new Error()
    }
  } catch (error) {
    return false
  }
}

const storeStateInStorage = state =>
  window.localStorage.setItem('aa-team', JSON.stringify(state))

const getItem = async name => window.localStorage.getItem(name)
const setItem = async (name, value) => window.localStorage.setItem(name, value)
const removeItem = async name => window.localStorage.removeItem(name)

export {
  getStateFromStorage,
  storeStateInStorage,
  getItem,
  setItem,
  removeItem
}
