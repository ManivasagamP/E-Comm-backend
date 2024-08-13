import { Fragment, useEffect } from "react";
import MetaData from "./Layouts/MetaData";
import { getProducts } from "../actions/productsActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from "./Layouts/Loader";
import Product from "./product/Product";
import {toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Home() {

    const dispatch = useDispatch();
    const {products, loading, error} = useSelector((state)=> state.productsState)

    useEffect(()=>{
        if(error){
            return toast.error(error)
        }
        dispatch(getProducts);
    },[error])

    return (
        <Fragment>
            {loading ? <Loader/>:
                <Fragment>
                    <MetaData title={'Buy best Products'} />
                    <h1 id="products_heading">Latest Products</h1>
                    <section id="products" className="container mt-5">
                        <div className="row">
                            {products && products.map(product => (
                                <Product product={product}/>
                            ))}
                        </div>
                    </section>
                </Fragment>
            }
        </Fragment>
        
    )
};