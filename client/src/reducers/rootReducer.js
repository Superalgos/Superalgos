const initState = {
  context: {
    masterApp: {
      footer: {
        visible: true
      }
    }
  }
}

const rootReducer = (state = initState, action) => {
  if (action.type === 'HIDE_FOOTER') {
    let newState = JSON.parse(JSON.stringify(state))
    newState.context.masterApp.footer.visible = false
    return newState
  }

  if (action.type === 'SHOW_FOOTER') {
    let newState = JSON.parse(JSON.stringify(state))
    newState.context.masterApp.footer.visible = true
    return newState
  }

  return state
}

export default rootReducer
