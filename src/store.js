import { configureStore } from '@reduxjs/toolkit';
import createSagaMiddleware from 'redux-saga';
import rootSaga from './saga';
import rootReducer from './appReducers'; //combined reducers

// Create a saga middleware
const sagaMiddleware = createSagaMiddleware();

// Create the Redux store with the root reducer and saga middleware
const setupMiddleware = () => {
  return [sagaMiddleware];
}
const store = configureStore({
  reducer: rootReducer,
  middleware: setupMiddleware
});


// Run the root saga
sagaMiddleware.run(rootSaga);

export default store;
