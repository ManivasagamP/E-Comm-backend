import { Fragment, useEffect, useState } from "react";
import MetaData from "./Layouts/MetaData";
import { getProducts } from "../actions/productsActions";
import { useDispatch, useSelector } from "react-redux";
import Loader from "./Layouts/Loader";
import Product from "./product/Product";
import {toast} from 'react-toastify';
import Pagination from 'react-js-pagination';

export default function Home() {
    const dispatch = useDispatch();
    const {products, loading, error, productsCount, resPerPage} = useSelector((state)=> state.productsState)
    const [currentPage, setCurrentPage] = useState(1);

    const setCurrentPageNo = (pageNo) => {
        setCurrentPage(pageNo)
    }

    useEffect(()=>{
        if(error){
            return toast.error(error)
        }
        dispatch(getProducts(currentPage));
    },[error, dispatch, currentPage])

    return (
        <Fragment>
            {loading ? <Loader/>:
                <Fragment>
                    <MetaData title={'Buy best Products'} />
                    <h1 id="products_heading">Latest Products</h1>
                    <section id="products" className="container mt-5">
                        <div className="row">
                            {products && products.map(product => (
                                <Product key={product._id} product={product}/>
                            ))}
                        </div>
                    </section>
                    {productsCount > 0 &&  productsCount>resPerPage ?
                    <div className="d-flex justify-content-center mt-5" >
                            <Pagination 
                                activePage={currentPage}
                                onChange={setCurrentPageNo}
                                totalItemsCount={productsCount}
                                itemsCountPerPage={resPerPage}
                                nextPageText={'Next'}
                                firstPageText={'First'}
                                lastPageText={'Last'}
                                itemClass={'page-item'}
                                linkClass={'page-link'}
                            />
                    </div> : null }
                </Fragment>
            }
        </Fragment>
        
    )
};