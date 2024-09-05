import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginContainer from './modules/auth/container/LoginContainer';
import ProductListContainer from './modules/dashboard/container/ProductListContainer';
import TaskContainer from './modules/dashboard/container/TaskContainer';
import ChatContainer from './modules/dashboard/container/ChatContainer';
import AccessControl from './modules/auth/component/AccessControl';
import ConfirmOrder from './modules/dashboard/component/ConfirmOrder';
import Setting from './modules/dashboard/component/Setting';
import WelcomeContainer from './modules/welcome/container/WelcomeContainer';
import ItemList from './modules/dashboard/component/ItemList';

const AuthRequiredContainer = () => {
    return (
        <>
            <AccessControl>
                <Routes>
                    <Route path="/product-listing" element={<ProductListContainer />} />
                    <Route path="/confirm-order" element={<ConfirmOrder />} />
                    <Route path="/task" element={<TaskContainer />} />
                    <Route path="/chat" element={<ChatContainer />} />
                </Routes>
            </AccessControl>
        </>
    );
};

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/:storeId/:terminalId/login" element={<LoginContainer />} />
            <Route path="/" element={<WelcomeContainer />} />
            <Route path="/confirm-order" element={<ConfirmOrder />} />
            <Route path="/setting" element={<Setting />} />
            <Route path="/product-listing" element={<ProductListContainer />} />
            <Route path="/item-listing" element={<ItemList />} />
            <Route element={<AuthRequiredContainer />} path="/ui/*" />
        </Routes>
    </BrowserRouter>
);



const NotificationContainer = () => {
    useNotificationPermission();

    const handleSendNotification = () => {
        showNotification('Hello!', {
            body: 'This is a browser notification from your React app!',
            icon: '/path/to/icon.png', // optional
        });
    };

    return (
        <div>
            <button onClick={handleSendNotification}>Send Notification</button>
        </div>
    );
};

const showNotification = (title, options) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
    } else {
        console.warn(
            'Notifications are not enabled or permission is not granted',
        );
    }
};

const useNotificationPermission = () => {
    useEffect(() => {
        if ('Notification' in window) {
            Notification.requestPermission()
                .then((permission) => {
                    if (permission !== 'granted') {
                        console.warn('Notification permission not granted');
                    }
                })
                .catch((error) => {
                    console.error(
                        'Notification permission request failed',
                        error,
                    );
                });
        } else {
            console.warn('Notifications not supported in this browser');
        }
    }, []);
};

export default AppRoutes;
