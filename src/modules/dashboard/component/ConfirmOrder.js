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
import OrderItem from "./OrderItem";

const { END_POINT: URL, AuthorizationHeader: token } = window?.config || {};

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
    const currency = storage.get("currency");

    const [visible, setVisible] = useState(false);
    const [storeid, setStoreId] = useState();
    const [terminalid, setTerminalId] = useState();
    const [dialogVisible, setDialogVisible] = useState(false);

    useEffect(() => {
        const storeId = storage.get("storeid");
        const terminalId = storage.get("terminalid");
        setStoreId(storeId);
        setTerminalId(terminalId);
    }, []);

    const closeDialog = () => {
        setVisible(false);
    };

    useEffect(() => {
        if (storeid && terminalid) {
            getTerminalTenders();
            //getDeviceStatus();
        }
    }, [storeid, terminalid]);

    const getWebSocket = (timer) => {
        let data = JSON.stringify({
            deviceid: `kiosk_${storeid}_${terminalid}`,
            status: "Active",
        });
        let config = {
            method: "post",
            url: `${URL}/broker/v1/device/client`,
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
            data: data,
        };
        axios
            .request(config)
            .then((response) => {
                if (response.status === 200 && response.data) {
                    const { socketurl } = response.data;
                    handleWebSocket(socketurl, timer);
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getDeviceStatus = () => {
        const { eft } = devices;
        //console.log('eft are', eft)
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${URL}/broker/v1/device/clients`,
            headers: {
                Authorization: token,
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
                `${URL}/pos/v1/cart/${cartid}/${orderid}?sessionid=${newSession ? newSession : sessionid}&status=sales`,
                {
                    headers: {
                        Authorization: token,
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
            paytype: selectedMethod.tagtype,
        });

        let config = {
            method: "post",
            maxBodyLength: Infinity,
            url: `${URL}/pos/v1/cart/${cartid}/payment?sessionid=${sessionid}`,
            headers: {
                Authorization: token,
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
        if (selectedMethod.title.toLowerCase() === "cash") {
            return handleCashPayment();
        } else {
            const timeOut = timeOutTime > 0 ? timeOutTime * 1000 : 30000;
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
        const { deviceid } = selectedMethod
        const { totalamount } = cartDetail;
        const ws = new WebSocket(socketurl);
        const uId = "EFT_" + new Date().getTime();
        const kioskId = "kiosk_" + storeid + "_" + terminalid;
        const msgToSend = {
            header: {
                msgid: uId,
                to: deviceid,
                from: kioskId,
                rqtype: "pay",
                rqsubtype: "sale",
                deviceType: "eft",
            },
            message: {
                amount: totalamount * 100,
                cardtype: selectedMethod.tagtype,
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
                successEftRes(response.message);
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

    const successEftRes = async (res) => {
        try {
            const { cartid, orderid, totalamount } = cartDetail;
            const data = JSON.parse(res.response.data);
            const paymentData = {
                description: selectedMethod.tagtype,
                orderid,
                payamount: totalamount,
                paytype: selectedMethod.tagtype,
                paytyperef: data?.invoiceNo,
                additionalfields: data,
            };
            const result = await axios.post(
                `${URL}/pos/v1/cart/${cartid}/payment?${sessionid}`,
                JSON.stringify(paymentData),
                {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                    maxBodyLength: Infinity,
                },
            );
            const { idx } = result.data;
            if (idx) {
                handleCardPaid(idx);
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
                    Authorization: token,
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
                        Authorization: token,
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
                terminalid,
            };

            const { data } = await axios.put(
                `${URL}/pos/v1/cart/${cartid}/close`,
                JSON.stringify(closeData),
                {
                    headers: {
                        Authorization: token,
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

    const formattedOrders = (orders, quantity) => {
        const result = orders.map((order) => ({
            orderid: order.orderid,
            idx: order.idx,
            productpricecode: order.storeproductid
                ? `${order.storeproductid}-${order.productcode}`
                : order.productcode,
            quantity: quantity,
        }));
        return result;
    };

    const updateCartItem = async (item, quantity) => {
        const { idx, addons } = item;
        const { orderid, cartid } = cartDetail;
        const data = {
            orderid,
            idx,
            quantity,
            addons: formattedOrders(addons, quantity),
        };
        try {
            const repsonse = await axios.post(
                `${URL}/pos/v1/cart/${cartid}/item`,
                JSON.stringify(data),
                {
                    headers: {
                        Authorization: token,
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

    const removeOrderItem = (item) => {
        const { items } = cartDetail;
        if (items && items.length == 1) {
            setDialogVisible(true);
        } else {
            updateCartItem(item, 0);
        }
    };

    const increaseOrderItem = (item) => {
        updateCartItem(item, item.quantity + 1);
    };

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
                    Authorization: token,
                    "Content-Type": "application/json",
                },
            };

            const response = await axios.request(config);

            if (response.status === 200 && Array.isArray(response.data)) {
                const tenderTypes = response.data
                    .map((r) => ({
                        title: r.title,
                        tagtype: r.tagtypevalue,
                        deviceid: r?.additionalfields?.deviceid,
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

    const getBottomTotalAmount = () => {
        return (cartDetail?.totalamount ?? 0).toFixed(2);
    };

    const handleEditItem = (item) => {
        navigate("/item-detail", {
            state: {
                record: item,
                isEdit: true,
            },
        });
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
                <div className="p-4 pt-2 w-full">
                    <div className="flex align-items-center justify-content-between mb-2">
                        <div className="flex" style={{ color: "#51545D" }}>
                            <div onClick={handleBack}>
                                <ImageIcon
                                    iconName={"back_arrow.png"}
                                    style={{ width: "30px", height: "30px" }}
                                />
                            </div>
                        </div>
                        <h2 style={{ fontSize: '16pt'}}>Confirm Order</h2>
                        <div
                            className="clsbtn cursor-pointer"
                            onClick={() => setDialogVisible(true)}
                        >
                            Clear
                        </div>
                    </div>
                    <div
                        className="scrollable h-full"
                        style={{ paddingBottom: "280px" }}
                    >
                        <div className="mb-4">
                            <h3 style={{ fontSize: '12pt'}}>Order Items</h3>
                            {cartDetail.items?.map((item, index) => (
                                <OrderItem
                                    item={item}
                                    key={index}
                                    removeOrderItem={removeOrderItem}
                                    increaseOrderItem={increaseOrderItem}
                                    decreaseOrderItem={decreaseOrderItem}
                                    items={cartDetail.items}
                                    confirmClearCart={confirmClearCart}
                                    handleEditItem={handleEditItem}
                                />
                            ))}
                        </div>
                    </div>
                    {tenderTypes.length > 0 && (
                        <div
                            className="p-0 align-items-center justify-content-center fixed right-0 bottom-0 col-12 md:col-6"
                            style={{ background: "#f9fafb" }}
                        >
                            <PaymentMethodSelector
                                tenderTypes={tenderTypes}
                                selectedMethod={selectedMethod}
                                handleSelection={handleSelection}
                            />
                            <PlaceOrderButton
                                checkMember={checkMember}
                                currency={currency}
                                getBottomTotalAmount={getBottomTotalAmount}
                                isSubmitted={isSubmitted}
                                selectedMethod={selectedMethod}
                            />
                        </div>
                    )}
                </div>
                <Dialog
                    header="confirmation"
                    visible={dialogVisible}
                    onHide={() => setDialogVisible(false)}
                    className="custom-timeout-dialog"
                >
                    <p>do you want to clear your order?</p>
                    <div className="p-dialog-footer">
                        <Button
                            label="no"
                            className="p-button-secondary"
                            onClick={() => setDialogVisible(false)}
                            size="large"
                        />
                        <Button
                            label="yes"
                            className="p-button-primary"
                            onClick={clearCart}
                            size="large"
                        />
                    </div>
                </Dialog>
            </div>
        </>
    );

    const handleDialog = () => {
        closeDialog();
        handlePayment();
    };

    const checkMember = () => {
        handlePayment();
    };

    const accept = () => clearCart();

    const reject = () => {};

    const confirmClearCart = () => {
        confirmDialog({
            message: "do you want to clear your order?",
            header: "clear order confirmation",
            icon: "pi pi-info-circle",
            defaultFocus: "reject",
            acceptClassName: "p-button-danger",
            accept,
            reject,
        });
    };

    const [memberEmail, setMemberEmail] = useState();

    const handleChangeEmail = (e) => {
        setMemberEmail(e.target.value);
    };

    const handleMember = () => {
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${URL}/crm/v1/member/search?search_field=emailid&search_condi=eq&search_value=${memberEmail}`,
            headers: {
                Authorization: "test",
            },
        };

        axios
            .request(config)
            .then((response) => {
                if (response.status == 200) {
                    console.log("go there");
                } else {
                    console.log("show error");
                }
            })
            .catch((error) => {
                console.log(error);
            });
    };

    return (
        <>
            <Toast ref={toast} />
            <ConfirmDialog />
            {!isSuccess && <CartView />}
            {isSuccess && (
                <OrderConfirmation
                    orderNumber={orderNumber}
                    cartId={cartDetail.cartid}
                    orderId={cartDetail.orderid}
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

const PaymentMethodSelector = ({
    tenderTypes,
    selectedMethod,
    handleSelection,
}) => (
    <div className="mb-4">
        <h3 className="pl-4" style={{ marginTop: '8px'}}>Choose Payment Method</h3>
        <div className="flex px-4" style={{ overflowY: 'scroll'}}>
            {tenderTypes.map((tender, i) => (
                <div
                    key={i}
                    className={`col-4 justify-content-center align-items-center mr-2 p-3 payment-option 
                        ${selectedMethod === tender ? "selected" : ""}`}
                    onClick={() => handleSelection(tender)}
                >
                    {tender.title}
                </div>
            ))}
        </div>
    </div>
);

// Extracted Place Order Button Component
const PlaceOrderButton = ({
    checkMember,
    currency,
    getBottomTotalAmount,
    isSubmitted,
    selectedMethod,
}) => (
    <Button
        type="button"
        className="w-full p-4 custom-btn"
        style={{
            backgroundColor: "#51545D",
            color: "#FFF",
            fontSize: "16pt",
        }}
        onClick={checkMember}
        label={`place order ${currency}${getBottomTotalAmount()}`}
        disabled={isSubmitted || !selectedMethod.title}
    />
);

export default ConfirmOrder;
//export default withInactivityDetector(ConfirmOrder);
