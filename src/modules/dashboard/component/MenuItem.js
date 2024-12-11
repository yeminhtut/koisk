import React from "react";
import ImageIcon from "../../../components/ImageIcon";

const MenuItem = ({ label, imgSrc, handleCloseDetail }) => {
    return (
        <div className="menu-item" style={{ padding: '10px'}}>
            <div className="menu-item-left">
                <div onClick={handleCloseDetail}>
                    <ImageIcon
                        iconName={"close.png"}
                        style={{ width: "20px", height: "20px" }}
                    />
                </div>
                <label htmlFor={label} className="menu-item-label">
                    {label}
                </label>
            </div>
            <img
                src={imgSrc}
                alt={label}
                style={{ width: "50px", height: "50px" }}
            />
        </div>
    );
};

export default MenuItem