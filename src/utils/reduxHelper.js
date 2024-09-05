import capitalize from 'lodash/capitalize'
import { call, put } from 'redux-saga/effects';
import { get, post, update, del } from '../utils/net'

const API_ACTION_TYPES = ['GET_ALL', 'GET', 'CREATE', 'DELETE', 'UPDATE', 'PATCH', 'EXPORT', 'IMPORT', 'DOWNLOAD', 'UPLOAD']

export function generateActionTypes(entity, actions) {
    const actionTypes = {};
    actions.forEach(action => {
        actionTypes[`${entity}_${action}_REQUEST`] = `${entity}_${action}_REQUEST`;
        actionTypes[`${entity}_${action}_SUCCESS`] = `${entity}_${action}_SUCCESS`;
        actionTypes[`${entity}_${action}_FAILURE`] = `${entity}_${action}_FAILURE`;
    });
    actionTypes[`${entity}_RESET_REQUEST`] = `${entity}_RESET_REQUEST`;
    actionTypes[`${entity}_RESET_SUCCESS`] = `${entity}_RESET_SUCCESS`;
    return actionTypes;
}

export function getLoadingStateName(entityName, action) {
    const actionName = action
        .split('_')
        .map(capitalize)
        .join('')
    return `isLoading${actionName}${capitalize(entityName)}`
}
  
export function getActionTypes(entity, actions) {
    return generateActionTypes(entity.toUpperCase(), actions.map(action => action.toUpperCase()));
}

export function generateDefaultState(entityName, actions) {
    entityName = entityName.toLowerCase()
    return actions
        .map(action => {
            if (API_ACTION_TYPES.indexOf(action.toUpperCase()) < 0) {
                // eslint-disable-next-line no-console
                console.warn(`Action name: ${action} is invalid.`)
            }

            return {
                [getLoadingStateName(entityName, action)]: false
            }
        })
        .reduce(
            (result, action) => ({
                ...result,
                ...action
            }),
            {
                [entityName]: {},
                [`${entityName}List`]: []
            }
        )
}

export function* crudSaga(action, endpoint, successAction, failureAction, method) {
    try {
      let response;
      if (method === 'POST') {
        response = yield call(post, endpoint, action.payload);
      } else if (method === 'PUT') {
        const { id, ...rest } = action.payload;
        response = yield call(update, `${endpoint}/${id}`, rest);
      } 
      else if (method === 'DELETE') {
        const { id } = action.payload;
        response = yield call(del, `${endpoint}/${id}`);
      } 
      yield put(successAction(response.data));
    } catch (error) {
      yield put(failureAction(error));
    }
  }

export function* querySaga(action, endpoint, successAction, failureAction) {
    try {
      const response = yield call(get, endpoint, { params: action.payload });
      yield put(successAction(response.data));
    } catch (error) {
      yield put(failureAction(error));
    }
  }