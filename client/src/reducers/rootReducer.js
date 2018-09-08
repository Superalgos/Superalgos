const initState = {
  user: {}
}

const rootReducer = (state = initState, action) => {

  if(action.type === 'USER_LOGS_IN'){
   return {
     user: action.user
   }
  }
  return state;
}

export default rootReducer
