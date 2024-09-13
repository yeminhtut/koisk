import React, { useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginContainer from './modules/auth/container/LoginContainer';
import TaskContainer from './modules/dashboard/container/TaskContainer';
import ChatContainer from './modules/dashboard/container/ChatContainer';
import AccessControl from './modules/auth/component/AccessControl';
import ConfirmOrder from './modules/dashboard/component/ConfirmOrder';
import Setting from './modules/dashboard/component/Setting';
import WelcomeContainer from './modules/welcome/container/WelcomeContainer';
import ItemList from './modules/dashboard/component/ItemList';
import OrderConfirmation from './modules/dashboard/component/Receipt';
import PList from './modules/dashboard/component/List';
import ProductList from './modules/dashboard/component/ProductList';

const AuthRequiredContainer = () => {
    return (
        <>
            <AccessControl>
                <Routes>
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
            <Route path="/item-listing" element={<ProductList />} />
            <Route path="/p-listing" element={<PList />} />
            <Route path="/payment-success" element={<OrderConfirmation />} />
            <Route element={<AuthRequiredContainer />} path="/ui/*" />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;
