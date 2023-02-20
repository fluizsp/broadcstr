import { combineReducers } from 'redux'

import contentReducer from './reducers/content'
import userReducer from './reducers/user'

const rootReducer = combineReducers({
  // Define a top-level state field named `todos`, handled by `todosReducer`
  content: contentReducer,
  user: userReducer
})

export default rootReducer