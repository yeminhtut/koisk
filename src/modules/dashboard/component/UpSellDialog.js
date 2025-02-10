import React from "react";
import { useNavigate } from "react-router";
import { Dialog } from "primereact/dialog";
import storage from "../../../utils/storage";

const URL = window?.config?.END_POINT;

const UpSellDialog = ({ visible, onHide, product, handleHideUpsell }) => {
    const navigate = useNavigate();
    const { image } = product;

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
            style={{
                height: `${image.height}px`,
                borderRadius: "16px",
            }}
            content={() => (
                <div style={{ position: "relative" }}>
                        <img
                            src={`${URL}/${image.uri}`}
                            alt="Butterscotch Latte"
                            style={{
                                width: `${image.width}px`,
                                height: `${image.height}px`,
                                borderRadius: "16px",
                                maxWidth: '720px',
                                maxHeight: '600px'
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
            )}
        ></Dialog>
    );
};

export default UpSellDialog;
