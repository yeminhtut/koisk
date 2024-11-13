// withInactivityDetector.js
import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import storage from './utils/storage';

const { END_POINT: URL } = window?.config || {};

const withInactivityDetector = (WrappedComponent) => {
    return (props) => {
        const timeoutRef = useRef(null);
        const redirectTimeoutRef = useRef(null);
        const [showDialog, setShowDialog] = useState(false);
        const navigate = useNavigate();
        const inactivityTime = storage.get('inactiveTimeout') ? storage.get('inactiveTimeout') * 1000 : 60000
        const redirectTime = storage.get('redirectTimeout') ? storage.get('redirectTimeout') * 1000 : 10000
        
        const [cartDetail, setCartDetail] = useState({});
        const resetInactivityTimer = () => {
            // Clear any existing timers
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);

            // Set a new timer for inactivity
            timeoutRef.current = setTimeout(() => {
                // Show the inactivity dialog after timeout
                setShowDialog(true);

                // Set a redirect timer for after the dialog appears
                redirectTimeoutRef.current = setTimeout(() => {
                    // Redirect to home if still inactive
                    
                    const currCart = JSON.parse(storage.get('currCart'))
                    if (currCart && currCart.cartid) {
                        clearCart()
                    }
                    else {
                        navigate('/');
                    }
                    
                }, redirectTime);
            }, inactivityTime);
        };

        const clearCart = async () => {
            const cart = JSON.parse(storage.get('currCart'))
            const { cartid, orderid } = cart
            try {
                await axios.put(
                    `${URL}/pos/v1/cart/${cartid}/cancel`,
                    JSON.stringify({ orderid }),
                    {
                        headers: {
                            Authorization: "test",
                            "Content-Type": "application/json",
                        },
                        maxBodyLength: Infinity,
                    },
                );
                storage.remove("currCart");
                navigate("/", { replace: true });
            } catch (error) {
                console.error("Error voiding cart:", error);
            }
        };

        const handleContinue = () => {
            // Close the dialog and reset the timer
            setShowDialog(false);
            resetInactivityTimer();
        };

        useEffect(() => {
            // Reset the timer on any activity
            const handleActivity = () => {
                if (showDialog) {
                    setShowDialog(false); // Close dialog if user is active
                }
                resetInactivityTimer();
            };

            // Attach event listeners
            window.addEventListener('mousemove', handleActivity);
            window.addEventListener('keydown', handleActivity);
            window.addEventListener('touchstart', handleActivity);

            // Start the timer initially
            resetInactivityTimer();

            // Cleanup on component unmount
            return () => {
                if (timeoutRef.current) clearTimeout(timeoutRef.current);
                if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
                window.removeEventListener('mousemove', handleActivity);
                window.removeEventListener('keydown', handleActivity);
                window.removeEventListener('touchstart', handleActivity);
            };
        }, [showDialog]);

        return (
            <>
                <WrappedComponent {...props} />
                <Dialog
                    visible={showDialog}
                    header="Session Timeout"
                    onHide={() => setShowDialog(false)}
                    footer={
                        <Button label="Continue" onClick={handleContinue} />
                    }
                    style={{ width: '30vw' }}
                    modal
                >
                    <p>Your session is about to end due to inactivity. Do you want to continue?</p>
                </Dialog>
            </>
        );
    };
};

export default withInactivityDetector;
