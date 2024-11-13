import React, { useState, useEffect, useRef } from "react";
import SampleComponent from "../component/Sample";
import withInactivityDetector from "../../../withInactivityDetector";

const ProductListContainer = () => {
    return (
        <SampleComponent />
    )
};

export default ProductListContainer;
//export default withInactivityDetector(ProductListContainer);
