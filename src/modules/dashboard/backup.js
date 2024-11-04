import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import storage from "../../../utils/storage";
import appActions from "../../../appActions";

const URL = window?.config?.END_POINT;

const SampleComponent = () => {
    const [activeTab, setActiveTab] = useState(0); // Track active tab
    const contentRef = useRef(null);
    const storeid = storage.get("storeid");
    const terminalid = storage.get("terminalid");
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [productGroups, setProductGroups] = useState();
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [productItems, setProductItems] = useState([])

    const productList = useSelector((state) => state.product.productList);

    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTop = 0;
        }
    }, [activeTab]);

    useEffect(() => {
        const catCode = storage.get("categoryCode");
        if (storeid && catCode) {
            const defaultParams = {
                language: "en",
                segment: "T1",
                sort: "sortorder",
                status: "Active",
                storeid: storeid,
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
        setProductGroups(uniqueProductGroups);
        const result = uniqueProductGroups.map((product) => {
            return {
                category: product,
                items: productList.filter(
                    (prod) => prod.categorycodes === product,
                ),
            };
        });
        setProductItems(result);
    }, [productList]);
    const [categoryGroup, setCategoryGroup] = useState([]);


    useEffect(() => {
        const mergedArr = productItems.map(item => {
            const match = categoryGroup.find(b => b.categorycodes === item.category);
            return {
                ...item,
                title: match?.title || null,
                sortorder: match?.sortorder || 0
            };
        }).sort((a, b) => a.sortorder - b.sortorder);
       setMenuItems(mergedArr)
    }, [productItems, categoryGroup])

    const getMenuName = async (category) => {
        const config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${URL}/sales/v1/category/search/fields?categorycode=${category}`,
            headers: {
                Authorization: "test",
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
                            sortorder
                        }
                    ]);
                }
            }
        } catch (error) {
            console.error(error);
        }
    };

    // Handle scroll event to detect the bottom
    const handleScroll = useCallback(() => {
        const content = contentRef.current;
        if (content.scrollTop + content.clientHeight >= content.scrollHeight) {
            // Switch to the next category when scrolled to bottom
            setActiveTab((prevTab) => (prevTab + 1) % menuItems.length);
        }
    }, [menuItems.length]);

    const getImage = () =>
        selectedItem.images
            ? `${URL}/${selectedItem.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;

    return (
        <div className="app-container">
            <div className="sidebar col-6 d-none d-md-block col-6 p-0">
                <img
                    //src={leftImages[0]?.image}
                    src="https://res.cloudinary.com/xenova/image/upload/c_pad,w_512,h_768/v1729664892/ad-page_1280x1600_mtkdtw.jpg"
                    alt={`Ad`}
                    className={`ad-image sticky-image`}
                />
            </div>
            <div className="main-content flex w-full">
                <div className="top-bar px-3">
                    <div className="tabs">
                        {menuItems.map((category, index) => (
                            <button
                                key={index}
                                className={
                                    activeTab === index ? "active-tab menu-tab" : "menu-tab"
                                }
                                onClick={() => setActiveTab(index)}
                            >
                                {category.title}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="chat-area">
                    <div
                        className="category-content"
                        ref={contentRef}
                        onScroll={handleScroll}
                        style={{ height: "100%", overflowY: "auto" }}
                    >
                        {menuItems &&
                            menuItems[activeTab] &&
                            menuItems[activeTab].items.map((item, index) => (
                                <div
                                    className="menu-item p-2 cursor-pointer"
                                    key={index}
                                    //onClick={() => handleSelectedItem(item)}
                                >
                                    <img
                                        src={getImage(item)}
                                        alt={item.name}
                                        className="menu-item-image"
                                    />
                                    <div className="menu-item-details">
                                        <h3>{item.additionalfields.title}</h3>
                                        <p className="mb-0">
                                            {item?.articlefields?.description}
                                        </p>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SampleComponent;
