import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Draggable from 'react-draggable';
import { Button } from 'primereact/button';
import { ConfirmDialog } from 'primereact/confirmdialog';
import storage from '../utils/storage';

const FloatingHomeButton = ({ onHomeClick }) => {
    const [isDragging, setIsDragging] = useState(false);
    const [dialogVisible, setDialogVisible] = useState(false);

    const handleStart = () => {
        setIsDragging(false);
    };

    const handleDrag = () => {
        setIsDragging(true);
    };

    const handleStop = () => {
        setTimeout(() => setIsDragging(false), 100); // Reset isDragging after a short delay
    };

    const handleClick = () => {
        if (!isDragging) {
            setDialogVisible(true); // Show dialog only if it was clicked, not dragged
        }
    };

    const handleConfirm = () => {
        setDialogVisible(false);
        if (onHomeClick) {
            storage.remove('currCart')
            onHomeClick();
        }
    };

    return ReactDOM.createPortal(
        <>
            {/* ConfirmDialog component */}
            <ConfirmDialog
                visible={dialogVisible}
                onHide={() => setDialogVisible(false)}
                message="Do you want to go back to home screen?"
                header="Confirmation"
                icon="pi pi-exclamation-triangle"
                accept={handleConfirm}
                reject={() => setDialogVisible(false)}
            />

            {/* Draggable button */}
            <Draggable onStart={handleStart} onDrag={handleDrag} onStop={handleStop}>
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
