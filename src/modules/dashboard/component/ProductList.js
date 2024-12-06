import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useHistory, useNavigate } from "react-router-dom";
import axios from "axios";
import storage from "../../../utils/storage";
import appActions from "../../../appActions";
import ProductDetail from "./ProductDetail";

const URL = window?.config?.END_POINT;

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(0); // Track active tab
    const contentRef = useRef(null);
    const storeid = storage.get("storeid");
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [productItems, setProductItems] = useState([]);
    const [isDetail, setIsDetail] = useState(false);
    const [order, setOrder] = useState();
    const [cartDetail, setCartDetail] = useState({});
    const [currCart, setCurrCart] = useState({});
    const currency = storage.get("currency");
    const token = storage.get("token");

    const productList = useSelector((state) => state.product.productList);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [activeTab]);

    // Fetch current cart from local storage on component mount
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
                storeid: storeid,
                stopsell: "N",
                categorycodes: storage.get("categoryCode"),
            };
            dispatch(appActions.PRODUCT_GET_ALL_REQUEST(defaultParams));
        }
    }, [dispatch, storeid]);

    useEffect(() => {
        const uniqueProductGroups = [
            ...new Set(productList.map((product) => product.categorycodes)),
        ];

        uniqueProductGroups.map((group) => {
            getMenuName(group);
        });
        //setProductGroups(uniqueProductGroups);
        const result = uniqueProductGroups.map((product) => {
            return {
                category: product,
                items: productList.filter(
                    (prod) => prod.categorycodes === product,
                ),
            };
        });
        setProductItems(result);
        storage.set('storeProduct', JSON.stringify(productList))
    }, [productList]);
    const [categoryGroup, setCategoryGroup] = useState([]);

    useEffect(() => {
        const mergedArr = productItems
            .map((item) => {
                const match = categoryGroup.find(
                    (b) => b.categorycodes === item.category,
                );
                return {
                    ...item,
                    title: match?.title || null,
                    sortorder: match?.sortorder || 0,
                };
            })
            .sort((a, b) => a.sortorder - b.sortorder);
        setMenuItems(mergedArr);
    }, [productItems, categoryGroup]);

    const getMenuName = async (category) => {
        const config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${URL}/sales/v1/category/search/fields?categorycode=${category}`,
            headers: {
                Authorization: token,
            },
        };

        try {
            const response = await axios.request(config); // Await the response here
            if (response.status === 200) {
                if (response.data.length > 0) {
                    const { title, sortorder } = response.data[0];
                    // Update state with the latest categoryGroup
                    setCategoryGroup((prevCategoryGroup) => [
                        ...prevCategoryGroup,
                        {
                            title,
                            categorycodes: category,
                            sortorder,
                        },
                    ]);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    const checkCartValue = () => !!(order?.orderid || currCart?.cartid);

    const handleClose = () => setIsDetail(false);

    const handleViewCart = () => {
        if (cartDetail.itemcount > 0) {
            navigate("/confirm-order", { replace: true });
        }
    };

    const getImage = (item) => {
        return item.images
            ? `${URL}/${item.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;
    };

    // Fetch cart details when current cart changes
    useEffect(() => {
        if (currCart?.cartid) {
            const { cartid, orderid } = currCart;
            let sessionid = storage.get("sessionid") || currCart.sessionid;
            getCartBySession(cartid, orderid, sessionid);
        }
    }, [currCart]);

    const handleAddItem = (order, cartid) => {
        const { sessionid, orderid } = order;
        storage.set("sessionid", sessionid);
        setSelectedItem({});
        setOrder(order);
        getCartBySession(cartid, orderid, sessionid);
        setIsDetail(false);
    };

    const getCartBySession = (cartid, orderid, sessionid) => {
        const config = {
            method: "get",
            url: `${URL}/pos/v1/cart/${cartid}/${orderid}?sessionid=${sessionid}&status=sales`,
            headers: {
                Authorization: "test",
                "Content-Type": "application/json",
            },
        };

        axios
            .request(config)
            .then((response) => setCartDetail(response.data))
            .catch((error) => console.error(error));
    };

    useEffect(() => {
        // Initialize the observer
        observer.current = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        const index = Number(
                            entry.target.getAttribute("data-index"),
                        );
                        setActiveTab(index);
                    }
                });
            },
            {
                root: null,
                rootMargin: "0px",
                threshold: 0.1, // Adjust to control how much of the category needs to be visible
            },
        );

        // Observe each category content section
        contentRefs.current.forEach((ref) => {
            if (ref) observer.current.observe(ref);
        });

        return () => {
            // Clean up the observer on component unmount
            observer.current.disconnect();
        };
    }, [menuItems, isDetail]);

    // Scroll to the selected tab's section when the tab is clicked
    const handleTabClick = (index) => {
        setActiveTab(index);
        contentRefs.current[index]?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        });
    };

    const contentRefs = useRef([]);
    const observer = useRef(null);


    const handleAddRedirect = (record) => {
        navigate("/item-detail", {
            state:{
                record: record,
                isEdit: false
            },
          });
    }

    const productListing = () => {
        return (
            <>
                <div className="top-bar px-3">
                    <div className="tabs">
                        {menuItems.map((category, index) => (
                            <button
                                key={index}
                                className={
                                    activeTab === index
                                        ? "active-tab menu-tab"
                                        : "menu-tab"
                                }
                                onClick={() => handleTabClick(index)}
                            >
                                {category.title}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="chat-area">
                    <div
                        className="category-content"
                        style={{ height: "100%", overflowY: "auto" }}
                    >
                        {menuItems.map((category, index) => (
                            <div
                                key={category.category}
                                className="category-section"
                                ref={(el) => (contentRefs.current[index] = el)}
                                data-index={index}
                            >
                                <h3 className="standard-header" style={{ marginBottom: '12px', marginLeft: '4px', marginTop: '12px'}}>{category.title}</h3>
                                {category.items.map((item, itemIndex) => (
                                    <div className="menu-item p-2 cursor-pointer" key={itemIndex} onClick={() => handleAddRedirect(item)}>
                                    <img
                                        src={getImage(item)}
                                        alt={item.articlefields.title}
                                        className="menu-item-image"
                                    />
                                    <div className="menu-item-details">
                                        <h3 className="standard-header">{item.articlefields.title}</h3>
                                        <p className="mb-0">
                                            {item?.articlefields
                                                ?.description ||
                                                "No description"}
                                        </p>
                                    </div>
                                </div>
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
                {(checkCartValue() || cartDetail?.cartid) && (
                    <div
                        className="fixed cart-summary sticky-cart-summary flex align-items-center justify-content-between p-4 col-12 md:col-6"
                        onClick={handleViewCart}
                    >
                        <span>{cartDetail.itemcount} item</span>
                        <span>view cart</span>
                        <span>
                            {currency}{cartDetail.totalamount}.00
                        </span>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="main-content flex d-md-block col-6 p-0">
            {isDetail ? (
                <ProductDetail
                    selectedItem={selectedItem}
                    handleAddItem={handleAddItem}
                    currCart={currCart}
                    handleClose={handleClose}
                    setCurrCart={setCurrCart}
                />
            ) : (
                productListing()
            )}
        </div>
    );
};

export default ProductList;
