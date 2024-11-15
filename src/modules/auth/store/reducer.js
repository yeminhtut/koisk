import storage from "../../../utils/storage";
import { initialAuthState, actions } from "./action";

const handleAuthCreateSuccess = (state, action) => {
    const { token, firstName, lastName } = action.payload;

    if (token) {
        storage.setToken(token);
        storage.set("isLoggedIn", true);

        return {
            ...state,
            fetching: false,
            error: undefined,
            userName: `${firstName} ${lastName}`,
            authToken: token,
            isLoggedIn: true,
        };
    }
    return state;
};

const handleAuthCreateFailure = (state, action) => ({
    ...state,
    error: action.payload,
});

export const authReducer = (state = initialAuthState, action) => {
    switch (action.type) {
        case actions.AUTH_CREATE_SUCCESS:
            return handleAuthCreateSuccess(state, action);
        case actions.AUTH_CREATE_FAILURE:
            return handleAuthCreateFailure(state, action);
        default:
            return state;
    }
};
