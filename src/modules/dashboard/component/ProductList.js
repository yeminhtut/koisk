import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import storage from "../../../utils/storage";
import appActions from "../../../appActions";
import ProductDetail from "./ProductDetail";

const URL = window?.config?.END_POINT;

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const contentRefs = useRef([]);
    const observer = useRef(null);
    const processedCategories = useRef(new Set())

    const [activeTab, setActiveTab] = useState(0);
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [productItems, setProductItems] = useState([]);
    const [isDetail, setIsDetail] = useState(false);
    const [order, setOrder] = useState();
    const [cartDetail, setCartDetail] = useState({});
    const [currCart, setCurrCart] = useState({});
    const [categoryGroup, setCategoryGroup] = useState([]);

    const storeid = storage.get("storeid");
    const currency = storage.get("currency");
    const token = storage.get("token");

    const productList = useSelector((state) => state.product.productList);

    useEffect(() => {
        const storedCart = storage.get("currCart");
        if (storedCart) {
            const cart = JSON.parse(storedCart);
            if (cart?.cartid) setCurrCart(cart);
        }
    }, []);

    useEffect(() => {
        const catCode = storage.get("categoryCode");
        if (storeid && catCode) {
            const defaultParams = {
                language: "en",
                segment: "T1",
                sort: "sortorder",
                status: "Active",
                storeid,
                stopsell: "N",
                categorycodes: catCode,
            };
            dispatch(appActions.PRODUCT_GET_ALL_REQUEST(defaultParams));
        }
    }, [dispatch, storeid]);

    useEffect(() => {
        const uniqueProductGroups = [
            ...new Set(productList.map((product) => product.categorycodes))
        ];

        uniqueProductGroups.forEach(getMenuName);
        const result = uniqueProductGroups.map((category) => ({
            category,
            items: productList.filter((product) => product.categorycodes === category)
        }));

        setProductItems(result);
        storage.set("storeProduct", JSON.stringify(productList));
    }, [productList]);

    useEffect(() => {
        const mergedArr = productItems
            .map((item) => {
                const match = categoryGroup.find((group) => group.categorycodes === item.category);
                return {
                    ...item,
                    title: match?.title || null,
                    sortorder: match?.sortorder || 0,
                };
            })
            .sort((a, b) => a.sortorder - b.sortorder);

        setMenuItems(mergedArr);
    }, [productItems, categoryGroup]);

    useEffect(() => {
        if (currCart?.cartid) {
            const { cartid, orderid } = currCart;
            const sessionid = storage.get("sessionid") || currCart.sessionid;
            fetchCartDetails(cartid, orderid, sessionid);
        }
    }, [currCart]);

    useEffect(() => {
        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(entry.target.getAttribute("data-index"));
                        setActiveTab(index);
                    }
                });
            },
            { root: null, rootMargin: "0px", threshold: 0.1 }
        );

        contentRefs.current.forEach((ref) => {
            if (ref) observer.current.observe(ref);
        });

        return () => observer.current.disconnect();
    }, [menuItems, isDetail]);

    useEffect(() => {
        // Scroll active tab into view when it changes
        const activeTabElement = document.querySelector(`.menu-tab:nth-child(${activeTab + 1})`);
        if (activeTabElement) {
            activeTabElement.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [activeTab]);

    const getMenuName = async (category) => {
        // Skip categories that have already been processed
        if (processedCategories.current.has(category)) return;
    
        try {
            const response = await axios.get(
                `${URL}/sales/v1/category/search/fields?categorycode=${category}`,
                { headers: { Authorization: token } }
            );
    
            if (response.status === 200 && response.data.length > 0) {
                const { title, sortorder } = response.data[0];
                setCategoryGroup((prev) => [
                    ...prev,
                    { title, categorycodes: category, sortorder },
                ]);
    
                // Mark category as processed
                processedCategories.current.add(category);
            }
        } catch (error) {
            console.error(error);
        }
    };

    const fetchCartDetails = (cartid, orderid, sessionid) => {
        axios
            .get(`${URL}/pos/v1/cart/${cartid}/${orderid}?sessionid=${sessionid}&status=sales`, {
                headers: { Authorization: token, "Content-Type": "application/json" },
            })
            .then((response) => setCartDetail(response.data))
            .catch((error) => console.error(error));
    };

    const checkCartValue = () => !!(order?.orderid || currCart?.cartid);

    const handleTabClick = (index) => {
        setActiveTab(index);
        contentRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "start" });
    };

    const handleAddRedirect = (record) => {
        navigate("/item-detail", {
            state: { record, isEdit: false },
        });
    };

    const handleViewCart = () => {
        if (cartDetail.itemcount > 0) navigate("/confirm-order", { replace: true });
    };

    const handleAddItem = (order, cartid) => {
        const { sessionid, orderid } = order;
        storage.set("sessionid", sessionid);
        setSelectedItem({});
        setOrder(order);
        fetchCartDetails(cartid, orderid, sessionid);
        setIsDetail(false);
    };

    const getImage = (item) => {
        return item.images
            ? `${URL}/${item.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;
    };

    const productListing = () => (
        <>
            <div className="top-bar px-3">
                <div className="tabs">
                    {menuItems.map((category, index) => (
                        <div
                            key={index}
                            className={`menu-tab ${activeTab === index ? "active-tab" : "c-gray"} f-14pt fw-6`}
                            onClick={() => handleTabClick(index)}
                        >
                            {category.title}
                        </div>
                    ))}
                </div>
            </div>

            <div className="product-container">
                <div
                    className="category-content"
                    style={{
                        height: "100%",
                        overflowY: "auto",
                        paddingBottom: checkCartValue() ? "80px" : "0px",
                    }}
                >
                    {menuItems.map((category, index) => (
                        <div
                            key={category.category}
                            ref={(el) => (contentRefs.current[index] = el)}
                            data-index={index}
                        >
                            <h3 className="standard-header" style={{ margin: "12px 4px" }}>
                                {category.title}
                            </h3>
                            {category.items.map((item, itemIndex) => (
                                <div
                                    className="menu-item p-2 cursor-pointer"
                                    key={itemIndex}
                                    onClick={() => handleAddRedirect(item)}
                                >
                                    <img
                                        src={getImage(item)}
                                        alt={item?.articlefields?.title}
                                        className="menu-item-image"
                                    />
                                    <div className="menu-item-details">
                                        <h3 className="standard-header">
                                            {item?.articlefields?.title}
                                        </h3>
                                        <p className="mb-0">
                                            {item?.articlefields?.description || "No description"}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            {checkCartValue() && (
                <div
                    className="fixed sticky-cart-summary flex align-items-center justify-content-between p-4 col-12 md:col-6"
                    onClick={handleViewCart}
                >
                    <span>{cartDetail.itemcount} item</span>
                    <span>view cart</span>
                    <span>
                        {currency}
                        {cartDetail.totalamount}.00
                    </span>
                </div>
            )}
        </>
    );

    return (
        <div className="main-content flex d-md-block col-6 p-0">
            {isDetail ? (
                <ProductDetail
                    selectedItem={selectedItem}
                    handleAddItem={handleAddItem}
                    currCart={currCart}
                    handleClose={() => setIsDetail(false)}
                    setCurrCart={setCurrCart}
                />
            ) : (
                productListing()
            )}
        </div>
    );
};

export default ProductList;
