import React, { useEffect, useRef, useState } from 'react';
import { Dialog } from 'primereact/dialog';
import { Button } from 'primereact/button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import storage from './utils/storage';

const { END_POINT: URL, AuthorizationHeader: token } = window?.config || {};

const withInactivityDetector = (WrappedComponent) => {
    return (props) => {
        const navigate = useNavigate();

        // Refs for inactivity and redirection timers
        const timeoutRef = useRef(null);
        const redirectTimeoutRef = useRef(null);

        // States for dialog visibility, countdown, and translations
        const [showDialog, setShowDialog] = useState(false);
        const [countdown, setCountdown] = useState(0);
        const [translations, setTranslations] = useState({});

        // Inactivity and redirection times
        const inactivityTime = storage.get('inactiveTimeout') ? storage.get('inactiveTimeout') * 1000 : 60000;
        const redirectTime = storage.get('redirectTimeout') ? storage.get('redirectTimeout') * 1000 : 10000;

        // Fetch translations
        const fetchTranslations = async () => {
            try {
                const response = await axios.get(
                    `${URL}/cms/v1/word/translation/search?language=en&search_field=wrdcode&search_condi=eq&search_value=SCO_MESSAGES`,
                    { headers: { Authorization: token } }
                );

                if (response.status === 200) {
                    const { translation } = response.data[0];
                    setTranslations(translation || {});
                }
            } catch (error) {
                console.error('Error fetching translations:', error);
            }
        };

        // Clear and reset timers for inactivity
        const resetInactivityTimer = () => {
            clearTimeout(timeoutRef.current);
            clearTimeout(redirectTimeoutRef.current);

            timeoutRef.current = setTimeout(() => {
                setShowDialog(true);
                setCountdown(redirectTime / 1000);

                redirectTimeoutRef.current = setTimeout(handleRedirect, redirectTime);
            }, inactivityTime);
        };

        // Handle redirection or cart clearing
        const handleRedirect = async () => {
            const currCart = JSON.parse(storage.get('currCart'));

            if (currCart?.cartid) {
                try {
                    await axios.put(
                        `${URL}/pos/v1/cart/${currCart.cartid}/cancel`,
                        JSON.stringify({ orderid: currCart.orderid }),
                        {
                            headers: {
                                Authorization: token,
                                'Content-Type': 'application/json',
                            },
                        }
                    );
                    storage.remove('currCart');
                } catch (error) {
                    console.error('Error voiding cart:', error);
                }
            }
            navigate('/', { replace: true });
        };

        // Countdown logic
        useEffect(() => {
            if (showDialog && countdown > 0) {
                const interval = setInterval(() => {
                    setCountdown((prev) => {
                        if (prev === 1) {
                            clearInterval(interval);
                            handleRedirect();
                        }
                        return prev - 1;
                    });
                }, 1000);

                return () => clearInterval(interval);
            }
        }, [showDialog, countdown]);

        // Handle user activity
        const handleActivity = () => {
            if (showDialog) setShowDialog(false);
            resetInactivityTimer();
        };

        // Add and clean up event listeners for user activity
        useEffect(() => {
            window.addEventListener('mousemove', handleActivity);
            window.addEventListener('keydown', handleActivity);
            window.addEventListener('touchstart', handleActivity);

            resetInactivityTimer();

            return () => {
                clearTimeout(timeoutRef.current);
                clearTimeout(redirectTimeoutRef.current);
                window.removeEventListener('mousemove', handleActivity);
                window.removeEventListener('keydown', handleActivity);
                window.removeEventListener('touchstart', handleActivity);
            };
        }, [showDialog]);

        // Fetch translations on mount
        useEffect(() => {
            fetchTranslations();
        }, []);

        return (
            <>
                <WrappedComponent {...props} />
                {/* <Dialog
                    visible={showDialog}
                    header={translations?.inactive_header || 'Session Timeout'}
                    onHide={() => setShowDialog(false)}
                    footer={<Button label="Continue" onClick={handleActivity} />}
                    style={{ width: '300px' }}
                    modal
                >
                    <p>{translations?.inactive_content || 'Your session is about to expire due to inactivity.'}</p>
                    <p>Redirecting in <strong>{countdown}</strong> seconds...</p>
                </Dialog> */}
                 <Dialog 
                    header="Session Timeout!"
                    visible={showDialog}
                    onHide={() => setShowDialog(false)}
                    className="custom-timeout-dialog"
                >
                    <p>{translations?.inactive_content || 'Your session is about to expire due to inactivity.'}</p>
                    <div className="p-dialog-footer">
                        <Button label="No" className="p-button-secondary" onClick={handleActivity} size="large" />
                        <Button label="Yes" className="p-button-primary" onClick={handleActivity}  size="large" />
                    </div>
                    <p className="countdown-timer">Redirecting in <strong>{countdown}</strong> seconds...</p>
                </Dialog>
            </>
        );
    };
};

export default withInactivityDetector;
