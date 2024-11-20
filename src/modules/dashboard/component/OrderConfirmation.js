import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import AdsArea from "./AdsArea";

const OrderConfirmation = (props) => {
    const { orderNumber } = props;
    const { trx } = orderNumber || {};
    const { trxno } = trx || {};
    const handleBack = () => {
      navigate("/", { replace: true });
    };

    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
      //if (trxno) {
          const intervalId = setInterval(() => {
              setCountdown((prev) => prev - 1);
          }, 1000); // Update every second (1000 ms = 1 second)
  
          const timer = setTimeout(() => {
              navigate("/", { replace: true });
          }, 30000); // Redirect after 30 seconds
  
          return () => {
              clearInterval(intervalId);
              clearTimeout(timer);
          };
      //}
    }, [navigate, trxno]);

    return (
        <div className="flex w-full" style={{ height: "100vh", cursor: "pointer" }} onClick={handleBack}>
            <div className="order-confirmation-container p-4 w-full">
                <div className="text-content">
                    <h1 className="main-heading">
                      please take your receipt
                    </h1>
                </div>
                <div className="order-number">
                    <h2>Order #{trxno}</h2>
                </div>
                <div className="text-center text-white" style={{ fontSize: '24px'}}>
                    <p>your number will be called<br/> at the pick up area</p>
                    {/* Redirecting in
                    <span id="countdown mx-2"> {countdown}</span> seconds  */}
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmation;
