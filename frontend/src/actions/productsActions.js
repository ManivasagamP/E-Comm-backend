import axios from 'axios'
import { productsFail, productsRequest, productsSuccess } from '../slices/productsSlice'

export const getProducts =(currentPage) => async(dispatch)=>{
    
    try{
        dispatch(productsRequest())
        let link = `/api/v1/products?page=${currentPage}`
        
        const {data} = await axios.get(link)

        dispatch(productsSuccess(data),[])
    }catch(error){
        //Hnadle Error
        dispatch(productsFail(error.response.data.message))
    }
    
} 