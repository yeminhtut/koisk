import React from "react";
import ProductList from "../component/ProductList";
import withInactivityDetector from "../../../withInactivityDetector";

const ProductListContainer = () => {
    return (
        <ProductList />
    )
};

//export default ProductListContainer;
export default withInactivityDetector(ProductListContainer);
