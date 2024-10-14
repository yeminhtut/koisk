import React from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import LoginContainer from './modules/auth/container/LoginContainer';
import AccessControl from './modules/auth/component/AccessControl';
import ConfirmOrder from './modules/dashboard/component/ConfirmOrder';
import WelcomeContainer from './modules/welcome/container/WelcomeContainer';
import OrderConfirmation from './modules/dashboard/component/OrderConfirmation';
import ProductList from './modules/dashboard/component/ProductList';
import WelcomeComponent from './modules/welcome/component/Welcome';

// const AuthRequiredContainer = () => {
//     return (
//         <>
//             <AccessControl>
//                 <Routes>
                    
//                 </Routes>
//             </AccessControl>
//         </>
//     );
// };

const AppRoutes = () => (
    <BrowserRouter>
        <Routes>
            <Route path="/:storeId/:terminalId" element={<WelcomeComponent />} />
            <Route path="/" element={<WelcomeComponent />} />
            <Route path="/confirm-order" element={<ConfirmOrder />} />
            <Route path="/item-listing" element={<ProductList />} />
            <Route path="/payment-success" element={<OrderConfirmation />} />
            <Route path="/confirm-order" element={<ConfirmOrder />} />
        </Routes>
    </BrowserRouter>
);

export default AppRoutes;
