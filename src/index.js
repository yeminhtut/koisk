import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import AppRoutes from './appRoutes';
import { Provider } from 'react-redux';
import store from './store'; 
import "primereact/resources/themes/lara-light-indigo/theme.css"
import "primereact/resources/primereact.min.css";
import "primeicons/primeicons.css";
import "primeflex/primeflex.css";
import "./assets/css/layout/layout.scss";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Provider store={store}>
      <AppRoutes />
    </Provider>
  </React.StrictMode>
);
