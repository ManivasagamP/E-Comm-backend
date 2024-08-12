import {combineReducers, configureStore} from '@reduxjs/toolkit';
import  {thunk}  from 'redux-thunk';
import productsReaducer from "./slices/productsSlice" 

const reducer =  combineReducers({
    productsState : productsReaducer
})

const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware => getDefaultMiddleware().concat(thunk)),
})
    

export default store;