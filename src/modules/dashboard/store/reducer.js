import { initialProductState, actions } from "./action";

export const productReducer = (state = initialProductState, action) => {
    switch (action.type) {
        case actions.CATEGORY_GET_ALL_SUCCESS:
            return {
                ...state,
                category: action.payload?.id ? action.payload : {}
            };
        case actions.PRODUCT_GET_ALL_SUCCESS:
            return {
                ...state,
                productList: Array.isArray(action.payload) ? action.payload : []
            };
        case actions.PRODUCTARTICLE_GET_ALL_SUCCESS:
            return {
                ...state,
                productarticleList: Array.isArray(action.payload) ? action.payload : []
            };
        case actions.PRODUCT_GET_SUCCESS:
            return {
                ...state,
                product: action.payload ? action.payload : []
            };
        case actions.PRODUCT_CREATE_SUCCESS:
            return {
                ...state,
                product: action.payload?.id ? action.payload : {}
            };
        case actions.PRODUCT_DELETE_SUCCESS:
            return {
                ...state,
                product: action.payload?.id ? action.payload : {}
            };
        case actions.PRODUCT_RESET_SUCCESS:
            return {
                ...state,
                product: {}
            };
        default:
            return state;
    }
};
