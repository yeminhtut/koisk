import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Checkbox } from "primereact/checkbox";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { RadioButton } from "primereact/radiobutton";
import appActions from "../../../appActions";
import storage from "../../../utils/storage";
import ImageIcon from "../../../components/ImageIcon";
import AdsArea from "./AdsArea";

const URL = window?.config?.END_POINT;

const ProductList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("coffee");
    const [isDetail, setIsDetail] = useState(false);
    const [selectedItem, setSelectedItem] = useState({});
    const [cartDetail, setCartDetail] = useState({});
    const [currCart, setCurrCart] = useState({});
    const [order, setOrder] = useState();
    const [productGroups, setProductGroups] = useState();
    const [menuItems, setMenuItems] = useState([]);
    const storeid = storage.get("storeid");
    const terminalid = storage.get("terminalid");

    const productList = useSelector((state) => state.product.productList);

    useEffect(() => {
        if (!storeid && !terminalid) {
            navigate("/");
        }
    }, [storeid, terminalid]);

    // Fetch current cart from local storage on component mount
    useEffect(() => {
        const storedCart = storage.get("currCart");
        if (storedCart) {
            const cart = JSON.parse(storedCart);
            if (cart?.cartid) setCurrCart(cart);
        }
    }, []);

    // Fetch all products when the component mounts
    useEffect(() => {
        if (storeid) {
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

    // Fetch cart details when current cart changes
    useEffect(() => {
        if (currCart?.cartid) {
            const { cartid, orderid } = currCart;
            let sessionid = storage.get("sessionid") || currCart.sessionid;
            getCartBySession(cartid, orderid, sessionid);
        }
    }, [currCart]);

    useEffect(() => {
        const uniqueProductGroups = [
            ...new Set(productList.map((product) => product.categorycodes)),
        ];
        setProductGroups(uniqueProductGroups);
        const result = uniqueProductGroups.map((product) => {
            return {
                category: product,
                items: productList.filter(
                    (prod) => prod.categorycodes === product,
                ),
            };
        });
        setMenuItems(result);
        setActiveTab(uniqueProductGroups[0]);
    }, [productList]);

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

    const getImage = (item) =>
        item.images
            ? `${URL}/${item.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;

    const handleSelectedItem = (item) => {
        setIsDetail(true);
        setSelectedItem(item);
    };

    const handleAddItem = (order, cartid) => {
        const { sessionid, orderid } = order;
        storage.set("sessionid", sessionid);
        setSelectedItem({});
        setOrder(order);
        getCartBySession(cartid, orderid, sessionid);
        setIsDetail(false);
    };

    const handleViewCart = () => {
        if (cartDetail.itemcount > 0) {
            navigate("/confirm-order", { replace: true });
        }
    };

    const checkCartValue = () => !!(order?.orderid || currCart?.cartid);

    const handleClose = () => setIsDetail(false);

    const productListing = () => {
        return (
            <>
                <div className="menu-tabs">
                    <ul>
                        {menuItems.map((menu, index) => (
                            <MenuHeaderItem
                                key={index}
                                menu={menu}
                                setActiveTab={setActiveTab}
                                activeTab={activeTab}
                            />
                        ))}
                    </ul>
                </div>
                {menuItems
                    .find((menu) => menu.category === activeTab)
                    ?.items.map((item, index) => (
                        <div
                            className="menu-item p-2 cursor-pointer"
                            key={index}
                            onClick={() => handleSelectedItem(item)}
                        >
                            <img
                                src={getImage(item)}
                                alt={item.name}
                                className="menu-item-image"
                            />
                            <div className="menu-item-details">
                                <h3>{item.additionalfields.title}</h3>
                                <p className="mb-4">
                                    {item?.articlefields?.description}
                                </p>
                                <span className="menu-item-price">
                                    {item.baseprice.toFixed(2)}
                                </span>
                            </div>
                        </div>
                    ))}
                {(checkCartValue() || cartDetail?.cartid) && (
                    <div
                        className="fixed col-md-12 col-lg-6 cart-summary sticky-cart-summary add-to-order flex align-items-center justify-content-between p-4"
                        onClick={handleViewCart}
                    >
                        <span style={{ fontSize: "22px" }}>
                            {cartDetail.itemcount} item
                        </span>
                        <span style={{ fontSize: "28px" }}>View Cart</span>
                        <span style={{ fontSize: "22px" }}>
                            ₱ {cartDetail.totalamount}.00
                        </span>
                    </div>
                )}
            </>
        );
    };

    return (
        <div className="flex" style={{ minHeight: "100vh" }}>
            <AdsArea />
            <div className="menu-area">
                <div className="menu-items" style={{ paddingBottom: "120px" }}>
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
            </div>
        </div>
    );
};

const MenuHeaderItem = (props) => {
    const { menu, setActiveTab, activeTab } = props;
    const { category } = menu;
    const [menuName, setMenuName] = useState('');



    useEffect(() => {
        const getMenuName = async () => {
            let config = {
                method: "get",
                maxBodyLength: Infinity,
                url: `${URL}/sales/v1/category/search/fields?categorycode=${category}`,
                headers: {
                    Authorization: "test",
                },
            };

            try {
                const response = await axios.request(config);
                if (response.status === 200) {
                    if (response.data.length > 0) {
                        const { title } = response.data[0];
                        setMenuName(title); // Update the state with the description
                    }
                }
            } catch (error) {
                console.error(error);
            }
        };

        getMenuName(); // Call the async function
    }, [category]); // Depend on the category to re-fetch if it changes

    return (
        <li
            className={activeTab === menu.category ? "active" : ""}
            onClick={() => setActiveTab(menu.category)}
        >
            {menuName} {/* Display the fetched menu name */}
        </li>
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

    const handleCloseDetail = () => handleClose();
    const toast = useRef(null);

    const storeid = storage.get("storeid");
    const terminalid = storage.get("terminalid");

    useEffect(() => {
        getProductAddOn();
    }, [selectedItem]);

    useEffect(() => {
        if (productAddons.length > 0) {
            const output = productAddons.map((pao) => {
                const { defaultSelected } = pao;
                if (defaultSelected && defaultSelected.id) {
                    const { groupid, productpricecode } = defaultSelected;
                    return {
                        [groupid]: productpricecode,
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
            signonid: storage.get("signonid"),
            terminalid: terminalid,
            saleschannel: "dxpkiosk",
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

    function groupAddon(data) {
        const addongroups = data.addongroups.reduce((addongroups, producta) => {
            const brand1 = producta.groupid;
            if (!addongroups[brand1]) {
                addongroups[brand1] = [];
            }

            addongroups[brand1].push(producta);
            return addongroups;
        }, {});

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

    const handleRadioOptionChange = (groupId, value) => {
        setSelectedOptions((prevSelectedOptions) => {
            // Check if the key (groupId) already exists
            const existingIndex = prevSelectedOptions.findIndex(
                (option) => Object.keys(option)[0] === groupId,
            );

            // If the key exists, replace its value
            if (existingIndex !== -1) {
                const updatedOptions = [...prevSelectedOptions];
                updatedOptions[existingIndex] = { [groupId]: value };
                return updatedOptions;
            }

            // If the key doesn't exist, add the new key-value pair
            return [...prevSelectedOptions, { [groupId]: value }];
        });
    };

    const handleOptionChange = (addon, checked, productpricecode) => {
        setSelectedOptions((prevSelectedOptions) => {
            if (checked) {
                // If checked, store the productpricecode directly as a string
                return [...prevSelectedOptions, { [addon]: productpricecode }];
            } else {
                // If unchecked, remove the productpricecode by setting it to null or undefined
                const updatedOptions = [...prevSelectedOptions ];
                const filteredData = updatedOptions.filter(item => {
                    return !Object.values(item).includes(productpricecode);
                });
                
                // delete updatedOptions[addon]; // Remove the key for unchecked options
                return filteredData;
            }
        });
    };

    return (
        <div className="flex flex-column h-full">
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
                {productAddons.map((group) => (
                    <div key={group.addon} className="field px-4">
                        <h4>{group.addgroup.title}</h4>
                        {group.addons.map((option) => (
                            <div
                                key={option.id}
                                className="field-radiobutton flex"
                            >
                                {group.addgroup.title !== "customisation" && (
                                    <RadioButton
                                        inputId={`${group.addon}_${option.id}`}
                                        name={group.addon}
                                        value={option.productpricecode}
                                        onChange={(e) =>
                                            handleRadioOptionChange(
                                                group.addon,
                                                e.value,
                                            )
                                        }
                                        checked={
                                            // selectedOptions[group.addon] ===
                                            // option.productpricecode
                                            selectedOptions.some((item) =>
                                                Object.values(item).includes(
                                                    option.productpricecode,
                                                ),
                                            )
                                        }
                                    />
                                )}
                                {group.addgroup.title === "customisation" && (
                                    <Checkbox
                                        inputId={`${group.addon}_${option.id}`}
                                        name={group.addon}
                                        value={option.productpricecode}
                                        onChange={(e) =>
                                            handleOptionChange(
                                                group.addon,
                                                e.checked,
                                                option.productpricecode,
                                            )
                                        }
                                        checked={selectedOptions.some((item) =>
                                            Object.values(item).includes(
                                                option.productpricecode,
                                            ),
                                        )}
                                    />
                                )}

                                <label htmlFor={`${group.addon}_${option.id}`}>
                                    {option?.articlefields?.title}
                                </label>
                                <div className="ml-auto">
                                    {option?.price > 0
                                        ? `+ ${option.price.toFixed(2)}`
                                        : ""}
                                </div>
                            </div>
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
                    className="add-item w-full fixed col-md-12 col-lg-6 cart-summary sticky-cart-summary add-to-order flex align-items-center justify-content-between p-4"
                    onClick={handleAdd}
                >
                    <div className="w-full">
                        Add to order ₱{" "}
                        {(selectedItem.baseprice * quantity).toFixed(2)}
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
