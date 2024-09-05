import { getActionTypes } from '../../../utils/reduxHelper';
import storage from '../../../utils/storage';

export const actions = getActionTypes('auth', ['CREATE']);

export const initialAuthState = {
    userName: '',
    authToken: storage.getToken() || undefined,
    error: undefined,
};
