import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import { Dialog } from "primereact/dialog";
import { ConfirmDialog, confirmDialog } from "primereact/confirmdialog";
import storage from "../../../utils/storage";
import ImageIcon from "../../../components/ImageIcon";
import OrderConfirmation from "./OrderConfirmation";
import OrderItem from "./OrderItem";
import NewMemberDialog from "./NewMemberDialog";
import UpSellDialog from "./UpSellDialog";
import LoadingEft from "./LoadingEft";
import PlaceOrderButton from "../../order/PlaceOrderButton";
import PaymentMethodSelector from "../../order/PaymentMethodSelector";
import MemberDialog from "../../order/MemberDialog";

const {
    END_POINT: URL,
    AuthorizationHeader: token,
    MemberLookUp: memFunc,
} = window?.config || {};

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
    const [currentIdx, setCurrentIdx] = useState();
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
    const [terminalInfo, setTerminalInfo] = useState({});
    const [isUpSell, setIsUpSell] = useState(false);
    const [upsellProduct, setUpSellProduct] = useState();
    const [upSellVisible, setUpSellVisible] = useState(false);
    const [signupVisible, setSignUpVisible] = useState(false);

    useEffect(() => {
        const storeId = storage.get("storeid");
        const terminalId = storage.get("terminalid");
        const terminalData = JSON.parse(storage.get("terminalInfo"));
        const storeUpsell = JSON.parse(storage.get("storeUpsell"));
        if (storeUpsell?.id) {
            setIsUpSell(true);
            setUpSellProduct({
                productCode: storeUpsell?.fields?.properties?.productcode,
                image: storeUpsell?.imagegallery?.image1,
                title: storeUpsell?.fields?.title_long,
            });
        }
        setStoreId(storeId);
        setTerminalId(terminalId);
        setTerminalInfo(terminalData);
    }, []);

    const closeDialog = () => {
        setVisible(false);
        setIsSubmitted(false);
    };

    useEffect(() => {
        if (storeid && terminalid) {
            getTerminalTenders();
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

    const checkDeviceStatus = async () => {
        const { deviceid } = selectedMethod;
        const config = {
            method: "get",
            url: `${URL}/broker/v1/device/clients`,
            headers: {
                Authorization: token,
            },
        };

        try {
            const response = await axios.request(config);
            const result = response.data;
            const deviceStatus = result.find((r) => r.deviceid == deviceid);
            return deviceStatus && deviceStatus.status === "Active";
        } catch (error) {
            console.error("Error fetching device status:", error);
            return false; // Default to false on error
        }
    };

    const checkDevice = async () => {
        const isActive = await checkDeviceStatus();
        return isActive; // Return the resolved value
    };

    const checkHandlePayment = async () => {
        if (selectedMethod.title.toLowerCase() === "cash") {
            handlePayment();
        } else {
            const isActive = await checkDevice(); // Wait for the result of checkDevice
            if (isActive) {
                console.log("Device is active. Proceed with payment.");
                handlePayment();
            } else {
                console.log("Device is not active. Show an error toast.");
                toast.current.show({
                    severity: "contrast",
                    summary: "Error",
                    detail: "Device is not active",
                    life: 10000,
                });
            }
        }
    };

    const handlePayment = () => {
        const sessionid = storage.get("sessionid");
        setIsSubmitted(true);
        if (selectedMethod.title.toLowerCase() === "cash") {
            return handleCashPayment(sessionid);
        } else {
            const timeOut = timeOutTime > 0 ? timeOutTime * 1000 : 30000;
            setIsLoadingEft(true);
            paymentSignOn();
            const timer = setTimeout(() => {
                // Change another state after 30 seconds
                setIsLoadingEft(false); // Optionally stop the loading state
                setIsSubmitted(false);
                toast.current.show({
                    severity: "contrast",
                    summary: "error",
                    detail: `no response from eft`,
                    life: 10000,
                });
            }, timeOut); // 30 seconds in milliseconds
            getWebSocket(timer);
        }
    };

    const handleWebSocket = (socketurl, timer) => {
        const { deviceid } = selectedMethod;
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
                    severity: "contrast",
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
                    }
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

    const handleCashPayment = async (session) => {
        try {
            const { cartid, orderid, totalamount } = cartDetail;
            const newSessionId = session ? session : sessionid;
            const paymentData = {
                description: "cash",
                orderid,
                payamount: totalamount,
                paytype: "Cash",
                paytyperef: "Cash",
            };
            const result = await axios.post(
                `${URL}/pos/v1/cart/${cartid}/payment?${newSessionId}`,
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
            storage.remove("noUpSell");
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
            storage.remove("noUpSell");
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
            additionalfields: order.additionalfields,
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
                `${URL}/pos/v1/cart/${cartid}/item?itemgroup=Y`,
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
                        additionalfields: r?.additionalfields,
                    }))
                    .filter(Boolean);
                setTenderTypes(tenderTypes);
            } else {
                toast.current.show({
                    severity: "contrast",
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
                <div className="overlay flex align-items-center" id="overlay">
                    <LoadingEft />
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
                        <h2 style={{ fontSize: "16pt" }}>Confirm Order</h2>
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
                            <h3 style={{ fontSize: "12pt" }}>Order Items</h3>
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
                                checkMember={placeOrder}
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
    const checkMember = () => setVisible(true);

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

    const handleExistingMember = (member) => {
        setVisible(false);
        updateCartWithMember(member);
    };

    const updateCartWithMember = (member) => {
        const { orderid, cartid } = cartDetail;
        const { memberid } = member;
        const data = {
            orderid,
            memberid,
        };

        let config = {
            method: "put",
            url: `${URL}/pos/v1/cart/${cartid}/update/partial/member?sessionid=${sessionid}`,
            headers: {
                Authorization: token,
                "Content-Type": "application/json",
            },
            data: data,
        };

        axios
            .request(config)
            .then((response) => {
                const { sessionid } = response.data;
                setSessionId(sessionid);
                storage.set("sessionid", sessionid);
                checkHandlePayment();
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const handleSkip = () => {
        setVisible(false);
        checkHandlePayment();
    };

    const placeOrder = () => {
        const { additionalfields } = terminalInfo;
        const shownUpSell = storage.get("noUpSell");
        const { items } = cartDetail;
        const { productCode } = upsellProduct;
        const exists = items.some((item) => item.productcode === productCode);
        if (isUpSell && !shownUpSell && !exists) {
            setUpSellVisible(true);
            setIsSubmitted(true);
        } else if (additionalfields?.enablemember === "Y") {
            checkMember();
            setIsSubmitted(true);
        } else {
            checkHandlePayment();
        }
    };

    const handleHideUpsell = () => {
        const { additionalfields } = terminalInfo;
        setUpSellVisible(false);

        if (additionalfields?.enablemember === "Y") {
            checkMember();
        } else {
            setIsSubmitted(false);
            checkHandlePayment();
        }
    };

    const handleSignUpLink = () => {
        setVisible(false);
        setSignUpVisible(true);
    };

    const handleNewMember = (member) => {
        if (member?.memberid) {
            updateCartWithMember(member);
        } else {
            checkHandlePayment();
        }
    };

    const handleNewMemberDialogHide = () => {
        setSignUpVisible(false);
        setIsSubmitted(false);
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
            <MemberDialog
                handleSkip={handleSkip}
                visible={visible}
                closeDialog={closeDialog}
                handleExistingMember={handleExistingMember}
                handleSignUpLink={handleSignUpLink}
            />
            <NewMemberDialog
                visible={signupVisible}
                onHide={handleNewMemberDialogHide}
                handleNewMember={handleNewMember}
            />
            {upsellProduct?.productCode && (
                <UpSellDialog
                    visible={upSellVisible}
                    onHide={() => setUpSellVisible(false)}
                    product={upsellProduct}
                    handleHideUpsell={handleHideUpsell}
                />
            )}
        </>
    );
};

export default ConfirmOrder;
