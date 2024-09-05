import { combineReducers } from 'redux';
import { productReducer } from './modules/dashboard/store/reducer';
import { authReducer } from './modules/auth/store/reducer';
import { generalReducer } from './modules/welcome/store/reducer';

const rootReducer = combineReducers({
  product: productReducer,
  auth: authReducer,
  general: generalReducer
  // Add other reducers here
});

export default rootReducer;
