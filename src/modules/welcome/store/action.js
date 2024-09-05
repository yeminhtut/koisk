import { getActionTypes, generateDefaultState } from '../../../utils/reduxHelper';

export const actions = getActionTypes('store', ['GET']);

export const initialGenealState = generateDefaultState('store', [
    'GET'
])