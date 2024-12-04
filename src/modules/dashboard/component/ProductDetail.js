import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Divider } from "primereact/divider";
import { Toast } from "primereact/toast";
import { useNavigate, useLocation } from "react-router-dom";
import storage from "../../../utils/storage";
import MenuItem from "./MenuItem";

const URL = window?.config?.END_POINT;

const ProductDetail = () => {
    const navigate = useNavigate();
    const toast = useRef(null);
    const params = useLocation();
    const { state } = params;
    const { isEdit, record } = state;

    const [quantity, setQuantity] = useState(1);
    const [productAddons, setProductAddon] = useState([]);
    const [selectedOptions, setSelectedOptions] = useState([]);
    const [totalPrice, setTotalPrice] = useState(0);

    const handleCloseDetail = () => {
        const targetPath = isEdit ? "/confirm-order" : "/item-listing"
        navigate(targetPath, { replace: true });
    };
    

    const storeid = storage.get("storeid");
    const terminalid = storage.get("terminalid");
    const currency = storage.get("currency");
    const token = storage.get("token");

    const [item, setItem] = useState({});

    const [currCart, setCurrCart] = useState({});

    useEffect(() => {
        if (!isEdit) {
            setItem(record);
        } else {
            const itemList = JSON.parse(storage.get("storeProduct"));
            const editItem = itemList.find(
                (il) => il.productcode == record.productcode,
            );
            setItem(editItem); // find and search
        }
    }, [isEdit]);

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
        if (productAddons && productAddons.length > 0) {
            const output = productAddons.map((pao, i) => {
                const { defaultSelected } = pao;
                if (defaultSelected && defaultSelected.id) {
                    const {
                        groupid,
                        productpricecode,
                        articlefields,
                        productcode,
                    } = defaultSelected;
                    return {
                        [groupid]: productpricecode,
                        index: i + 1,
                        groupid,
                        title: articlefields.title,
                        productcode: productcode,
                        productpricecode,
                    };
                }
            });
            //console.log('here', productAddons)
            const cleanedData = output.filter((item) => item !== undefined);
            //console.log('checking', cleanedData)
            setSelectedOptions(cleanedData);
        }
    }, [productAddons]);

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

    const handleAdd = () =>
        currCart?.cartid ? addItem(currCart) : createCart();

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
                // data.addons = selectedOptions.map((obj) => {
                //     const groupId = Object.keys(obj)[0];
                //     return {
                //         orderid,
                //         productpricecode: obj[groupId],
                //         quantity,
                //     };
                // }); // old one

                data.addons = selectedOptions.map((obj) => {
                    const groupId = Object.keys(obj)[0];
                    return {
                        orderid,
                        productpricecode,
                        quantity,
                    };
                });
            }

            // if (isEdit) {
            //     // const result = modifyMatchingA(selectedOptions, record.addons)
            //     // console.log('result are', result)
            //     console.log('damn', record.addons)
            //     console.log('there you go', selectedOptions)
            // }

            // console.log('record')

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

    const modifyMatchingA = (A, B) => {
        return A.map((aItem) => {
            const matchingB = B.find(
                (bItem) => bItem.productcode === aItem.productcode,
            );
            if (matchingB) {
                // Add the index from B to the A object
                return {
                    ...aItem,
                    idxFromB: matchingB.index, // Use a meaningful key like idxFromB
                };
            }
            return aItem; // Return the original object if no match
        });
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
            return addongroupArrays.sort(getSortOrder("sortOrder"));
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
                    productcode: option.productcode,
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
        // const isProductPriceCodeIncluded = selectedOptions.some(item => item.productpricecode == option.productpricecode);
        // return isProductPriceCodeIncluded
        return selectedOptions.some((item) =>
            Object.values(item).includes(option.productpricecode),
        );
        // return true
    };

    const getParentGroup = ({ itemmap }) => {
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
                    <div className="item-info p-4">
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
                                add to order {currency} {totalPrice.toFixed(2)}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ProductDetail;
