import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { InputText } from "primereact/inputtext";
import { Divider } from "primereact/divider";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import storage from "../../../utils/storage";
import ImageIcon from "../../../components/ImageIcon";
import OrderConfirmation from "./OrderConfirmation";
import withInactivityDetector from "../../../withInactivityDetector";

const { END_POINT: URL, AuthorizationHeader } = window?.config || {};

const storeid = storage.get("storeid");
const terminalid = storage.get("terminalid");

const ConfirmOrder = () => {
    const navigate = useNavigate();
    const toast = useRef(null);
    const [currCart, setCurrCart] = useState(
        () => JSON.parse(storage.get("currCart")) || {},
    );
    const { cartid, orderid } = currCart;

    const [sessionid, setSessionId] =
        useState(() => storage.get("sessionid")) || "";
    const [cartDetail, setCartDetail] = useState({});
    const [isSuccess, setIsSuccess] = useState(false);
    const [orderNumber, setOrderNumber] = useState("");
    const [isDeviceActive, setIsDeviceActive] = useState(false);
    const [currentIdx, setCurrentIdx] = useState();
    const devices = JSON.parse(storage.get("registeredDeviceData"));
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [tenderTypes, setTenderTypes] = useState([]);
    const [selectedMethod, setSelectedMethod] = useState("cash");
    const [isLoadingEft, setIsLoadingEft] = useState(false);
    const timeOutTime = storage.get("payTimeOut");
    const currency = storage.get('currency')

    const [visible, setVisible] = useState(false);

    const closeDialog = () => {
        setVisible(false);
    };

    useEffect(() => {
        getTerminalTenders();
        //getDeviceStatus();
    }, []);

    useEffect(() => {
        const { items } = cartDetail;
        if (items && items.length < 1) {
            storage.remove('currCart')
            navigate("/", { replace: true });
            //confirmClearCart
        }
    }, [cartDetail]);

    const getWebSocket = (timer) => {
        let data = JSON.stringify({
            deviceid: `kiosk_${storeid}_${terminalid}`,
            status: "Active",
        });
        let config = {
            method: "post",
            url: `${URL}/broker/v1/device/client`,
            headers: {
                Authorization: "7550935cd2bc97f0307afb2aa204e245",
                "Content-Type": "application/json",
            },
            data: data,
        };
        axios
            .request(config)
            .then((response) => {
                if (response.status === 200 && response.data) {
                    const { clientid, socketurl } = response.data;
                    getEft();
                    handleWebSocket(socketurl, timer);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getEft = () => {
        let config = {
            method: "get",
            url: `${URL}/system/v1/store/device/search/fields?devicegroup=Eft&status=Active&storeid=${storeid}`,
            headers: {
                Authorization: AuthorizationHeader,
            },
        };

        axios
            .request(config)
            .then((response) => {
                const { deviceid } = response.data[0];
                storage.set("eft", deviceid);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getDeviceStatus = () => {
        const { eft } = devices;
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${URL}/broker/v1/device/clients`,
            headers: {
                Authorization: AuthorizationHeader,
            },
        };
        //check device status
        axios
            .request(config)
            .then((response) => {
                const result = response.data;
                const deviceStatus = result.find((r) => r.deviceid == eft);
                if (deviceStatus && deviceStatus.status === "Active") {
                    setIsDeviceActive(true);
                } else {
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Device is not active",
                        life: 10000,
                    });
                    setIsDeviceActive(false);
                    setIsSubmitted(false);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    useEffect(() => {
        if (cartid) {
            fetchCartDetails();
        }
    }, [cartid]);

    const fetchCartDetails = async (newSession) => {
        try {
            const { data } = await axios.get(
                //`${URL}/pos/v1/cart/${cartid}/${orderid}?sessionid=${newSession ? newSession : sessionid}&status=sales`,
                `${URL}/pos/v1/cart/${cartid}/${orderid}?status=sales`,
                {
                    headers: {
                        Authorization: "test",
                        "Content-Type": "application/json",
                    },
                    maxBodyLength: Infinity,
                },
            );
            setCartDetail(data);
        } catch (error) {
            console.error("Error fetching cart details:", error);
        }
    };

    const paymentSignOn = () => {
        const { cartid, sessionid, orderid } = currCart;
        const { totalamount } = cartDetail;
        let data = JSON.stringify({
            orderid: orderid,
            payamount: totalamount,
            paytype: "eft",
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `${URL}/pos/v1/cart/${cartid}/payment?sessionid=${sessionid}`,
            headers: {
                Authorization: "test",
                "Content-Type": "application/json",
            },
            data: data,
        };

        axios
            .request(config)
            .then((response) => {
                const { idx } = response.data;
                setCurrentIdx(idx);
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handlePayment = () => {
        setIsSubmitted(true);
        //handleCashPayment()
        if (selectedMethod.title.toLowerCase() === "cash") {
            return handleCashPayment();
        } else {
            const timeOut = timeOutTime > 0 ? timeOutTime * 1000 : timeOutTime;
            //if (isDeviceActive) {
                setIsLoadingEft(true);
                paymentSignOn();
                const timer = setTimeout(() => {
                    // Change another state after 30 seconds
                    setIsLoadingEft(false); // Optionally stop the loading state
                    setIsSubmitted(false);
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: `No response from EFT`,
                        life: 10000,
                    });
                }, timeOut); // 30 seconds in milliseconds
                getWebSocket(timer);
            // }
            // else {
            //     toast.current.show({
            //         severity: "error",
            //         summary: "Error",
            //         detail: `Device is not active`,
            //         life: 10000,
            //     });
            // }
        }
    };

    const handleWebSocket = (socketurl, timer) => {
        const { totalamount } = cartDetail;
        const ws = new WebSocket(socketurl);
        const uId = "EFT_" + new Date().getTime();
        const kioskId = "kiosk_" + storeid + "_" + terminalid;
        const { eft } = devices;
        const msgToSend = {
            header: {
                msgid: uId,
                to: eft,
                from: kioskId,
                rqtype: "pay",
                rqsubtype: "sale",
                deviceType: "eft",
            },
            message: {
                amount: totalamount * 100,
                cardtype: selectedMethod.tagtype
            },
        };
        // Connection opened
        ws.onopen = () => {
            console.log("WebSocket connected");
            ws.send(JSON.stringify(msgToSend));
        };

        // Listen for messages
        ws.onmessage = (event) => {
            const response = JSON.parse(event.data);
            console.log("message received", response);
            if (response.message.response.status === "failure") {
                // Handle failure case, e.g., show a message to the user
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: `Transaction Failed: ${response.message.response.responsetext}`,
                    life: 10000,
                });
                setIsSubmitted(false);
                setIsLoadingEft(false);
                clearTimeout(timer);
            } else {
                successEftRes();
                setIsLoadingEft(false);
                clearTimeout(timer);
                setIsSubmitted(false);
            }
        };

        // Handle connection close
        ws.onclose = () => {
            console.log("WebSocket disconnected");
        };

        // Handle errors
        ws.onerror = (error) => {
            console.error("WebSocket error:", error);
        };

        // Clean up the WebSocket connection on unmount
        return () => {
            ws.close();
        };
    };

    const successEftRes = async () => {
        try {
            const { cartid, orderid, totalamount } = cartDetail;
            const paymentData = {
                description: "card",
                orderid,
                payamount: totalamount,
                paytype: "Card",
                paytyperef: "Card",
            };
            const result = await axios.post(
                `${URL}/pos/v1/cart/${cartid}/payment?${sessionid}`,
                JSON.stringify(paymentData),
                {
                    headers: {
                        Authorization: AuthorizationHeader,
                        "Content-Type": "application/json",
                    },
                    maxBodyLength: Infinity,
                },
            );
            const { idx } = result.data;
            if (idx) {
                handleCardPaid(idx);
                // closeCart();
                // storage.remove("currCart");
            }
        } catch (error) {
            console.error("Error processing payment:", error);
        }
    };

    const handleCardPaid = async (idx) => {
        const { cartid, orderid } = cartDetail;
        const data = {
            orderid,
            idx,
        };
        const result = await axios.put(
            `${URL}/pos/v1/cart/${cartid}/payment/paid`,
            JSON.stringify(data),
            {
                headers: {
                    Authorization: AuthorizationHeader,
                    "Content-Type": "application/json",
                },
                maxBodyLength: Infinity,
            },
        );
        if (result.status == 200) {
            closeCart();
            storage.remove("currCart");
        }
        setIsSubmitted(false);
    };

    const handleCashPayment = async () => {
        try {
            const { cartid, orderid, totalamount } = cartDetail;
            const paymentData = {
                description: "cash",
                orderid,
                payamount: totalamount,
                paytype: "Cash",
                paytyperef: "Cash",
            };
            const result = await axios.post(
                `${URL}/pos/v1/cart/${cartid}/payment?${sessionid}`,
                JSON.stringify(paymentData),
                {
                    headers: {
                        Authorization: AuthorizationHeader,
                        "Content-Type": "application/json",
                    },
                    maxBodyLength: Infinity,
                },
            );
            const { idx } = result.data;
            if (idx) {
                setIsSubmitted(false);
                closeCart();
                storage.remove("currCart");
            }
        } catch (error) {
            console.error("Error processing payment:", error);
        }
    };

    const closeCart = async () => {
        try {
            const { cartid, orderid } = cartDetail;
            const closeData = {
                orderid,
                //signonid,
                terminalid,
            };

            const { data } = await axios.put(
                `${URL}/pos/v1/cart/${cartid}/close`,
                JSON.stringify(closeData),
                {
                    headers: {
                        Authorization: "test",
                        "Content-Type": "application/json",
                    },
                    maxBodyLength: Infinity,
                },
            );
            setOrderNumber(data);
            setIsSuccess(true);
        } catch (error) {
            console.error("Error closing cart:", error);
        }
    };

    const clearCart = async () => {
        try {
            const { cartid, orderid } = cartDetail;
            await axios.put(
                `${URL}/pos/v1/cart/${cartid}/cancel`,
                JSON.stringify({ orderid }),
                {
                    headers: {
                        Authorization: "test",
                        "Content-Type": "application/json",
                    },
                    maxBodyLength: Infinity,
                },
            );
            storage.remove("currCart");
            navigate("/", { replace: true });
        } catch (error) {
            console.error("Error voiding cart:", error);
        }
    };

    const handleBack = () => navigate("/item-listing", { replace: true });

    const updateCartItem = async (item, quantity) => {
        try {
            const { idx } = item;
            const { orderid, cartid } = cartDetail;
            const data = {
                orderid,
                idx,
                quantity,
                addons: [],
            };

            const repsonse = await axios.post(
                `${URL}/pos/v1/cart/${cartid}/item`,
                JSON.stringify(data),
                {
                    headers: {
                        Authorization: "test",
                        "Content-Type": "application/json",
                    },
                    maxBodyLength: Infinity,
                },
            );
            const { sessionid } = repsonse.data;
            storage.set("sessionid", sessionid);
            fetchCartDetails(sessionid);
        } catch (error) {
            console.error("Error updating cart item:", error);
        }
    };

    const removeOrderItem = (item) => updateCartItem(item, 0);

    const increaseOrderItem = (item) => updateCartItem(item, item.quantity + 1);

    const decreaseOrderItem = (item) => {
        if (item.quantity > 1) {
            updateCartItem(item, item.quantity - 1);
        }
    };

    const handleSelection = (method) => {
        setSelectedMethod(method);
    };

    const getTerminalTenders = async () => {
        try {
            const config = {
                method: "get",
                maxBodyLength: Infinity,
                url: `${URL}/system/v1/store/tag/search/fields?storeid=${storeid}&terminalid=${terminalid}&tagtype=tender&taggroup=tprops&status=Active`,
                headers: {
                    Authorization: "test",
                    "Content-Type": "application/json",
                },
            };

            const response = await axios.request(config);

            if (response.status === 200 && Array.isArray(response.data)) {
                const tenderTypes = response.data
                .map((r) => ({
                    title: r.title,
                    tagtype: r.tagtypevalue
                }))
                .filter(Boolean);
                setTenderTypes(tenderTypes);
            } else {
                toast.current.show({
                    severity: "error",
                    summary: "Error",
                    detail: "No payment type is defined",
                    life: 10000,
                });
            }
        } catch (error) {
            console.error("Error fetching terminal tenders:", error);
        }
    };

    const CartView = () => (
        <>
            {isLoadingEft && (
                <div className="overlay" id="overlay">
                    <ImageIcon
                        iconName={"loading.gif"}
                        style={{ width: "300px", height: "300px" }}
                    />
                </div>
            )}
            <div className="flex w-full" style={{ height: "100vh" }}>
                <div className="p-4 w-full">
                    <div className="flex align-items-center justify-content-between mb-4">
                        <div className="flex">
                            {/* <i className="pi pi-home" 
                            style={{ marginRight: '10px', cursor: 'pointer', fontSize: '30px', color: '#807d7d' }} 
                        /> */}
                            <div onClick={handleBack}>
                                <ImageIcon
                                    iconName={"back_arrow.png"}
                                    style={{ width: "30px", height: "30px" }}
                                />
                            </div>
                        </div>
                        <h2>Confirm Order</h2>
                        <div
                            className="clsbtn cursor-pointer"
                            onClick={confirmClearCart}
                        >
                            Clear
                        </div>
                    </div>
                    <div className="scrollable h-full" style={{ paddingBottom: "250px" }}>
                        <div className="mb-4">
                            <h3>Order Items</h3>
                            {cartDetail.items?.map((item, index) => (
                                <OrderItem
                                    item={item}
                                    key={index}
                                    removeOrderItem={removeOrderItem}
                                    increaseOrderItem={increaseOrderItem}
                                    decreaseOrderItem={decreaseOrderItem}
                                    items={cartDetail.items}
                                    confirmClearCart={confirmClearCart}
                                />
                            ))}
                        </div>
                    </div>
                    {tenderTypes.length > 0 && (
                        <div
                            className="p-0 align-items-center justify-content-center fixed right-0 bottom-0 col-12 md:col-6"
                            style={{ background: "#f9fafb" }}
                        >
                            <div className="mb-4">
                                <h3 className="pl-4">Choose Payment Method</h3>
                                <div className="flex px-4">
                                    {tenderTypes.map((tender, i) => (
                                        <div
                                            key={i}
                                            className={`col-4 justify-content-center align-items-center mr-2 p-4 payment-option 
                                        ${selectedMethod === tender ? "selected" : ""}`}
                                            onClick={() =>
                                                handleSelection(tender)
                                            }
                                        >
                                            {tender.title}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <Button
                                type="button"
                                className="w-full p-4"
                                style={{
                                    backgroundColor: "#51545D",
                                    color: "#FFF",
                                    fontSize: "18px",
                                }}
                                onClick={checkMember}
                                label={`Pay ${currency} ${cartDetail.totalamount?.toFixed(2)}`}
                                disabled={isSubmitted || !selectedMethod.title}
                            />
                        </div>
                    )}
                </div>
            </div>
        </>
    );

    const handleDialog = () => {
        closeDialog();
        handlePayment();
    };

    const checkMember = () => {
        //setVisible(true);
        handlePayment()
    };

    const accept = () => {
        clearCart();
    };

    const reject = () => {};

    const confirmClearCart = () => {
        confirmDialog({
            message: "Do you want to clear your order?",
            header: "Clear Order Confirmation",
            icon: "pi pi-info-circle",
            defaultFocus: "reject",
            acceptClassName: "p-button-danger",
            accept,
            reject,
        });
    };

    const [ memberEmail, setMemberEmail ] = useState()

    const handleChangeEmail = (e) => {
        setMemberEmail(e.target.value)
    }

    const handleMember = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: `${URL}/crm/v1/member/search?search_field=emailid&search_condi=eq&search_value=${memberEmail}`,
            headers: { 
                'Authorization': 'test'
            }
        };

        axios.request(config)
        .then((response) => {
            if (response.status == 200) {
                console.log('go there')
            }
            else {
                console.log('show error')
            }
        })
        .catch((error) => {
            console.log(error);
        });

    }

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            {!isSuccess && <CartView />}
            {isSuccess && (
                <OrderConfirmation
                    orderNumber={orderNumber}
                    handleBack={handleBack}
                />
            )}
            <Dialog
                visible={visible}
                onHide={closeDialog}
                header="place order with an account"
                style={{ width: "350px" }}
                className="order-dialog"
                draggable={false}
                modal
            >
                <div className="order-form-container">
                    <label htmlFor="email" className="email-label mb-2">
                        email address
                    </label>
                    <InputText
                        id="email"
                        className="email-input w-full mt-4"
                        placeholder="ja12_123@gmail.com"
                        onChange={handleChangeEmail}
                    />
                    <Button
                        type="button"
                        className="w-full mt-2"
                        style={{
                            backgroundColor: "#51545D",
                            color: "#FFF",
                            fontSize: "18px",
                        }}
                        onClick={handleMember}
                        label="done"
                    />

                    <Divider align="center">
                        <span>OR</span>
                    </Divider>

                    <p className="signup-text text-center">
                        <a href="#" className="signup-link">
                            sign up
                        </a>{" "}
                        for a free voucher
                    </p>

                    <p className="skip-link text-right">
                        <a href="#" onClick={handleDialog}>
                            skip
                        </a>
                    </p>
                </div>
            </Dialog>
        </>
    );
};

const OrderItem = ({
    item,
    removeOrderItem,
    increaseOrderItem,
    decreaseOrderItem
}) => {
    const { addons } = item;
    const [quantity, setQuantity] = useState(item.quantity);

    const increaseItemQty = () => {
        setQuantity(quantity + 1);
        increaseOrderItem(item);
    };

    const decreaseItemQty = () => {
        const currQty = quantity - 1;
        if (currQty == 0) {
            removeOrderItem(item);
        } else {
            setQuantity(currQty);
            decreaseOrderItem(item);
        }
    };

    const getItemAddon = () => {
        const resultArr = addons.map((ao) => ao.description);
        if (resultArr.length > 0) {
            return resultArr.join(", ");
        }
        return "";
    };

    const getTotalAmount = () => {
        const totalSum = addons.reduce((sum, item) => sum + item.totalamount, 0);
        return item.totalamount + totalSum
    }

    const cartArea = () => {
        return (
            <>
                <div className="flex mb-4 align-items-center">
                    <div className="col">
                        <h4 className="m-0 text-xl">{item.description}</h4>
                        <p className="m-0">{getItemAddon()}</p>
                    </div>
                    <div className="col">
                        <div className="order-selector flex justify-content-center align-items-center my-2">
                            <button onClick={() => decreaseItemQty(item)}>
                                -
                            </button>
                            <span className="mx-4">{quantity}x</span>
                            <button onClick={increaseItemQty}>+</button>
                        </div>
                    </div>
                    <div className="col text-right">{getTotalAmount().toFixed(2)}</div>
                    {/* <div className="col text-right pr-0 flex justify-content-end">
                    <Button
                        label="Remove"
                        onClick={() => handleRemoveItem(item)}
                        severity="danger"
                        text
                    />
                </div> */}
                </div>
            </>
        );
    };

    return <>{cartArea()}</>;
};

export default ConfirmOrder;
//export default withInactivityDetector(ConfirmOrder);
