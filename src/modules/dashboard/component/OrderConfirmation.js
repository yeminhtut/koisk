import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import AdsArea from "./AdsArea";

const OrderConfirmation = (props) => {
    const { orderNumber } = props;
    const { trx } = orderNumber || {};
    const { trxno } = trx || {};
    const handleBack = () => {
        props.handleBack();
    };

    const navigate = useNavigate();
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
      //if (trxno) {
          const intervalId = setInterval(() => {
              setCountdown((prev) => prev - 1);
          }, 1000); // Update every second (1000 ms = 1 second)
  
          const timer = setTimeout(() => {
              navigate("/item-listing", { replace: true });
          }, 30000); // Redirect after 30 seconds
  
          return () => {
              clearInterval(intervalId);
              clearTimeout(timer);
          };
      //}
    }, [navigate, trxno]);
    
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
