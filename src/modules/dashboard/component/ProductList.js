import React, { useState, useEffect, useRef, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import ImageIcon from "../../../components/ImageIcon";
import storage from "../../../utils/storage";
import appActions from "../../../appActions";

const URL = window?.config?.END_POINT;

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState(0); // Track active tab
    const contentRef = useRef(null);
    const storeid = storage.get("storeid");
    const terminalid = storage.get("terminalid");

    const [productGroups, setProductGroups] = useState();
    const [menuItems, setMenuItems] = useState([]);
    const [selectedItem, setSelectedItem] = useState({});
    const [productItems, setProductItems] = useState([]);
    const [isDetail, setIsDetail] = useState(false);
    const [order, setOrder] = useState();
    const [cartDetail, setCartDetail] = useState({});
    const [currCart, setCurrCart] = useState({});
    const currency = storage.get('currency')

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

    // Handle scroll event to detect the bottom
    const handleScroll = useCallback(() => {
        const content = contentRef.current;
        if (content.scrollTop + content.clientHeight >= content.scrollHeight) {
            // Switch to the next category when scrolled to bottom
            setActiveTab((prevTab) => (prevTab + 1) % menuItems.length);
        }
    }, [menuItems.length]);

    const getImage = (item) => {
        return item.images
            ? `${URL}/${item.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;
    };

    const handleSelectedItem = (item) => {
        setIsDetail(true);
        setSelectedItem(item);
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
    }, [menuItems]);

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
                                {category.items.map((item, itemIndex) => (
                                    <div
                                        className="menu-item p-2 cursor-pointer"
                                        key={itemIndex}
                                        onClick={() => handleSelectedItem(item)}
                                    >
                                        <img
                                            src={getImage(item)}
                                            alt={item.title}
                                            className="menu-item-image"
                                        />
                                        <div className="menu-item-details">
                                            <h3>{item.title}</h3>
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
                        className="fixed cart-summary sticky-cart-summary add-to-order flex align-items-center justify-content-between p-4 col-12 md:col-6"
                        onClick={handleViewCart}
                    >
                        <span>{cartDetail.itemcount} item</span>
                        <span>view cart</span>
                        <span>{currency} {cartDetail.totalamount}.00</span>
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

const ProductDetail = ({
    selectedItem,
    handleAddItem,
    currCart,
    handleClose,
    setCurrCart,
}) => {
    const { productpricecode } = selectedItem;
    const [quantity, setQuantity] = useState(1);
    const [productAddons, setProductAddon] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const handleCloseDetail = () => handleClose();
    const toast = useRef(null);

    const storeid = storage.get("storeid");
    const terminalid = storage.get("terminalid");
    const currency = storage.get('currency')

    useEffect(() => {
        getProductAddOn();
    }, [selectedItem]);

    useEffect(() => {
        const sumOfPrices = selectedOptions.reduce(
            (sum, item) => sum + (item.price || 0),
            0,
        );
        setTotalPrice(selectedItem.baseprice * quantity + sumOfPrices);
    }, [selectedItem, quantity, selectedOptions]);

    useEffect(() => {
        if (productAddons && productAddons.length > 0) {
            const output = productAddons.map((pao, i) => {
                const { defaultSelected } = pao;
                if (defaultSelected && defaultSelected.id) {
                    const { groupid, productpricecode, articlefields } =
                        defaultSelected;
                    return {
                        [groupid]: productpricecode,
                        index: i + 1,
                        groupid,
                        title: articlefields.title,
                    };
                }
            });

            const cleanedData = output.filter((item) => item !== undefined);
            setSelectedOptions(cleanedData);
        }
    }, [productAddons]); // added dependency array

    const getProductAddOn = () => {
        const config = {
            method: "get",
            url: `${URL}/sales/v1/product-search/productpricecode/${productpricecode}?storeid=${storeid}&status=Active&language=en`,
            headers: {
                Authorization: "test",
                "Content-Type": "application/json",
            },
        };

        axios
            .request(config)
            .then((response) => {
                const addOnList = groupAddon(response.data);
                setProductAddon(addOnList);
            })
            .catch((error) => console.error(error));
    };

    const getImage = () =>
        selectedItem.images
            ? `${URL}/${selectedItem.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;

    const handleAdd = () =>
        currCart?.cartid ? addItem(currCart) : createCart();

    const addItem = (cart) => {
        const { productpricecode } = selectedItem;
        const { orderid, cartid } = cart;

        const data = {
            orderid,
            productpricecode,
            quantity,
            additionalfields: { images: "/media/phstoreimages-2/espresso.png" },
        };
        if (selectedOptions.length > 0) {
            data["addons"] = selectedOptions.map((obj) => {
                const groupId = Object.keys(obj)[0]; // Get the groupId (g4, g6, etc.)
                const productpricecode = obj[groupId]; // Get the corresponding value (productpricecode)

                return {
                    orderid,
                    productpricecode: productpricecode, // Add the value into productpricecode
                    quantity: quantity,
                };
            });
        }

        const payloadData = JSON.stringify(data);
        axios
            .post(`${URL}/pos/v1/cart/${cartid}/item`, payloadData, {
                headers: {
                    Authorization: "test",
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                if (response.status == 200) {
                    handleAddItem(response.data, cartid);
                } else {
                    toast.current.show({
                        severity: "info",
                        summary: "Info",
                        detail: response.data.message,
                    });
                }
            })
            .catch((error) => console.error(error));
    };

    const createCart = () => {
        const data = JSON.stringify({
            storeid: storeid,
            language: "en",
            qno: "Y",
            terminalid: terminalid,
            saleschannel: "dxpkiosk",
            signonid: storage.get("signonid"),
        });

        axios
            .post(`${URL}/pos/v1/cart/new`, data, {
                headers: {
                    Authorization: "test",
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                if (response.status == 200) {
                    storage.set("currCart", JSON.stringify(response.data));
                    const { sessionid } = response.data;
                    storage.set("sessionid", sessionid);
                    addItem(response.data);
                    setCurrCart(response.data);
                } else {
                    toast.current.show({
                        severity: "error",
                        summary: "Info",
                        detail: response.data.message,
                    });
                }
            })
            .catch((error) => console.error(error));
    };

    const GetSortOrder = (prop) => {
        return function (a, b) {
            if (a[prop] > b[prop]) {
                return 1;
            } else if (a[prop] < b[prop]) {
                return -1;
            }
            return 0;
        };
    };

    const groupAddon = (data) => {
        if (data.addongroups && data.addons) {
            const addongroups = data.addongroups.reduce(
                (addongroups, producta) => {
                    const brand1 = producta.groupid;
                    if (!addongroups[brand1]) {
                        addongroups[brand1] = [];
                    }

                    addongroups[brand1].push(producta);
                    return addongroups;
                },
                {},
            );

            const addons = data.addons.reduce((addons, product) => {
                const addon = product.groupid;
                if (addongroups[addon]) {
                    if (!addons[addon]) {
                        addons[addon] = [];
                    }
                    product.addgroup = addongroups[addon][0];
                    addons[addon].push(product);
                }
                return addons;
            }, {});

            const addongroupArrays = Object.keys(addons).map((addon) => {
                return {
                    addon,
                    sortOrder: addongroups[addon][0].sortorder,
                    addgroup: addongroups[addon][0],
                    addons: addons[addon],
                    defaultSelected: addons[addon].filter(function (el) {
                        return el.selected == "Y";
                    })[0],
                };
            });
            return addongroupArrays.sort(GetSortOrder("sortOrder"));
        }
    };

    const handleRadioOptionChange = (group, option, i) => {
        const { addon } = group;
        const { price, productpricecode } = option;
        setSelectedOptions((prevSelectedOptions) => {
            // Check if the key (groupId) already exists
            const existingIndex = prevSelectedOptions.findIndex(
                (option) => Object.keys(option)[0] === addon,
            );

            // If the key exists, replace its value
            if (existingIndex !== -1) {
                const updatedOptions = [...prevSelectedOptions];
                updatedOptions[existingIndex] = {
                    [addon]: productpricecode,
                    price,
                    index: i + 1,
                    groupId: addon,
                };
                return updatedOptions;
            }

            // If the key doesn't exist, add the new key-value pair
            return [
                ...prevSelectedOptions,
                {
                    [addon]: productpricecode,
                    price,
                    index: i + 1,
                    groupId: addon,
                },
            ];
        });
    };

    const handleOptionChange = (addon, checked, option, productpricecode) => {
        const flattened = selectedOptions.flatMap((obj) => Object.values(obj));
        const isIncluded = flattened.includes(productpricecode);
        const { price } = option;
        setSelectedOptions((prevSelectedOptions) => {
            if (!isIncluded) {
                // If checked, store the productpricecode directly as a string
                return [
                    ...prevSelectedOptions,
                    { [addon]: productpricecode, price },
                ];
            } else {
                // If unchecked, remove the productpricecode by setting it to null or undefined
                const updatedOptions = [...prevSelectedOptions];
                const filteredData = updatedOptions.filter((item) => {
                    return !Object.values(item).includes(productpricecode);
                });

                // delete updatedOptions[addon]; // Remove the key for unchecked options
                return filteredData;
            }
        });
    };

    const getChecked = (option) => {
        return selectedOptions.some((item) =>
            Object.values(item).includes(option.productpricecode),
        );
    };

    const getParentGroup = ({ itemmap }) => {
        //return true;
        if (!itemmap) return true;

        const result = Object.entries(itemmap).reduce(
            (acc, [groupId, indexString]) => {
                const targetIndexes = indexString.split(", ").map(Number);

                // Filter selectedOptions based on groupId and targetIndexes
                const matches = selectedOptions.filter(
                    (item) =>
                        item.groupId === groupId &&
                        targetIndexes.includes(item.index),
                );

                // If matches are found, accumulate their indexes in acc
                if (matches.length > 0) {
                    acc[groupId] = matches.map((item) => item.index).join(", ");
                }

                return acc;
            },
            {},
        );

        return !isEmptyObject(result);
    };

    const isEmptyObject = (obj) => {
        return Object.keys(obj).length === 0;
    };

    return (
        <div className="chat-area" style={{ paddingBottom: "300px" }}>
            <Toast ref={toast} />
            <MenuItem
                label={selectedItem.additionalfields.title}
                imgSrc={getImage()}
                handleCloseDetail={handleCloseDetail}
            />
            <div className="item-info p-4">
                <h2>{selectedItem?.additionalfields?.title}</h2>
                <p>{selectedItem?.articlefields?.description}</p>
            </div>

            <div>
                {productAddons &&
                    productAddons.map((group, i) => (
                        <div key={group.addon}className="field px-4">
                            <h4>{group.addgroup.title}</h4>
                            {group.addons.map((option, index) => (
                                <>
                                    {group.addgroup.multiselect !== "Y" && (
                                        <div
                                            key={option.id}
                                            className="field-radiobutton flex"
                                        >
                                            <label className="custom-radio">
                                                <input
                                                    type="radio"
                                                    name={group.addon}
                                                    value={
                                                        option.productpricecode
                                                    }
                                                    checked={selectedOptions.some(
                                                        (item) =>
                                                            Object.values(
                                                                item,
                                                            ).includes(
                                                                option.productpricecode,
                                                            ),
                                                    )}
                                                    onChange={() =>
                                                        handleRadioOptionChange(
                                                            group,
                                                            option,
                                                            index,
                                                        )
                                                    }
                                                    className="hidden-radio"
                                                />
                                                <span
                                                    className={`radiomark ${getChecked(option) ? "checked" : ""}`}
                                                ></span>
                                            </label>
                                            <label
                                                htmlFor={`${group.addon}_${option.id}`}
                                            >
                                                {option?.articlefields?.title}
                                            </label>
                                            <div className="ml-auto">
                                                {option?.price > 0
                                                    ? `+ ${option.price.toFixed(2)}`
                                                    : ""}
                                            </div>
                                        </div>
                                    )}
                                    {group.addgroup.multiselect == "Y" &&
                                        getParentGroup(option) && (
                                            <div
                                                key={option.id}
                                                className="field-radiobutton flex"
                                            >
                                                <label className="custom-checkbox">
                                                    <input
                                                        type="checkbox"
                                                        value={
                                                            option.productpricecode
                                                        }
                                                        checked={selectedOptions.some(
                                                            (item) =>
                                                                Object.values(
                                                                    item,
                                                                ).includes(
                                                                    option.productpricecode,
                                                                ),
                                                        )}
                                                        onChange={(e) =>
                                                            handleOptionChange(
                                                                group.addon,
                                                                e.checked,
                                                                option,
                                                                option.productpricecode,
                                                            )
                                                        }
                                                        className="hidden-checkbox"
                                                    />
                                                    <span
                                                        className={`checkmark ${getChecked(option) ? "checked" : ""}`}
                                                    ></span>
                                                </label>
                                                <label
                                                    htmlFor={`${group.addon}_${option.id}`}
                                                >
                                                    {
                                                        option?.articlefields
                                                            ?.title
                                                    }
                                                </label>
                                                <div className="ml-auto">
                                                    {option?.price > 0
                                                        ? `+ ${option.price.toFixed(2)}`
                                                        : ""}
                                                </div>
                                            </div>
                                        )}
                                </>
                            ))}
                            <Divider />
                        </div>
                    ))}
            </div>
            <div className="flex flex-column mt-auto">
                <div className="quantity-selector">
                    <button
                        onClick={() =>
                            setQuantity(quantity > 1 ? quantity - 1 : 1)
                        }
                    >
                        -
                    </button>
                    <span>{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                <div
                    className="add-item fixed col-12 md:col-6 cart-summary sticky-cart-summary add-to-order flex align-items-center justify-content-between p-4"
                    onClick={handleAdd}
                >
                    <div className="w-full">
                        add to order {currency}{" "}
                        {totalPrice.toFixed(2)}
                    </div>
                </div>
            </div>
        </div>
    );
};

const MenuItem = ({ label, imgSrc, handleCloseDetail }) => {
    return (
        <div className="menu-item">
            <div className="menu-item-left">
                <div onClick={handleCloseDetail}>
                    <ImageIcon
                        iconName={"close.png"}
                        style={{ width: "20px", height: "20px" }}
                    />
                </div>
                <label htmlFor={label} className="menu-item-label">
                    {label}
                </label>
            </div>
            <img
                src={imgSrc}
                alt={label}
                style={{ width: "80px", height: "80px" }}
            />
        </div>
    );
};

export default ProductList;
