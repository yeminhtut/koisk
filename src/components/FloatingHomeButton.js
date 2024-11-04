import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';

const FloatingHomeButton = ({ onHomeClick }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleStart = () => {
        setIsDragging(false);
    };

    const handleDrag = () => {
        setIsDragging(true);
    };

    const handleClick = () => {
        if (!isDragging) {
            setDialogVisible(true); // Show dialog only if it was clicked, not dragged
        }
    };

    const handleConfirm = () => {
        setDialogVisible(false);
        if (onHomeClick) {
            onHomeClick();
        }
    };

    return ReactDOM.createPortal(
        <>
            {/* ConfirmDialog component */}
            <ConfirmDialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                message="Do you want to clear the cart?"
                header="Confirmation"
                icon="pi pi-exclamation-triangle"
                accept={handleConfirm}
                reject={() => setDialogVisible(false)}
            />

            {/* Draggable button */}
            <Draggable onStart={handleStart} onDrag={handleDrag}>
                <div
                    style={{
                        position: 'fixed',
                        bottom: '20px',
                        right: '20px',
                        zIndex: 9999,
                    }}
                >
                    <Button
                        icon="pi pi-home"
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
                </div>
            </Draggable>
        </>,
        document.body
    );
};

export default FloatingHomeButton;
