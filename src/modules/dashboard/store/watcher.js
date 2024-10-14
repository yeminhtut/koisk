import { put, takeLatest } from 'redux-saga/effects';
import appActions from '../../../appActions';
import { crudSaga, querySaga } from '../../../utils/reduxHelper';

function* resetProductsSaga() {
    yield put(appActions.PRODUCT_RESET_SUCCESS());
}

function* watchProductGetAllRequest() {
    yield takeLatest(
        appActions.PRODUCT_GET_ALL_REQUEST.type,
        function* (action) {
            const { categorycodes, storeid} = action.payload
            yield* querySaga(
                action,
                `/sales/v1/product-search/fields?categorycodes=${categorycodes}&language=en&pageno=1&pagesize=100&segment=T1&sort=sortorder&status=Active&stopsell=N&storeid=${storeid}`,
                appActions.PRODUCT_GET_ALL_SUCCESS,
                appActions.PRODUCT_GET_ALL_FAILURE,
            );
        },
    );
}

function* watchCategoryGetAllRequest() {
    yield takeLatest(
        appActions.CATEGORY_GET_ALL_REQUEST.type,
        function* (action) {
            yield* querySaga(
                action,
                '/sales/v1/category/categorytree/CAFE01?status=Active&storeid=1013&language=en',
                appActions.CATEGORY_GET_ALL_SUCCESS,
                appActions.CATEGORY_GET_ALL_FAILURE,
            );
        },
    );
}

function* watchProductGetRequest() {
    yield takeLatest(
        appActions.PRODUCT_GET_REQUEST.type,
        function* (action) {
            yield* querySaga(
                action,
                '/sales/v1/product-search/productcodes?storeid=1013&status=Active&language=en',
                appActions.PRODUCT_GET_SUCCESS,
                appActions.PRODUCT_GET_FAILURE,
            );
        },
    );
}

function* watchProductArticleGetAllRequest() {
    yield takeLatest(
        appActions.PRODUCTARTICLE_GET_ALL_REQUEST.type,
        function* (action) {
            yield* querySaga(
                action,
                '/cms/v1/article-workflow/search?articletype=Product%20Information&language=en&search_field=additionalfield1&search_condi=like',
                appActions.PRODUCTARTICLE_GET_ALL_SUCCESS,
                appActions.PRODUCTARTICLE_GET_ALL_FAILURE,
            );
        },
    );
}

export default function* productWatcher() {
    // yield* watchProductUpdateRequest();
    // yield* watchProductCreateRequest();
    yield* watchProductGetAllRequest();
    yield* watchProductArticleGetAllRequest();
    yield* watchCategoryGetAllRequest();
    yield* watchProductGetRequest();
    yield takeLatest(appActions.PRODUCT_RESET_REQUEST.type, resetProductsSaga);
    // Add other watchers here
}
