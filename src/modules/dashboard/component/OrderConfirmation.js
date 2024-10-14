import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import AdsArea from "./AdsArea";
import storage from "../../../utils/storage";

const {
    END_POINT: URL,
    terminalid,
    storeid,
    AuthorizationHeader,
} = window?.config || {};

const OrderConfirmation = (props) => {
    const { orderNumber } = props;
    const { trx } = orderNumber || {};
    const { trxno } = trx || {};
    const handleBack = () => {
        props.handleBack();
    };
    let loginTerminalId = 1;
    let loginStoreId = storage.get("storeid");
    let socketUrl = URL + "/broker/v1/device/client";
    let socket = null;
    let deviceid = `kiosk_${storeid}_${terminalid}`;

    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(10);

    useEffect(() => {
        const cart = JSON.parse(storage.get("currCart")) || {};
        const { cartid, orderid } = cart;
        if (cartid) {
            //getData(cartid, orderid);
        }
    }, []);

    useEffect(() => {
        //if (trxno) {
        const intervalId = setInterval(() => {
            setCountdown((prev) => prev - 1);
        }, 3000);
        const timer = setTimeout(() => {
            navigate("/item-listing", { replace: true });
        }, 30000); // 10 seconds

        return () => {
            clearInterval(intervalId);
            clearTimeout(timer);
        };
        //}
    }, [navigate, trxno]);

    const getData = (cartid, orderid) => {
        let config = {
            method: "get",
            maxBodyLength: Infinity,
            url: `${URL}/pos/v1/cart/${cartid}/${orderid}?status=sales`,
            headers: {
                AuthorizationHeader,
            },
        };

        axios
            .request(config)
            .then((response) => {
                createPrintRequest(response.data);
            })
            .catch((error) => {
                console.log(error);
            });
        storage.remove("currCart");
    };

    const getPrinterConfigData = () => {
        return localStorage.getItem("printerConfigData") == null
            ? localStorage.setItem("printerConfigData", null)
            : JSON.parse(localStorage.getItem("printerConfigData"));
    };

    const registeredDeviceData = () => {
        return localStorage.getItem("registeredDeviceData") == null
            ? localStorage.setItem("registeredDeviceData", null)
            : JSON.parse(localStorage.getItem("registeredDeviceData"));
    };

    const sendPrinterMessage = (data) => {
        const { message, rqType, rqSubType, append, posid, printerId } = data;

        const uId = "PTR_" + (new Date().getTime() + (append || 0));
        const msgToSend = {
            header: {
                msgid: uId,
                to: printerId,
                from: posid + "-" + loginStoreId + "-" + loginTerminalId,
                rqtype: rqType,
                rqsubtype: rqSubType,
            },
            message: {
                ...message,
            },
        };

        //console.log('sendPrinterMessage::' + JSON.stringify(msgToSend));
        let webSocketRequest = {};
        webSocketRequest.status = "Active";
        webSocketRequest.deviceid =
            "kiosk-" + loginStoreId + "-" + loginTerminalId;
        fetch(socketUrl, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                Authorization: AuthorizationHeader,
                deviceid: deviceid,
            },
            body: JSON.stringify(webSocketRequest),
        })
            .then((res) => res.json())
            .then((data1) => {
                const sentMessage = JSON.stringify(msgToSend);
                if (data1.status != "206") {
                    socket = new WebSocket(data1.socketurl);
                    setTimeout(function () {
                        if (
                            socket !== null &&
                            socket.readyState === WebSocket.OPEN
                        ) {
                            socket.send(sentMessage);
                        }
                    }, 2000);
                }
            });
    };

    const receiptStoreBIRInfoData = () => {
        return localStorage.getItem("receiptStoreBIRInfoData") == null
            ? localStorage.setItem("receiptStoreBIRInfoData", null)
            : JSON.parse(localStorage.getItem("receiptStoreBIRInfoData"));
    };

    const receiptTerminalBIRInfoData = () => {
        return localStorage.getItem("receiptTerminalBIRInfoData") == null
            ? localStorage.setItem("receiptTerminalBIRInfoData", null)
            : JSON.parse(localStorage.getItem("receiptTerminalBIRInfoData"));
    };

    const createPrintRequest = (cart) => {
        let ReceiptResponse = {};
        ReceiptResponse.elevateCartResponse = null;
        ReceiptResponse.receiptAdditionalInformation = null;
        ReceiptResponse.additionalCartResponse = null;
        ReceiptResponse.toVoid = false;
        ReceiptResponse.receiptheader = null;
        ReceiptResponse.receiptfooter = null;
        ReceiptResponse.store_birinfo = null;
        ReceiptResponse.terminal_birinfo = null;
        ReceiptResponse.type = "print";
        ReceiptResponse.subtype = "shopping_cart";
        ReceiptResponse.extras = {};
        ReceiptResponse.receiptref = null;

        if (getPrinterConfigData() != null) {
            let virtualprinter =
                getPrinterConfigData().virtualprinter == "Y" ? true : false;
            let validatePeripherals =
                getPrinterConfigData().posperipherals == null ||
                getPrinterConfigData().posperipherals.trim() == "";
            let posid1 = loginTerminalId;
            if (!validatePeripherals) {
                posid1 = getPrinterConfigData().posid;
            }
            ReceiptResponse = {};
            ReceiptResponse.elevateCartResponse = cart;
            ReceiptResponse.receiptAdditionalInformation = {};
            ReceiptResponse.additionalCartResponse = {};
            ReceiptResponse.toVoid = false;
            ReceiptResponse.type = "print";
            ReceiptResponse.subtype = "shopping_cart";
            ReceiptResponse.extras = {};
            ReceiptResponse.extras.orderid = cart.orderid;
            ReceiptResponse.extras.trxno = cart.trxno;
            ReceiptResponse.extras.birDiscount = false;
            ReceiptResponse.receiptref = null;
            ReceiptResponse.toVoid = false;
            ReceiptResponse.receiptheader = {};
            ReceiptResponse.receiptfooter = {};
            ReceiptResponse.store_birinfo = receiptStoreBIRInfoData();
            ReceiptResponse.terminal_birinfo = receiptTerminalBIRInfoData();
            let message = {};
            message.receipt = ReceiptResponse.elevateCartResponse;
            message.header = ReceiptResponse.receiptheader;
            message.footer = ReceiptResponse.receiptfooter;
            message.store_birinfo = ReceiptResponse.store_birinfo;
            message.terminal_birinfo = ReceiptResponse.terminal_birinfo;
            message.extras = ReceiptResponse.extras;
            if (ReceiptResponse.receiptref != undefined) {
                message.receipt_ref = ReceiptResponse.receiptref;
            }

            // sendVirtualPrinterMessage({
            //     message: message,
            //     rqType: 'ej',
            //     rqSubType: ReceiptResponse.subtype,
            //     posid: 'posid',
            //     virtualDeviceId: registeredDeviceData().virtualprinterid,
            // });

            //to fix
            sendPrinterMessage({
                message: message,
                rqType: ReceiptResponse.type,
                rqSubType: ReceiptResponse.subtype,
                posid: "posid",
                printerId: registeredDeviceData().printerid,
            });
        }
    };

    return (
        <div className="flex" style={{ height: "100vh" }}>
            <AdsArea />
            <div className="order-confirmation-container p-4 w-full">
                <div className="text-content">
                    <h1 className="main-heading">
                        all done. enjoy your coffee!
                    </h1>
                    <p className="sub-heading">
                        take your receipt and collect your coffee at the
                        collection point
                    </p>
                </div>
                <div className="order-number">
                    <p>order number:</p>
                    <h2>#{trxno}</h2>
                </div>
                <div className="text-center text-white text-xl">
                    Redirecting in
                    <span id="countdown mx-2"> {countdown}</span> seconds or
                    click home to proceed.
                </div>
                <div className="receipt-icon">
                    <div
                        className="justify-content-center align-items-center p-4 cursor-pointer"
                        style={{ border: "2px solid #FFF" }}
                        onClick={handleBack}
                    >
                        Home
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
