import axios from 'axios'
import qs from 'qs'
import omitBy from 'lodash/omitBy'
import storage from './storage'

const URL = window && window.config && window.config.END_POINT; //for dev

const settings = {
    networkTimeout: 30000
}

const qsConfig = {
    arrayFormat: 'repeat',
    filter: (prefix, params) => {
        //remove params if it has empty string value
        if (!prefix) {
            return omitBy(params, val => val === '')
        }
        return params
    }
}

const defaultRequestConfig = {
    baseURL: URL,
    timeout: settings.networkTimeout,
    paramsSerializer: params => qs.stringify(params, qsConfig),
    headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
    }
}

const agent = axios.create({ ...defaultRequestConfig })

const appendHeader = axiosConfig => {
    const token = storage.getToken()
    axiosConfig.headers['Authorization'] = token ? token : ''
    return axiosConfig
}

const errorHandler = error => {
    return Promise.reject(error)
}

agent.interceptors.request.use(appendHeader, errorHandler)

const get = (uri, options = {}) => {
    return agent.get(uri, options)
}

const post = (uri, data = {}, config = {}) => {
    return agent.post(uri, data, config)
}

const update = (uri, data = {}, config = {}) => {
    return agent.put(uri, data, config)
}

const del = (uri, data = {}) => {
    return agent.delete(uri, data)
}

export { del, get, post, update }
