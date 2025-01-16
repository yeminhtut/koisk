import React from "react";
import { Button } from "primereact/button";

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

export default PlaceOrderButton