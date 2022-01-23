const axios = require('axios');
const {fetchMultipleEndpoints} = require('../../services/multiple');
const WrongEndpointsException = require('../../errors/WrongEndpointsException');

jest.mock('axios');

const getRandomInt = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
const random = (arr) => arr[Math.floor(Math.random() * arr.length)];

function memorySizeOf(obj) {
    let bytes = 0

    function sizeOf(obj) {
        if (obj !== null && obj !== undefined) {
            switch (typeof obj) {
                case 'number':
                    bytes += 8
                    break
                case 'string':
                    bytes += obj.length * 2
                    break
                case 'boolean':
                    bytes += 4
                    break
                case 'object':
                    const objClass = Object.prototype.toString.call(obj).slice(8, -1)
                    if (objClass === 'Object' || objClass === 'Array') {
                        for (const key in obj) {
                            if (!obj.hasOwnProperty(key)) continue
                            sizeOf(obj[key])
                        }
                    } else bytes += obj.toString().length * 2
                    break
            }
        }
        return bytes
    }

    function formatByteSize(bytes) {
        if (bytes < 1024) return bytes + ' bytes'
        else if (bytes < 1048576) return (bytes / 1024).toFixed(3) + ' KiB'
        else if (bytes < 1073741824) return (bytes / 1048576).toFixed(3) + ' MiB'
        else return (bytes / 1073741824).toFixed(3) + ' GiB'
    }

    return formatByteSize(sizeOf(obj))
}

const generateEndpointQuery = (n) => {
    const routes = ['customers', 'products', 'dumb'];
    const query = {};
    for (let i = 0; i < n; i++) {
        const type = random(routes);
        const id = getRandomInt(1, n);
        Object.assign(query, {
            [i]: `/${type}/${id}`
        });
    }
    return query;
}

describe('Multiple endpoint', () => {
    test('fetch multiple endpoints', async () => {
        const resp = await fetchMultipleEndpoints({
            bob: '/customers/13',
            alice: '/customers/25',
            ketchup: '/products/993',
            mustard: '/products/90'
        });
        expect(resp).toHaveProperty('bob.data.name', 'Bob');
        expect(resp).toHaveProperty('alice.data.name', 'Alice');
        expect(resp).toHaveProperty('mustard.status', 404);
        expect(resp).toHaveProperty('ketchup.data.name', 'Heinz');
        expect(resp).toHaveProperty('mustard.response.message', 'product does not exist');
    });

    test('fetch 100 multiple endpoints', async () => {
        const query = generateEndpointQuery(100);
        const resp = await fetchMultipleEndpoints(query);
        expect(Object.keys(resp).length).toBe(100);
    });

    test('fetch 10000 multiple endpoints', async () => {
        const query = generateEndpointQuery(10000);
        const resp = await fetchMultipleEndpoints(query);
        expect(Object.keys(resp).length).toBe(10000);
    }, 50000);

    test('fetch 100000 multiple endpoints', async () => {
        const query = generateEndpointQuery(100000);
        const resp = await fetchMultipleEndpoints(query);
        expect(Object.keys(resp).length).toBe(100000);
    }, 500000);

    test('throw exception on empty endpoints params', async () => {
        await expect(fetchMultipleEndpoints({})).rejects.toThrow(WrongEndpointsException);
    });

    test('throw exception on null endpoints params', async () => {
        await expect(fetchMultipleEndpoints(null)).rejects.toThrow(WrongEndpointsException);
    });

    test('should return an empty object if the route is not specified', async () => {
        await expect(fetchMultipleEndpoints({123: ''})).resolves.toStrictEqual({});
    });
});

describe('Server didn’t respond to some of the sub-endpoints', () => {
    axios.get.mockImplementation((url) => {
        switch (url) {
            case '/customers/13':
                return Promise.resolve({data: {name: 'Bob', id: 13, age: 27}})
            case '/customers/25':
                return Promise.reject(new Error('Network error'))
        }
    })

    test('simulate endpoint rejection with an error', () => {
        Promise.allSettled([
            axios.get('/customers/13'),
            axios.get('/customers/25')
        ]).then((resp) => {
            expect(resp[0].status).toBe('fulfilled');
            expect(resp[0].value).toHaveProperty('data.name', 'Bob');
            expect(resp[1].status).toBe('rejected');
            expect(resp[1].value).toBe(undefined);
        });
    })
})
