// Source: https://github.com/coss-exchange/trading-api-wrapper-node-js/blob/master/index.js
// Documentation: https://api.coss.io/v1/spec

const MODULE_NAME = "COSS Client"
const request = require('superagent');
const querystring = require('querystring');
const HttpMethod = { POST: 1, GET: 2, DELETE: 3 };
const util = require('util');

const HOST_URL = "https://trade.coss.io/c/api/v1";
const HOST_URL2 = "https://engine.coss.io/api/v1";
const EXCHANGE_HOST = "https://exchange.coss.io/api";

//WRAPPER STARTS HERE (Commenting out stuff that coss wrote which should be part of bot.js (the actual trading bot) rather than index.js (the wrapper core functionality))
let Coss = (keyVaultAPI, logger) => {

    //HTTPS Private Request
    async function transmit_encrypted_request(method, url, payload) {
        var payload_json_str = method == HttpMethod.GET ? querystring.stringify(payload) : JSON.stringify(payload)
        var sign = await transmit_payload_signature_get(payload_json_str)
        var req_headers = transmit_signed_header_get(sign)

        logger.write(MODULE_NAME, `sending private message to ${url}`)

        if (method == HttpMethod.POST) {
            let response = await request.post(url).set(req_headers).send(payload_json_str)
            return (response.body);

        } else if (method == HttpMethod.DELETE) {
            let response = await request.delete(url).set(req_headers).send(payload_json_str)
            return (response.body);

        } else if (method == HttpMethod.GET) {
            let response = await request.get(url).set(req_headers).query(payload_json_str)
            return (response.body);
        }
    }

    function transmit_signed_header_get(sign) {
        var req_headers = {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest',
            'Authorization': sign.Key,
            'Signature': sign.Sign,
        }
        return req_headers
    }

    //AUTHBUILDER
    async function transmit_payload_signature_get(payload_json_str) {
        keyVaultAPI.signTransaction[util.promisify.custom] = n => new Promise((resolve, reject) => {
            keyVaultAPI.signTransaction(payload_json_str, (result, details) => {
                if (result === undefined) {
                    logger.write(MODULE_NAME, details)
                    reject(global.DEFAULT_FAIL_RESPONSE)
                } else {
                    resolve(result)
                }
            })
        })
        const signTransaction = util.promisify(keyVaultAPI.signTransaction)
        return await signTransaction(payload_json_str)
    }

    //HTTPS Public Request
    async function publicRequest(url) {
        let response = await request.get(url)
        return response.body;
    }


    return {
        //PLACE LIMIT ORDER
        placeLimitOrder: async (params = {}) => {
            if (!params.Symbol) {
                return Promise.reject("placeLimitOrder(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("placeLimitOrder(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            } else if (!params.Side) {
                return Promise.reject("placeLimitOrder(), You must supply a valid Side, e.g. 'BUY' or 'SELL'!");
            } else if (params.Side && params.Side !== 'Buy' && params.Side !== 'Sell') {
                return Promise.reject("placeLimitOrder(), You must supply a valid Side, e.g. 'BUY' or 'SELL'!");
            } else if (!params.Price || !params.Amount) {
                return Promise.reject("placeLimitOrder(), You must supply a valid Price and Amount, e.g. Price: '0.00000034' or Amount: '123.00000000'!");
                //} else if (typeof params.Price !== 'number' || typeof params.Amount !== 'number') {
                //return Promise.reject("placeLimitOrder(), You must supply a valid Price and Amount as a number, e.g. Price: '0.00000034' or Amount: '123.00000000'!");
            }
            var now = new Date().getTime()
            var query_params = {
                'order_symbol': params.Symbol,
                'order_price': params.Price.toString(),
                'order_side': params.Side,
                'order_size': params.Amount.toString(),
                'type': 'limit',
                'timestamp': now,
                'recvWindow': 5000
            }
            let url = HOST_URL + "/order/add";
            return transmit_encrypted_request(HttpMethod.POST, url, query_params)
        },

        //PLACE MARKET ORDER
        placeMarketOrder: async (params = {}) => {
            if (!params.Symbol) {
                return Promise.reject("placeMarketOrder(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("placeMarketOrder(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            } else if (!params.Side) {
                return Promise.reject("placeMarketOrder(), You must supply a valid Side, e.g. 'BUY' or 'SELL'!");
            } else if (params.Side && params.Side !== 'Buy' && params.Side !== 'Sell') {
                return Promise.reject("placeMarketOrder(), You must supply a valid Side, e.g. 'BUY' or 'SELL'!");
            } else if (!params.Amount) {
                return Promise.reject("placeMarketOrder(), You must supply a valid Amount, e.g. Amount: '123.00000000'!");
            } else if (typeof params.Amount !== 'number') {
                return Promise.reject("placeMarketOrder(), You must supply a valid Amount as a number, e.g. Amount: '123.00000000'!");
            }
            var now = new Date().getTime()
            var query_params = {
                'order_symbol': params.Symbol,
                'order_side': params.Side,
                'order_size': params.Amount.toString(),
                'type': 'market',
                'timestamp': now,
                'recvWindow': 5000
            }
            let url = HOST_URL + "/order/add";
            return transmit_encrypted_request(HttpMethod.POST, url, query_params)
        },

        //Get Account Balances
        getAccountBalances: async (params = {}) => {
            var now = new Date().getTime()
            var query_params = {
                'recvWindow': 5000,
                'timestamp': now
            }
            let url = HOST_URL + "/account/balances";
            return transmit_encrypted_request(HttpMethod.GET, url, query_params)
        },

        //Get Account Details
        getAccountDetails: async (params = {}) => {
            var now = new Date().getTime()
            var query_params = {
                'recvWindow': 5000,
                'timestamp': now
            }
            let url = HOST_URL + "/account/details";
            return transmit_encrypted_request(HttpMethod.GET, url, query_params)
        },

        //CANCEL ORDER BY ID #
        cancelOrder: async (params = {}) => {
            if (!params.ID) {
                return Promise.reject("cancelOrder(), You must supply a valid order_ID to cancel, e.g. '9e5ae4dd-3369-401d-81f5-dff985e1c4e7'!");
            } else if (params.ID && typeof params.ID !== 'string') {
                return Promise.reject("cancelOrder(), You must supply a valid order_ID to cancel as a string, e.g. '9e5ae4dd-3369-401d-81f5-dff985e1c4e7'!");
            } else if (!params.Symbol) {
                return Promise.reject("cancelOrder(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("cancelOrder(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            }

            var now = new Date().getTime()
            var query_params = {
                'order_id': params.ID,
                'order_symbol': params.Symbol,
                'timestamp': now,
                'recvWindow': 5000
            }
            let url = HOST_URL + "/order/cancel";
            return transmit_encrypted_request(HttpMethod.DELETE, url, query_params)
        },

        //GET ORDER DETAILS
        getOrderDetails: async (params = {}) => {
            if (!params.ID) {
                return Promise.reject("getOrderDetails(), You must supply a valid order_ID to cancel, e.g. '9e5ae4dd-3369-401d-81f5-dff985e1c4e7'!");
            } else if (params.ID && typeof params.ID !== 'string') {
                return Promise.reject("getOrderDetails(), You must supply a valid order_ID to cancel as a string, e.g. '9e5ae4dd-3369-401d-81f5-dff985e1c4e7'!");
            }

            var now = new Date().getTime()
            var query_params = {
                'order_id': params.ID,
                'timestamp': now,
                'recvWindow': 5000
            }
            let url = HOST_URL + "/order/details";
            return transmit_encrypted_request(HttpMethod.POST, url, query_params)
        },

        //GET TRADE DETAILS
        getTradeDetails: async (params = {}) => {
            if (!params.ID) {
                return Promise.reject("getTradeDetails(), You must supply a valid order_ID to getTradeDetails, e.g. '9e5ae4dd-3369-401d-81f5-dff985e1c4e7'!");
            } else if (params.ID && typeof params.ID !== 'string') {
                return Promise.reject("getTradeDetails(), You must supply a valid order_ID to getTradeDetails as a string, e.g. '9e5ae4dd-3369-401d-81f5-dff985e1c4e7'!");
            }

            var now = new Date().getTime()
            var query_params = {
                'order_id': params.ID,
                'timestamp': now,
                'recvWindow': 5000
            }
            let url = HOST_URL + "/order/trade-detail";
            return transmit_encrypted_request(HttpMethod.POST, url, query_params)
        },

        //GET OPEN ORDERS
        getOpenOrders: async (params = {}) => {
            if (!params.Limit) {
                return Promise.reject("getOpenOrders(), You must supply a valid Limit for your open orders, e.g. '10'!");
            } else if (params.Limit && typeof params.Limit !== 'number') {
                return Promise.reject("getOpenOrders(), You must supply a valid Limit as a number for your open orders, e.g. '10'!");
            } else if (!params.Symbol) {
                return Promise.reject("getOpenOrders(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("getOpenOrders(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            }

            var now = new Date().getTime()
            var query_params = {
                'limit': params.Limit.toString(),
                'page': 0,
                'symbol': params.Symbol,
                'timestamp': now,
                'recvWindow': 5000
            }
            let url = HOST_URL + "/order/list/open";
            return transmit_encrypted_request(HttpMethod.POST, url, query_params)
        },

        //GET COMPLETED ORDERS
        getCompletedOrders: async (params = {}) => {
            if (!params.Limit) {
                return Promise.reject("getCompletedOrders(), You must supply a valid Limit for your open orders, e.g. '10'!");
            } else if (params.Limit && typeof params.Limit !== 'number') {
                return Promise.reject("getCompletedOrders(), You must supply a valid Limit as a number for your open orders, e.g. '10'!");
            } else if (!params.Symbol) {
                return Promise.reject("getCompletedOrders(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("getCompletedOrders(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            }

            var now = new Date().getTime()
            var query_params = {
                'limit': params.Limit.toString(),
                'page': 0,
                'symbol': params.Symbol,
                'timestamp': now,
                'recvWindow': 5000
            }
            let url = HOST_URL + "/order/list/completed";
            return transmit_encrypted_request(HttpMethod.POST, url, query_params)
        },

        //GET ALL USER ORDERS
        getAllOrders: async (params = {}) => {
            if (!params.Limit) {
                return Promise.reject("getAllOrders(), You must supply a valid Limit for your open orders, e.g. '10'!");
            } else if (params.Limit && typeof params.Limit !== 'number') {
                return Promise.reject("getAllOrders(), You must supply a valid Limit as a number for your open orders, e.g. '10'!");
            } else if (!params.Symbol) {
                return Promise.reject("getAllOrders(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("getAllOrders(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            } else if (!params.ID) {
                return Promise.reject("getAllOrders(), You must supply a valid account ID");
            } else if (params.ID && typeof params.ID !== 'string') {
                return Promise.reject("getAllOrders(), You must supply a valid account ID as a string");
            }

            var now = new Date().getTime()
            var query_params = {
                'symbol': params.Symbol,
                'from_id': params.ACCT_ID,
                'limit': params.Limit,
                'timestamp': now,
                'recvWindow': 5000
            }
            let url = HOST_URL + "/order/list/all";
            return transmit_encrypted_request(HttpMethod.POST, url, query_params)
        },


        //Public API Calls (don't need to be signed)
        //get Market Price
        getMarketPrice: async (params = {}) => {
            if (!params.Symbol) {
                return Promise.reject("getMarketPrice(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("getMarketPrice(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            }

            let url = HOST_URL + "/market-price/" + '?symbol=' + params.Symbol;


            return publicRequest(url);
        },

        //get Market Price
        getPairDepth: async (params = {}) => {
            if (!params.Symbol) {
                return Promise.reject("getPairDepth(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("getPairDepth(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            }
            logger.write(MODULE_NAME, HOST_URL2 + "/dp" + '?symbol=' + params.Symbol);
            let url = HOST_URL2 + "/dp" + '?symbol=' + params.Symbol;


            return publicRequest(url);
        },

        //get Market Price
        getMarketSides: async (params = {}) => {
            if (!params.Symbol) {
                return Promise.reject("getMarketSides(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("getMarketSides(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            }
            logger.write(MODULE_NAME, HOST_URL2 + "/dp" + '?symbol=' + params.Symbol);
            let url = HOST_URL2 + "/dp" + '?symbol=' + params.Symbol;

            let pairDepth = await publicRequest(url);
            let marketSides = [[pairDepth.bids[0][0], pairDepth.bids[0][1]], [pairDepth.asks[0][0], pairDepth.asks[0][1]]];

            return (marketSides)
        },

        //get Exchange Info
        getExchangeInfo: async () => {
            logger.write(MODULE_NAME, HOST_URL + "/exchange-info");
            let url = HOST_URL + "/exchange-info";

            return publicRequest(url);
        },

        //get Market Summary (NOT WORKING ATM)
        getMarketSummary: async (params = {}) => {
            if (!params.Symbol) {
                return Promise.reject("getMarketSummary(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("getMarketSummary(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            }
            logger.write(MODULE_NAME, EXCHANGE_HOST + "/getmarketsummaries/" + '?symbol=' + params.Symbol);
            let url = EXCHANGE_HOST + "/getmarketsummaries/" + '?symbol=' + params.Symbol;

            return publicRequest(url);
        },

        getTradeHistory: async (params = {}) => {
            if (!params.Symbol) {
                return Promise.reject("getTradeHistory(), You must supply a valid trading pair Symbol, e.g. 'COSS_ETH'!");
            } else if (params.Symbol && typeof params.Symbol !== 'string') {
                return Promise.reject("getTradeHistory(), You must supply a valid trading pair Symbol as a string, e.g. 'COSS_ETH'!");
            }
            logger.write(MODULE_NAME, HOST_URL2 + "/ht" + '?symbol=' + params.Symbol);
            let url = HOST_URL2 + "/ht" + '?symbol=' + params.Symbol;

            return publicRequest(url);
        }
    }
};
module.exports = exports = Coss;
