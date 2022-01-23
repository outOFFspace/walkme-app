const axios = require('axios');
const http = require('http');
const get = require('lodash/get');
const chunk = require('lodash/chunk');
const WrongEndpointsException = require('../errors/WrongEndpointsException');
const {host, port} = require('../config');

const request = axios.create({
    // 60 sec timeout
    timeout: 60 * 1000,
    httpAgent: new http.Agent({keepAlive: true, maxSockets: 1}),
    // cap the maximum content length we'll accept to 5GBs
    maxContentLength: 5000 * 1000 * 1000
});

const isObject = (obj) => {
    return Object.prototype.toString.call(obj) === '[object Object]';
};

const fetchData = (uniqueId, route) => {
    return request({
        url: route,
        baseURL: `${host}:${port}`
    }).then((res) => {
        return {
            [uniqueId]: {data: res.data}
        }
    }).catch((e) => {
            return {
                [uniqueId]: {
                    status: get(e, 'response.status', 404),
                    response: {
                        message: get(e, 'response.data.response', `${uniqueId} does not exist`)
                    }
                }
            }
        }
    );
}

module.exports = {
    async fetchMultipleEndpoints(query) {
        if (!isObject(query) || !Object.keys(query).length) {
            throw new WrongEndpointsException();
        }
        const endpointsPromises = [];
        for (const uniqueId in query) {
            if (Object.prototype.hasOwnProperty.call(query, uniqueId)) {
                let route = query[uniqueId];
                // in case of non unique id
                if (Array.isArray(route)) {
                    [route] = query[uniqueId];
                }
                endpointsPromises.push(fetchData(uniqueId, route))
            }
        }

        const chunks = chunk(endpointsPromises, 100);
        const response = {};
        for (let i = 0; i < chunks.length; i++) {
            const res = await Promise.all(chunks[i]);
            res.forEach(item => {
                Object.assign(response, item);
            });
        }
        return response;
    }
}
