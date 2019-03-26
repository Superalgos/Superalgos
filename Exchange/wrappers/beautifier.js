const _ = require('underscore');

class Beautifier {

    constructor() {
        this._beautifications = {
            aggTrades: {
                a: 'aggTradeId',
                p: 'price',
                q: 'quantity',
                f: 'firstTradeId',
                l: 'lastTradeId',
                T: 'timestamp',
                m: 'maker',
                M: 'bestPriceMatch'
            },
            klines: {
                0: 'openTime',
                1: 'open',
                2: 'high',
                3: 'low',
                4: 'close',
                5: 'volume',
                6: 'closeTime',
                7: 'quoteAssetVolume',
                8: 'trades',
                9: 'takerBaseAssetVolume',
                10: 'takerQuoteAssetVolume',
                11: 'ignored'
            },
            bids: [
                {
                    0: 'price',
                    1: 'quantity',
                    2: 'ignored'
                }
            ],
            asks: [
                {
                    0: 'price',
                    1: 'quantity',
                    2: 'ignored'
                }
            ],
            depthUpdateEvent: {
                e: 'eventType',
                E: 'eventTime',
                s: 'symbol',
                u: 'updateId',
                b: 'bidDepthDelta',
                a: 'askDepthDelta'
            },
            bidDepthDelta: [
                {
                    0: 'price',
                    1: 'quantity',
                    2: 'ignored'
                }
            ],
            askDepthDelta: [
                {
                    0: 'price',
                    1: 'quantity',
                    2: 'ignored'
                }
            ],
            klineEvent: {
                e: 'eventType',
                E: 'eventTime',
                s: 'symbol',
                k: 'kline'
            },
            kline: {
                t: 'startTime',
                T: 'endTime',
                s: 'symbol',
                i: 'interval',
                f: 'firstTradeId',
                L: 'lastTradeId',
                o: 'open',
                c: 'close',
                h: 'high',
                l: 'low',
                v: 'volume',
                n: 'trades',
                x: 'final',
                q: 'quoteVolume',
                V: 'volumeActive',
                Q: 'quoteVolumeActive',
                B: 'ignored'
            },
            aggTradeEvent: {
                e: 'eventType',
                E: 'eventTime',
                s: 'symbol',
                a: 'tradeId',
                p: 'price',
                q: 'quantity',
                f: 'firstTradeId',
                l: 'lastTradeId',
                T: 'time',
                m: 'maker',
                M: 'ignored'
            },
            outboundAccountInfoEvent: {
                e: 'eventType',
                E: 'eventTime',
                m: 'makerCommission',
                t: 'takerCommission',
                b: 'buyerCommission',
                s: 'sellerCommission',
                T: 'canTrade',
                W: 'canWithdraw',
                D: 'canDeposit',
                B: 'balances'
            },
            balances: [
                {
                    a: 'asset',
                    f: 'availableBalance',
                    l: 'onOrderBalance'
                }
            ],
            executionReportEvent: {
                e: 'eventType',
                E: 'eventTime',
                s: 'symbol',
                c: 'newClientOrderId',
                S: 'side',
                o: 'orderType',
                f: 'cancelType', // GTC 'Good till Cancel', IOC: 'Immediate or Cancel'
                q: 'quantity',
                p: 'price',
                x: 'executionType',
                X: 'orderStatus',
                r: 'rejectReason',
                i: 'orderId',
                l: 'lastTradeQuantity',
                z: 'accumulatedQuantity',
                L: 'lastTradePrice',
                n: 'commission',
                N: 'commissionAsset',
                m: 'maker',
                T: 'tradeTime',
                t: 'tradeId'
            }
        }
    }

    beautify(object, type) {
        const beautifications = _.isObject(type) ? type : this._beautifications[type];
        if (!beautifications) {
            return object;
        }
        let newItem = {};
        _.each(object, (value, key) => {
            if (_.isArray(value)) {
                const newArray = [];
                if (_.isArray(this._beautifications[beautifications[key]])) {
                    _.each(value, arrayValue => {
                        newArray.push(this.beautify(arrayValue, this._beautifications[beautifications[key]][0]));
                    });
                } else {
                    _.each(value, (value, key) => {
                        newItem.push(this.beautify(value, beautifications[key]))
                    });
                }
                const newKey = beautifications[key] || key;
                newItem[newKey] = newArray;
            } else if (_.isObject(value)) {
                const newKey = beautifications[key] || key;
                newItem[newKey] = this.beautify(value, beautifications[key]);
            } else {
                const newKey = beautifications[key] || key;
                newItem[newKey] = value;
            }
        });
        return newItem;
    }

}

module.exports = Beautifier;