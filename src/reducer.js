import { combineReducers } from 'redux'

import relayReducer from './reducers/relay'
import userReducer from './reducers/user'

const rootReducer = combineReducers({
  // Define a top-level state field named `todos`, handled by `todosReducer`
  relay: relayReducer,
  user: userReducer
})

export default rootReducer