import {combineReducers, configureStore} from '@reduxjs/toolkit';
import  {thunk}  from 'redux-thunk';
import productsReaducer from "./slices/productsSlice" 
import productReducer from "./slices/productSlice"

const reducer =  combineReducers({
    productsState : productsReaducer,
    productState : productReducer
})

const store = configureStore({
    reducer,
    middleware: (getDefaultMiddleware => getDefaultMiddleware().concat(thunk)),
})
    

export default store;