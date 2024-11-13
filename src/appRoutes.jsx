import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import AccessControl from "./modules/auth/component/AccessControl";
import ConfirmOrder from "./modules/dashboard/component/ConfirmOrder";
import OrderConfirmation from "./modules/dashboard/component/OrderConfirmation";
import ProductList from "./modules/dashboard/component/ProductList";
import WelcomeComponent from "./modules/welcome/component/Welcome";
import Layout from "./Layout";
import ProductListContainer from "./modules/dashboard/container/ProductListContainer";
import LoginContainer from "./modules/auth/container/LoginContainer";
import ProductMenu from "./modules/dashboard/component/Scroll";

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
            <Route element={<AuthRequiredContainer />} path="/*" />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;
