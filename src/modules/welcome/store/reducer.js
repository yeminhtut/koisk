import { initialGenealState, actions } from "./action";
import storage from "../../../utils/storage";

export const generalReducer = (state = initialGenealState, action) => {
    switch (action.type) {
        case actions.STORE_GET_SUCCESS:
            storage.set('loginStore', JSON.stringify(action.payload))
            return {
                ...state,
                store: action.payload ? action.payload : {}
            };
        default:
            return state;
    }
};