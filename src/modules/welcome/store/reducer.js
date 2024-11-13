import { initialGenealState, actions } from "./action";
import storage from "../../../utils/storage";

export const generalReducer = (state = initialGenealState, action) => {
    switch (action.type) {
        case actions.STORE_GET_SUCCESS:
            storage.set('loginStore', JSON.stringify(action.payload))
            const { basecur } = action.payload
            const currency = basecur == 'IDR' ? 'Rp' : '₱'
            storage.set('currency', currency)
            return {
                ...state,
                store: action.payload ? action.payload : {}
            };
        default:
            return state;
    }
};