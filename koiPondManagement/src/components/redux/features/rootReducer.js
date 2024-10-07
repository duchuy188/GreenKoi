import { combineReducers } from '@reduxjs/toolkit';
import counterReducer from './counterSlice';
import  useReducer  from './useSlice'  ;

export const rootReducer = combineReducers({
      counter: counterReducer,
      user: useReducer,
  })