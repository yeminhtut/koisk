import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AccessControl from "./modules/auth/component/AccessControl";
import ConfirmOrder from "./modules/dashboard/component/ConfirmOrder";
import OrderConfirmation from "./modules/dashboard/component/OrderConfirmation";
import WelcomeComponent from "./modules/welcome/component/Welcome";
import Layout from "./Layout";
import ProductListContainer from "./modules/dashboard/container/ProductListContainer";
import LoginContainer from "./modules/auth/container/LoginContainer";
import ProductDetail from "./modules/dashboard/component/ProductDetail";
import EditableJSON from "./modules/tutorial/Nested";

const AuthRequiredContainer = () => {
    return <LayoutContainer />;
};

const LayoutContainer = () => {
    return (
        <AccessControl>
            <Layout>
                <Routes>
                    <Route path="/confirm-order" element={<ConfirmOrder />} />
                    <Route
                        path="/item-listing"
                        element={<ProductListContainer />}
                    />
                    <Route
                        path="/item-detail"
                        element={<ProductDetail />}
                    />
                    <Route
                        path="/payment-success"
                        element={<OrderConfirmation />}
                    />
                </Routes>
            </Layout>
        </AccessControl>
    );
};

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            {/* <Route element={<LayoutContainer />} path="/*" /> */}
            <Route
                path="/:storeId/:terminalId"
                element={<WelcomeComponent />}
            />
            <Route path="/" element={<WelcomeComponent />} />
            <Route path="/auth" element={<LoginContainer />} />
            <Route path="/test" element={<EditableJSON />} />
            <Route element={<AuthRequiredContainer />} path="/*" />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;
