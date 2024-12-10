import React from "react";
import { useNavigate } from "react-router";
import { Dialog } from "primereact/dialog";
import { Button } from "primereact/button";
import storage from "../../../utils/storage";

const URL = window?.config?.END_POINT;

const UpSellDialog = ({ visible, onHide, product, handleHideUpsell }) => {
    const navigate = useNavigate();
    const { title, image } = product;

    const handleLink = () => {
        const storeProducts = JSON.parse(storage.get("storeProduct"));
        const record = storeProducts.filter(
            (sp) => sp.productcode == product.productCode,
        );
        navigate("/item-detail", {
            state: {
                record: record[0],
                isEdit: false,
            },
        });
    };

    const handleHide = () => {
        storage.set('noUpSell', true)
        handleHideUpsell()
    }
    return (
        <Dialog
            visible={visible}
            modal
            onHide={onHide}
            className="upsell-dialog"
            content={() => (
                <div
                    style={{
                        textAlign: "center",
                        borderRadius: "16px",
                        background: "#FFF",
                    }}
                >
                    <div style={{ position: "relative" }}>
                        <img
                            src={`${URL}/${image.uri}`}
                            alt="Butterscotch Latte"
                            style={{
                                width: "360px",
                                borderRadius: "16px 16px 0 0",
                            }}
                            onClick={handleLink}
                        />
                        <span
                            className="pi pi-times"
                            style={{
                                position: "absolute",
                                top: "10px",
                                right: "10px",
                                fontSize: "24px",
                                color: "#FFF",
                                cursor: 'pointer'
                            }}
                            onClick={handleHide}
                        >

                        </span>
                    </div>

                    {/* Text Section */}
                    <div
                        style={{
                            padding: "20px",
                            fontSize: "18px",
                            paddingTop: "16px",
                        }}
                        onClick={handleLink}
                    >
                        <span
                            style={{
                                margin: "0 0 0.5rem",
                                fontWeight: "600",
                                color: "#51545d",
                                display: 'block'
                            }}
                        >
                            {title}
                        </span>
                        <span
                            style={{ color: "#b5850f", fontWeight: "600" }}
                            
                        >
                            View Drink
                        </span>
                    </div>
                </div>
            )}
        ></Dialog>
    );
};

export default UpSellDialog;
