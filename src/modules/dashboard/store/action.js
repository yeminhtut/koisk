import {
    generateDefaultState,
    getActionTypes,
} from '../../../utils/reduxHelper';

const productActions = getActionTypes('product', [
    'GET_ALL',
    'GET'
]);

const productArticleActions = getActionTypes('productArticle', [
    'GET_ALL'
]);

const categoryActions = getActionTypes('category', [
    'GET_ALL'
]);

export const actions = {
    ...productArticleActions,
    ...productActions,
    ...categoryActions
}

export const initialProductState = {
    ...generateDefaultState('productArticle', [
        'GET_ALL'
    ]),
    ...generateDefaultState('product', [
        'GET_ALL',
        'GET',
        'UPDATE',
        'CREATE',
        'DELETE',
    ]),
    ...generateDefaultState('category', [
        'GET_ALL',
        'UPDATE',
        'CREATE',
        'DELETE',
    ]),
};
