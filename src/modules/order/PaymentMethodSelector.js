import React from "react";

const {
    END_POINT: URL
} = window?.config || {};

const PaymentMethodSelector = ({
    tenderTypes,
    selectedMethod,
    handleSelection,
}) => {
    const getTenderInfo = (tender) => {
        const { title, additionalfields } = tender;
        const { tenderimg } = additionalfields;
        if (tenderimg.length > 0) {
            return <img src={URL + tenderimg} style={{ width: "100%" }} />;
        }
        return <div className='p-4'>{title}</div>;
    };
    return (
        <div className="mb-4">
            <h3 className="pl-4" style={{ marginTop: "8px" }}>
                Choose Payment Method
            </h3>
            <div className="flex px-4" style={{ overflowY: "scroll" }}>
                {tenderTypes.map((tender, i) => (
                    <div
                        key={i}
                        className={`flex justify-content-center align-items-center mr-2 payment-option 
                        ${selectedMethod === tender ? "selected" : ""}`}
                        onClick={() => handleSelection(tender)}
                    >
                        {getTenderInfo(tender)}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default PaymentMethodSelector