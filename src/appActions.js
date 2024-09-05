import { createAction } from '@reduxjs/toolkit';

import { actions as productActions } from './modules/dashboard/store/action'
import { actions as authActions } from './modules/auth/store/action'
import { actions as generalActions } from './modules/welcome/store/action'

const actionTypes = { ...productActions, ...authActions, ...generalActions }

const appActions = {};

Object.entries(actionTypes).forEach(([key, value]) => {
    appActions[key] = createAction(value);
});

export default appActions;
