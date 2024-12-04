


import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import { Dialog } from 'primereact/dialog';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import storage from '../utils/storage';
import ImageIcon from './ImageIcon';

const { END_POINT: URL, AuthorizationHeader: token } = window?.config || {};

const FloatingHomeButton = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    //const [position, setPosition] = useState({ x: window.innerWidth - 60, y: window.innerHeight - 80 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [dragging, setDragging] = useState(false);
    const [start, setStart] = useState({ x: 0, y: 0 });

    const navigate = useNavigate();

    const handleDragStart = (e) => {
        setDragging(true);
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        setStart({ x: clientX - position.x, y: clientY - position.y });
    };

    const handleDragging = (e) => {
        if (!dragging) return;

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;

        setPosition({
            x: clientX - start.x,
            y: clientY - start.y,
        });
    };

    const handleDragEnd = () => {
        setDragging(false);
    };

    const handleClick = () => {
        setDialogVisible(true);
    }

    const handleConfirm = () => {
        setDialogVisible(false);
        const cart = storage.get('currCart')
        if (cart) {
            clearCart(cart)
        }
        storage.remove("currCart");
        handleHomeClick();
    };

    const clearCart = async (cartData) => {
        const cart = JSON.parse(cartData)
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
        } catch (error) {
            console.error("Error voiding cart:", error);
        }
    };

    const handleHomeClick = () => {
        navigate('/'); // Navigate to your home page route
    };

    return (
        <>
            {/* <ConfirmDialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                message="Do you want to go back to home screen?"
                header="Confirmation"
                icon="pi pi-exclamation-triangle"
                accept={handleConfirm}
                reject={() => setDialogVisible(false)}
                className="custom-timeout-dialog"
            /> */}
            <Dialog 
                    header="confirmation"
                    visible={dialogVisible}
                    onHide={() => setDialogVisible(false)}
                    className="custom-timeout-dialog"
                >
                    <p>do you want to go back to home screen?</p>
                    <div className="p-dialog-footer">
                        <Button label="no" className="p-button-secondary" onClick={() => setDialogVisible(false)} size="large" />
                        <Button label="yes" className="p-button-primary" onClick={handleConfirm}  size="large" />
                    </div>
                </Dialog>
            <div 
                style={{
                    position: 'fixed',
                    left: '20px',
                    top: '20px'
                }}
                onClick={handleClick}>
                <ImageIcon
                    iconName={"back_arrow.png"}
                    style={{ width: "30px", height: "30px" }}
                />
            </div>
            
            {/* <div
            style={{
                position: 'fixed',
                left: `${position.x}px`,
                top: `${position.y}px`,
                zIndex: 9999,
                touchAction: 'none',
            }}
            onMouseDown={handleDragStart}
            onMouseMove={handleDragging}
            onMouseUp={handleDragEnd}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragging}
            onTouchEnd={handleDragEnd}
        >
            <Button
                icon="pi pi-arrow-left "
                style={{
                    borderRadius: '50%',
                    width: '50px',
                    height: '50px',
                    backgroundColor: '#B39137',
                    cursor: 'move',
                }}
                className="p-button-rounded p-button-primary"
                onClick={handleClick}
                aria-label="Home"
            />
            
        </div> */}
        </>
        
    );
};

export default FloatingHomeButton;
