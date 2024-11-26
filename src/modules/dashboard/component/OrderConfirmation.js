import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

const { END_POINT: URL, AuthorizationHeader: token } = window?.config || {};

const OrderConfirmation = ({ orderNumber, cartId, orderId }) => {
    const navigate = useNavigate();

    // Extracted properties from `orderNumber`
    const { trx, sessionid } = orderNumber || {};

    // State variables
    const [queueNumber, setQueueNumber] = useState(null);
    const [countdown, setCountdown] = useState(30);

    // Fetch queue number
    const fetchQueueNumber = async () => {
        try {
            const response = await axios.get(
                `${URL}/pos/v1/cart/${cartId}/${orderId}`,
                {
                    headers: { Authorization: token },
                    params: {
                        sessionid,
                        status: "sales",
                    },
                    maxBodyLength: Infinity,
                }
            );

            if (response.status === 200) {
                const { opstaskqno } = response.data;
                setQueueNumber(opstaskqno);
            }
        } catch (error) {
            console.error("Error fetching queue number:", error);
        }
    };

    // Navigate to home after countdown or on click
    const handleBack = () => {
        navigate("/", { replace: true });
    };

    // Start countdown and auto-redirect
    useEffect(() => {
        if (queueNumber) {
            const countdownInterval = setInterval(() => {
                setCountdown((prev) => prev - 1);
            }, 1000);

            const redirectTimeout = setTimeout(() => {
                navigate("/", { replace: true });
            }, 30000);

            return () => {
                clearInterval(countdownInterval);
                clearTimeout(redirectTimeout);
            };
        }
    }, [queueNumber, navigate]);

    // Fetch queue number on mount
    useEffect(() => {
        fetchQueueNumber();
    }, []);

    return (
        <div
            className="flex w-full"
            style={{ height: "100vh", cursor: "pointer" }}
            onClick={handleBack}
        >
            <div className="order-confirmation-container p-4 w-full">
                <div className="text-content">
                    <h1 className="main-heading">Please take your receipt</h1>
                </div>
                <div className="order-number">
                    <h2>Order #{queueNumber || "Loading..."}</h2>
                </div>
                <div
                    className="text-center text-white"
                    style={{ fontSize: "24px" }}
                >
                    <p>
                        Your number will be called
                        <br />
                        at the pick-up area
                    </p>
                </div>
                {/* <div className="countdown">
                    <p>Returning to home in {countdown} seconds...</p>
                </div> */}
            </div>
        </div>
    );
};

export default OrderConfirmation;
