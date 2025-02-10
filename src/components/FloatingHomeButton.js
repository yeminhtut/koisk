import React from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import storage from "../utils/storage";
import ImageIcon from "./ImageIcon";

const { END_POINT: URL, AuthorizationHeader: token } = window?.config || {};

const FloatingHomeButton = () => {
    const navigate = useNavigate();

    const handleClick = () => {
        const cart = storage.get("currCart");
        if (cart) {
            clearCart(cart);
        }
        storage.remove("currCart");
        storage.remove("noUpSell");
        storage.remove("sessionid")
        handleHomeClick();
    };

    const clearCart = async (cartData) => {
        const cart = JSON.parse(cartData);
        try {
            const { cartid, orderid } = cart;
            await axios.put(
                `${URL}/pos/v1/cart/${cartid}/cancel`,
                JSON.stringify({ orderid }),
                {
                    headers: {
                        Authorization: token,
                        "Content-Type": "application/json",
                    },
                    maxBodyLength: Infinity,
                },
            );
            storage.remove("currCart");
            storage.remove("noUpSell");
            storage.remove("sessionid")
        } catch (error) {
            console.error("Error voiding cart:", error);
        }
    };

    const handleHomeClick = () => {
        navigate("/"); // Navigate to your home page route
    };

    return (
        <>
            <div
                style={{
                    position: "fixed",
                    left: "20px",
                    top: "20px",
                }}
                onClick={handleClick}
            >
                <ImageIcon
                    iconName={"back_arrow.png"}
                    style={{ width: "30px", height: "30px" }}
                />
            </div>
        </>
    );
};

export default FloatingHomeButton;
