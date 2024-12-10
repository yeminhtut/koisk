import React, { useEffect, useState } from "react";

const OrderItem = ({
    item,
    removeOrderItem,
    increaseOrderItem,
    decreaseOrderItem,
    handleEditItem,
}) => {
    const { addons, description, unitprice } = item;
    const [quantity, setQuantity] = useState(item.quantity);

    const [itemAddOn, setItemAddOn] = useState([])

    useEffect(() => {
        const uniqueData = addons.filter((item, index, self) =>
                index === self.findIndex((t) => t.productcode === item.productcode)
            );
        setItemAddOn(uniqueData)
    }, [])

    const increaseItemQty = () => {
        const newQuantity = quantity + 1;
        setQuantity(newQuantity);
        increaseOrderItem(item);
    };

    const decreaseItemQty = () => {
        const newQuantity = quantity - 1;
        if (newQuantity <= 0) {
            removeOrderItem(item);
        } else {
            setQuantity(newQuantity);
            decreaseOrderItem(item);
        }
    };

    const getItemAddonDescriptions = () => {
        const sorted = itemAddOn.sort((a, b) => {
            const sortOrderA = a.additionalfields?.sortOrder ?? Number.MAX_VALUE;
            const sortOrderB = b.additionalfields?.sortOrder ?? Number.MAX_VALUE;
            return sortOrderA - sortOrderB;
        });
        
        return sorted.map((addon) => addon.description).join(", ") || "";
    }

    const getTotalAmount = () => {
        const addonsTotal = itemAddOn.reduce((sum, addon) => sum + addon.totalamount, 0);
        return unitprice * quantity + addonsTotal;
    };

    return (
        <div className="flex mb-4 align-items-center">
            <div className="col p-0">
                <h4 className="m-0 c-brown" style={{ fontSize: '16pt'}}>{description}</h4>
                <p className="m-0 mt-1 c-brown" style={{ fontSize: '12pt'}}>{getItemAddonDescriptions()}</p>
            </div>
            <div className="col p-0">
                <div className="order-selector flex justify-content-center align-items-center my-2">
                    <button onClick={decreaseItemQty} className="quantity-btn">
                        -
                    </button>
                    <span className="mx-3">{quantity}</span>
                    <button onClick={increaseItemQty} className="quantity-btn">
                        +
                    </button>
                </div>
            </div>
            <div className="col text-right">{getTotalAmount().toFixed(2)}</div>
            <div className="col text-right pr-0 flex justify-content-end">
                <div
                    onClick={() => handleEditItem(item)}
                    style={{
                        cursor: 'pointer',
                        color: '#b39237',
                        fontSize: '16pt'
                    }}
                >
                    Edit
                </div>
            </div>
        </div>
    );
};

export default OrderItem;
