const router = require('express').Router();
const apicache = require('apicache');
const redis = require('redis');
const {getCustomerById} = require('./controllers/customer');
const {getProductById} = require('./controllers/product');
const {getMultipleEndpoints} = require('./controllers/common');

const cacheWithRedis = apicache.options({redisClient: redis.createClient()}).middleware;

router.get('/customers/:id', cacheWithRedis('5 minutes'), getCustomerById);
router.get('/products/:id', cacheWithRedis('5 minutes'), getProductById);
router.get('/multiple/', getMultipleEndpoints);

module.exports = router;
