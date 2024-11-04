import React, { useState, useEffect, useRef } from "react";
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import ProductList from "../component/ProductList";
import SampleComponent from "../component/Sample";
import { useNavigate } from 'react-router-dom';

const ProductListContainer = () => {
    const [showDialog, setShowDialog] = useState(false);
    const timeoutRef = useRef(null);
    const redirectTimeoutRef = useRef(null);
    const INACTIVITY_TIME = 10000; // 1 minute
    const REDIRECT_TIME = 30000;

    const navigate = useNavigate();

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
                navigate('/');
            }, REDIRECT_TIME);
        }, INACTIVITY_TIME);
    };


    const handleContinue = () => {
        // Close the dialog and reset the timer
        setShowDialog(false);
        resetInactivityTimer();
    };

    useEffect(() => {
        // Reset the timer on any activity
        // const handleActivity = () => {
        //     if (showDialog) {
        //         setShowDialog(false); // Close dialog if user is active
        //     }
        //     resetInactivityTimer();
        // };

        // // Attach event listeners
        // window.addEventListener('mousemove', handleActivity);
        // window.addEventListener('keydown', handleActivity);
        // window.addEventListener('touchstart', handleActivity);

        // // Start the timer initially
        // resetInactivityTimer();

        // // Cleanup on component unmount
        // return () => {
        //     if (timeoutRef.current) clearTimeout(timeoutRef.current);
        //     if (redirectTimeoutRef.current) clearTimeout(redirectTimeoutRef.current);
        //     window.removeEventListener('mousemove', handleActivity);
        //     window.removeEventListener('keydown', handleActivity);
        //     window.removeEventListener('touchstart', handleActivity);
        // };
    }, [showDialog]);

    return (
        <>
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
            <SampleComponent />
        </>
    
    )
};

export default ProductListContainer;
