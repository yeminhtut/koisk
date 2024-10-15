import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";
import storage from "../../../utils/storage";
import ImageIcon from "../../../components/ImageIcon";
import OrderConfirmation from "./OrderConfirmation";
import AdsArea from "./AdsArea";

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
    const signonid = storage.get("signonid");
    const [isDeviceActive, setIsDeviceActive] = useState(false);
    const [socketUrl, setSocketUrl] = useState();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            await getWebSocket();
        } catch (error) {
            console.error("Error fetching data", error);
        }
    };

    const getWebSocket = () => {
        let data = JSON.stringify({
            deviceid: "kiosk_1020_1",
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
                    setSocketUrl(socketurl);
                    //handleWebSocket(socketurl);
                    getEft();
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
                storage.set('eft', deviceid)
            })
            .catch((error) => {
                console.log(error);
            });
    };

    const getDeviceStatus = () => {
        const deviceid = storage.get('eft')
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${URL}/broker/v1/device/clients`,
            headers: {
                Authorization: AuthorizationHeader,
            },
        };

        axios
            .request(config)
            .then((response) => {
                const result = response.data;
                const deviceStatus = result.find((r) => r.deviceid == deviceid);
                if (deviceStatus && deviceStatus.status === "Active") {
                    setIsDeviceActive(true);
                } else {
                    toast.current.show({
                        severity: "error",
                        summary: "Error",
                        detail: "Device is not active",
                        life: 10000,
                    });
                    setIsDeviceActive(false)
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

    const handlePayment = () => {
        if (selectedMethod === "Cash") {
            handleCashPayment();
        } else {
            getDeviceStatus()
            if (isDeviceActive) {
                paymentSignOn()
            }
        }
    };

    const paymentSignOn = () => {
        const { cartid, sessionid, orderid } = currCart
        const { totalamount } = cartDetail;
        let data = JSON.stringify({
            "orderid": orderid,
            "payamount": totalamount,
            "paytype": "eft"
          });
          
          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `${URL}/pos/v1/cart/${cartid}/payment?sessionid=${sessionid}`,
            headers: { 
              'Authorization': 'test', 
              'Content-Type': 'application/json'
            },
            data : data
          };
          
          axios.request(config)
          .then((response) => {
            const {idx} = response.data
           handleWebSocket(idx);
          })
          .catch((error) => {
            console.log(error);
          });
    }


    const handleWebSocket = (idx) => {
        const { totalamount } = cartDetail;
        const ws = new WebSocket(socketUrl);
        const uId = "EFT_" + new Date().getTime();
        const kioskId = 'kiosk_' + storeid + terminalid
        const msgToSend = {
            header: {
                msgid: uId,
                //to: getEftDeviceKeyByValue(deviceType),
                to: storage.get('eft'),
                from: kioskId,
                rqtype: "pay",
                rqsubtype: "sale",
                deviceType: "eft",
                //additionalMessage: {idx}
            },
            message: {
                amount: totalamount * 100,
            },
        };
        // Connection opened
        ws.onopen = () => {
            console.log("WebSocket connected");
            ws.send(JSON.stringify(msgToSend));
            setTimeout(() => {
                checkEftRes()
            }, 10000); 
        };

        // Listen for messages
        ws.onmessage = (event) => {
            alert(event.data)
            console.log("Message received:", event.data);
            checkEftRes(event.data);
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

    const checkEftRes = (resp) => {
        // const data = JSON.parse(resp);
        toast.current.show({
            severity: "error",
            summary: "Error",
            detail: "Error connecting to EFT",
            life: 10000,
        });
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
                closeCart();
                storage.remove("currCart");
            }
        } catch (error) {
            console.error("Error processing payment:", error);
        }
    };

    // const createEftPayload = () => {
    //     const data = {
    //         amount: payamount * 100,
    //         rqType: "pay",
    //         rqSubtype: "sale",
    //         cardtype: null,
    //         additionalMessage: data.additionalMessage,
    //         deviceType:"eft"
    //     }
    // }

    const closeCart = async () => {
        try {
            const { cartid, orderid } = cartDetail;
            const closeData = {
                orderid,
                signonid,
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

    const voidCart = async () => {
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
            navigate("/item-listing", { replace: true });
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

    const [selectedMethod, setSelectedMethod] = useState("Cash");

    const handleSelection = (method) => {
        setSelectedMethod(method);
    };

    const CartView = () => (
        <div className="flex" style={{ height: "100vh" }}>
            <AdsArea />
            <div className="p-4 w-full">
                <div className="flex align-items-center justify-content-between mb-4">
                    <div onClick={handleBack}>
                        <ImageIcon
                            iconName={"back_arrow.png"}
                            style={{ width: "30px", height: "30px" }}
                        />
                    </div>
                    <h2>Confirm Order</h2>
                    <div className="clsbtn cursor-pointer" onClick={voidCart}>
                        Clear
                    </div>
                </div>
                <div style={{ paddingBottom: "60px" }}>
                    <div className="mb-4">
                        <h3>Order Items</h3>
                        {cartDetail.items?.map((item, index) => (
                            <OrderItem
                                item={item}
                                key={index}
                                removeOrderItem={removeOrderItem}
                                increaseOrderItem={increaseOrderItem}
                                decreaseOrderItem={decreaseOrderItem}
                            />
                        ))}
                    </div>
                    <div className="mb-4">
                        <h3>Choose Payment Method</h3>
                        <div className="flex">
                            <div
                                className={`col-4 justify-content-center align-items-center mr-4 p-4 payment-option ${selectedMethod === "Cash" ? "selected" : ""}`}
                                onClick={() => handleSelection("Cash")}
                            >
                                Cash
                            </div>
                            <div
                                className={`col-4 justify-content-center align-items-center p-4 payment-option ${selectedMethod === "Card" ? "selected" : ""}`}
                                onClick={() => handleSelection("Card")}
                            >
                                Card
                            </div>
                        </div>
                    </div>
                </div>
                <div
                    className="w-full flex align-items-center justify-content-center fixed right-0 bottom-0 p-4 cursor-pointer col-md-12 col-lg-6"
                    style={{
                        backgroundColor: "#78838E",
                        color: "#FFF",
                        fontSize: "32px",
                    }}
                    onClick={handlePayment}
                >
                    Place Order P{cartDetail.totalamount?.toFixed(2)}
                </div>
            </div>
        </div>
    );
    return (
        <>
            <Toast ref={toast} />
            {!isSuccess && <CartView />}
            {isSuccess && (
                <OrderConfirmation
                    orderNumber={orderNumber}
                    handleBack={handleBack}
                />
            )}
        </>
    );
};

const OrderItem = ({
    item,
    removeOrderItem,
    increaseOrderItem,
    decreaseOrderItem,
}) => {
    const [quantity, setQuantity] = useState(item.quantity);

    const increaseItemQty = () => {
        setQuantity(quantity + 1);
        increaseOrderItem(item);
    };

    const decreaseItemQty = () => {
        if (quantity > 1) {
            setQuantity(quantity - 1);
            decreaseOrderItem(item);
        }
    };

    const cartArea = () => {
        return (
            <div className="flex mb-4 align-items-center">
                <div className="col">
                    <h4 className="m-0 text-xl">{item.description}</h4>
                    {/* <p className="m-0">{item.description}</p> */}
                </div>
                <div className="col">
                    <div className="order-selector flex justify-content-center align-items-center my-2">
                        <button onClick={decreaseItemQty}>-</button>
                        <span className="mx-4">{quantity}x</span>
                        <button onClick={increaseItemQty}>+</button>
                    </div>
                </div>
                <div className="col text-right">{item.totalamount}</div>
                <div className="col text-right pr-0 flex justify-content-end">
                    <Button
                        label="Remove"
                        onClick={() => removeOrderItem(item)}
                        severity="danger"
                        text
                    />
                </div>
            </div>
        );
    };

    return <>{cartArea()}</>;
};

export default ConfirmOrder;
