import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { useNavigate, useLocation } from "react-router-dom";
import storage from "../../../utils/storage";
import MenuItem from "./MenuItem";
import ProductAddon from './ProductAddon';

const URL = window?.config?.END_POINT;

const ProductDetail = () => {
    const navigate = useNavigate();
    const toast = useRef(null);
    const { state } = useLocation();
    const { isEdit, record } = state;

    const [quantity, setQuantity] = useState(1);
    const [productAddons, setProductAddon] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);
    const [item, setItem] = useState({});
    const [currCart, setCurrCart] = useState({});

    const storeid = storage.get("storeid");
    const terminalid = storage.get("terminalid");
    const currency = storage.get("currency");
    const token = storage.get("token");

    const handleCloseDetail = () => {
        navigate(isEdit ? "/confirm-order" : "/item-listing", {
            replace: true,
        });
    };

    useEffect(() => {
        if (isEdit) {
            const itemList = JSON.parse(storage.get("storeProduct"));
            const editItem = itemList.find(
                (il) => il.productcode === record.productcode,
            );
            setQuantity(record.quantity);
            setItem(editItem);
        } else {
            setItem(record);
        }
    }, [isEdit, record]);

    useEffect(() => {
        const cart = JSON.parse(storage.get("currCart"));
        if (cart && cart.cartid) {
            setCurrCart(cart);
        }
    }, []);

    useEffect(() => {
        if (item && item.productpricecode) {
            getProductAddOn();
        }
    }, [item]);

    useEffect(() => {
        if (item && item.productcode) {
            const sumOfPrices = selectedOptions.reduce(
                (sum, item) => sum + (item.price || 0),
                0,
            );
            setTotalPrice((item.baseprice + sumOfPrices) * quantity);
        }
    }, [item, quantity, selectedOptions]);

    useEffect(() => {
        if (productAddons?.length > 0) {
            const cleanedData = isEdit
                ? handleEditAddons()
                : handleDefaultAddons();
            setSelectedOptions(cleanedData);
        }
    }, [productAddons, isEdit]);

    const handleDefaultAddons = () => {
        return productAddons
            .map((pao, i) => {
                const { defaultSelected, sortOrder } = pao;
                if (defaultSelected?.id) {
                    const {
                        groupid,
                        productpricecode,
                        addgroup,
                        productcode,
                        itemidx
                    } = defaultSelected;
                    return {
                        [groupid]: productpricecode,
                        index: i + 1,
                        groupid,
                        title: addgroup.articlefields.title,
                        productcode,
                        productpricecode,
                        itemidx,
                        additionalfields: { sortOrder },
                        itemmap: defaultSelected?.itemmap
                    };
                }
            })
            .filter(Boolean);
    }

    const handleEditAddons = () => {
        const editAddons = record.addons.map((item) => item.productcode);
        const result = [];
        productAddons.forEach((item) => {
            item.addons.forEach((addon, index) => {
                if (editAddons.includes(addon.productcode)) {
                    result.push({
                        [addon.groupid]: addon.productpricecode,
                        index: index + 1,
                        groupid: addon.groupid,
                        title: addon.articlefields.title,
                        productcode: addon.productcode,
                        productpricecode: addon.productpricecode,
                        price: addon.price,
                        additionalfields: {
                            sortOrder: addon?.addgroup?.sortorder,
                        },
                        itemmap: addon?.itemmap
                    });
                }
            });
        });
        return result.filter(Boolean);
    };

    const getProductAddOn = async () => {
        const { productpricecode } = item;
        try {
            const config = {
                method: "get",
                url: `${URL}/sales/v1/product-search/productpricecode/${productpricecode}?storeid=${storeid}&status=Active&language=en`,
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            };

            const response = await axios.request(config);
            const addOnList = groupAddon(response.data);
            setProductAddon(addOnList);
        } catch (error) {
            console.error("Error fetching product add-ons:", error);
        }
    };

    const getImage = () =>
        item.images
            ? `${URL}/${item.images.productimageone}`
            : `${process.env.PUBLIC_URL}/assets/images/ic_nonproduct.png`;

    const handleAdd = async () => {
        try {
            const posActive = await getPosStatus();
            if (posActive === 'Y') {
                currCart?.cartid ? addItem(currCart) : createCart();
            }
            else {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: 'store not open',
                });
            }
            
        } catch (error) {
            console.error("Error fetching POS status:", error);
        }
    };
    
    const getPosStatus = async () => {
        const config = {
            method: "get",
            url: `${URL}/pos/v1/sales/order/place?storeid=${storeid}`,
            headers: {
                Authorization: token
            }
        };
    
        try {
            const response = await axios.request(config);
            return response.data.toorder;
        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const addItem = async (cart) => {
        try {
            const { productpricecode } = item;
            const { orderid, cartid } = cart;

            const data = {
                orderid,
                productpricecode,
                quantity,
                additionalfields: {},
            };

            if (isEdit) {
                data.idx = record.idx;
            }

            if (selectedOptions.length > 0) {
                data.addons = selectedOptions.map((obj) => {
                    const groupId = Object.keys(obj)[0];
                    return {
                        orderid,
                        productpricecode: obj[groupId],
                        quantity,
                        itemidx: obj.itemidx,
                        additionalfields: {
                            sortOrder: obj?.additionalfields?.sortOrder,
                        },
                    };
                }); // old one
            }

            if (record.addons) {
                const oriArr = record.addons.map((ao) => ({
                    orderid: ao.orderid,
                    productpricecode: `${ao.storeproductid}-${ao.productcode}`,
                    quantity: 1,
                    idx: ao.idx,
                    itemidx: ao.itemidx,
                    additionalfields: {
                        sortOrder: ao?.sortOrder,
                    },
                }));

                // Ensure all elements from A are included in B
                oriArr.forEach((aItem) => {
                    const foundInB = data.addons.some(
                        (bItem) =>
                            bItem.productpricecode === aItem.productpricecode,
                    );
                    if (!foundInB) {
                        data.addons.push({
                            orderid: aItem.orderid,
                            productpricecode: aItem.productpricecode,
                            quantity: 0,
                            idx: aItem.idx,
                        });
                    }
                });

                // Add `idx` to existing elements in B if they match with A
                data.addons.forEach((bItem) => {
                    const matchInA = oriArr.find(
                        (aItem) =>
                            aItem.productpricecode === bItem.productpricecode,
                    );
                    if (matchInA) {
                        bItem.idx = matchInA.idx;
                    }
                });
            }

            const payloadData = JSON.stringify(data);

            const response = await axios.post(
                `${URL}/pos/v1/cart/${cartid}/item?itemgroup=Y`,
                payloadData,
                {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                },
            );

            if (response.status === 200) {
                handleAddItem(response.data);
            } else {
                toast.current.show({
                    severity: "info",
                    summary: "Info",
                    detail: response.data.message,
                });
            }
        } catch (error) {
            console.error("Error adding item to cart:", error);
        }
    };

    const createCart = () => {
        const data = JSON.stringify({
            storeid: storeid,
            language: "en",
            qno: "Y",
            terminalid: terminalid,
            saleschannel: "dxpkiosk",
        });

        axios
            .post(`${URL}/pos/v1/cart/new`, data, {
                headers: {
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            })
            .then((response) => {
                if (response.status == 200) {
                    storage.set("currCart", JSON.stringify(response.data));
                    const { sessionid } = response.data;
                    storage.set("sessionid", sessionid);
                    addItem(response.data);
                    //setCurrCart(response.data);
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

    const getSortOrder = (prop) => {
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
            const sortedData = addongroupArrays.map((obj) => ({
                ...obj,
                addons: obj.addons.sort((a, b) => a.itemidx - b.itemidx),
              }));
              
            return sortedData.sort(getSortOrder("sortOrder"));
        }
    };

    const handleRadioOptionChange = (group, option, i) => {
        const { addon } = group;
        const { price, productpricecode } = option;
        const { sortOrder } = group;
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
                    productcode: option.productcode,
                    itemidx: option.itemidx,
                    additionalfields: { sortOrder },
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
                    productcode: option.productcode,
                    itemidx: option.itemidx,
                    additionalfields: { sortOrder },
                },
            ];
        });
    };

    const handleOptionChange = (addon, option, productpricecode, group) => {
        const flattened = selectedOptions.flatMap((obj) => Object.values(obj));
        const isIncluded = flattened.includes(productpricecode);
        const { price, itemidx } = option;
        const { sortOrder } = group;
        setSelectedOptions((prevSelectedOptions) => {
            if (!isIncluded) {
                // If checked, store the productpricecode directly as a string
                return [
                    ...prevSelectedOptions,
                    {
                        [addon]: productpricecode,
                        price,
                        itemidx,
                        additionalfields: { sortOrder },
                    },
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

    const getParentGroup = (option) => {
        const { itemmap } = option
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

    const isEmptyObject = (obj) => Object.keys(obj).length === 0;

    const handleAddItem = (order) => {
        const { sessionid } = order;
        storage.set("sessionid", sessionid);
        if (isEdit) {
            navigate("/confirm-order", { replace: true });
        } else {
            navigate("/item-listing", { replace: true });
        }
    };
    return (
        <>
            {item && item.productcode && (
                <div className="chat-area" style={{ paddingBottom: "300px" }}>
                    <Toast ref={toast} />
                    <MenuItem
                        label={item?.articlefields.title}
                        imgSrc={getImage()}
                        handleCloseDetail={handleCloseDetail}
                        isEdit={isEdit}
                    />
                    <div className="item-info px-4 pt-4 pb-2">
                        <h2>{item?.articlefields?.title}</h2>
                        <p>{item?.articlefields?.description}</p>
                    </div>

                    <div>
                        {productAddons &&
                            productAddons.map((group, i) => (
                                <div key={i} className="field px-4">
                                    <h4>{group.addgroup.title}</h4>
                                    {group.addons.map((option, index) => (
                                        <div key={index}>
                                            {group.addgroup.multiselect !==
                                                "Y" && (
                                                <div className="field-radiobutton flex">
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
                                                        {
                                                            option
                                                                ?.articlefields
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
                                            {group.addgroup.multiselect ==
                                                "Y" &&
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
                                                                        option,
                                                                        option.productpricecode,
                                                                        group,
                                                                    )
                                                                }
                                                                className="hidden-checkbox"
                                                            />
                                                            <span
                                                                className={`checkmark ${getChecked(option) ? "checked" : ""}`}
                                                            />
                                                        </label>
                                                        <label
                                                            htmlFor={`${group.addon}_${option.id}`}
                                                        >
                                                            {
                                                                option
                                                                    ?.articlefields
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
                                        </div>
                                    ))}
                                    <Divider />
                                </div>
                            ))}
                    </div>
                    {/* <ProductAddon
                        productAddons={productAddons}
                        selectedOptions={selectedOptions}
                    /> */}
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
                            <button onClick={() => setQuantity(quantity + 1)}>
                                +
                            </button>
                        </div>
                        <div
                            className="fixed col-12 md:col-6 cart-summary sticky-cart-summary flex align-items-center justify-content-between p-4"
                            onClick={handleAdd}
                        >
                            <div className="w-full">
                                add to order {currency}
                                {totalPrice.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetail;
