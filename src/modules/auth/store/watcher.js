import { takeLatest } from 'redux-saga/effects';
import appActions from '../../../appActions';
import { crudSaga } from '../../../utils/reduxHelper';

function* watchLoginRequest() {
    yield takeLatest(
        appActions.AUTH_CREATE_REQUEST.type,
        function* (action) {
            yield* crudSaga(
                action,
                '/system/v1/userauth/channel/ui/login',
                appActions.AUTH_CREATE_SUCCESS,
                appActions.AUTH_CREATE_FAILURE,
                'POST',
            );
        },
    );
}

export default function* authWatcher() {
    yield* watchLoginRequest();
}
