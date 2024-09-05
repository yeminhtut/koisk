import { takeLatest } from 'redux-saga/effects';
import appActions from '../../../appActions';
import { querySaga } from '../../../utils/reduxHelper';

function* watchStoreGetRequest() {
    yield takeLatest(
        appActions.STORE_GET_REQUEST.type,
        function* (action) {
            yield* querySaga(
                action,
                `/pos/v1/store/storeid/${action.payload}`,
                appActions.STORE_GET_SUCCESS,
                appActions.STORE_GET_FAILURE,
            );
        },
    );
}

export default function* generalWatcher() {
    yield* watchStoreGetRequest();
}
