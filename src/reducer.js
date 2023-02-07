import { combineReducers } from 'redux'

import counterSlice from './reducers/counter'
import relayReducer from './reducers/relay'


const rootReducer = combineReducers({
  // Define a top-level state field named `todos`, handled by `todosReducer`
  relay: relayReducer
})

export default rootReducer