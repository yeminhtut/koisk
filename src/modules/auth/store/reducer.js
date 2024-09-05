import storage from "../../../utils/storage";
import { initialAuthState, actions } from "./action";

export const authReducer = (state = initialAuthState, action) => {
    switch (action.type) {
        case actions.AUTH_CREATE_SUCCESS:
            storage.setToken(action.payload.token)
            storage.set('userName', action.payload.firstName + ' ' + action.payload.lastName )
            storage.set('isLoggedIn', true)
            return {
                ...state,
                fetching: false,
                error: undefined,
                userName: action.payload.firstName + action.payload.lastName,
                authToken: action.payload.token,
                isLoggedIn: true
            };
        case actions.AUTH_CREATE_FAILURE: 
            return {
                ...state,
                error: action.payload
            }
        default:
            return state;
    }
};