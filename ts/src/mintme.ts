/* eslint-disable prefer-arrow-callback */
/* eslint-disable func-names */
/* eslint-disable no-constant-condition */
/* eslint-disable no-console */
// ---------------------------------------------------------------------------

import Exchange from './abstract/mintme.js';
import { BadRequest, ExchangeError, ArgumentsRequired } from './base/errors.js';
import type { Dict, Int, Market, Order, Ticker, Transaction, Dictionary } from './base/types.js';
import { TICK_SIZE } from './base/functions.js';
import { sha512 } from './static_dependencies/noble-hashes/sha512.js';

interface TickerDetails {
    base_id: number;
    quote_id: number;
    last_price: string;
    quote_volume: number;
    base_volume: number;
    isFrozen: number;
}
interface TickerPairObject {
    [tradingPair: string]: TickerDetails;
}

/**
 * @class mintme
 * @augments Exchange
 */
export default class mintme extends Exchange {
    /**
     * Describes the exchange properties.
     * @returns {object} The exchange description object.
     */
    describe () {
        return this.deepExtend (super.describe (), {
            'id': 'mintme',
            'name': 'MintMe',
            'countries': [ 'Global' ],
            'rateLimit': 2000,
            'version': 'v2',
            'pro': false,
            'has': {
                'CORS': false,
                'spot': true,
                'margin': false,
                'swap': false,
                'future': false,
                'option': false,
                'addMargin': false,
                'cancelAllOrders': false,
                'cancelOrder': false,
                'createMarketOrder': false,
                'createOrder': true,
                'createReduceOnlyOrder': false,
                'createStopLimitOrder': false,
                'createStopMarketOrder': false,
                'createStopOrder': false,
                'deleteOrder': true,
                'fetchActiveMarketOrder': true,
                'fetchActiveUserOrders': true,
                'fetchAddresses': true,
                'fetchBalance': true,
                'fetchClosedOrders': false,
                'fetchCompletedTrades': true,
                'fetchCurrencies': true,
                'fetchCurrency': true,
                'fetchDeposits': false,
                'fetchFinishedMarketOrder': true,
                'fetchFinishedUserOrders': true,
                'fetchFundingHistory': false,
                'fetchFundingRate': false,
                'fetchFundingRates': false,
                'fetchHistory': true,
                'fetchIndexOHLCV': false,
                'fetchLeverage': false,
                'fetchLeverageTiers': false,
                'fetchMarketInfo': true,
                'fetchMarkets': true,
                'fetchMarkOHLCV': false,
                'fetchMyTrades': false,
                'fetchOHLCV': false,
                'fetchOpenOrders': false,
                'fetchOrder': false,
                'fetchOrderBook': true,
                'fetchOrders': false,
                'fetchPosition': false,
                'fetchPositions': false,
                'fetchPremiumIndexOHLCV': false,
                'fetchTickerMarketPairs': true,
                'fetchTime': false,
                'fetchTrades': false,
                'fetchTradesMarketPair': false,
                'fetchTradingFee': true,
                'fetchTradingFees': false,
                'fetchTransactionFees': false,
                'fetchWithdrawalFee': true,
                'fetchWithdrawals': false,
                'withdraw': true,
            },
            'urls': {
                'logo': 'https://www.mintme.com/token.svg',
                'api': {
                    'public': 'https://www.mintme.com/dev/api/v2/open',
                    'private': 'https://www.mintme.com/dev/api/v2/auth',
                },
                'www': 'https://www.mintme.com',
                'doc': [ 'https://www.mintme.com/api' ],
                'fees': 'https://www.mintme.com/kb/Trading-fees',
            },
            'api': {
                'public': {
                    'get': {
                        'orderbook/{base_quote}': 1,
                        'summary': 1,
                        'ticker': 1,
                        'trades/{market_pair}': 1,
                    },
                },
                'private': {
                    'get': {
                        'currencies': 1,
                        'currencies/{name}': 1,
                        'markets/{base}/{quote}': 1,
                        'orders/active': 1,
                        'orders/finished': 1,
                        'user/orders/active': 1,
                        'user/orders/finished': 1,
                        'user/wallet/addresses': 1,
                        'user/wallet/balances': 1,
                        'user/wallet/history': 1,
                    },
                    'post': {
                        'user/orders': 1,
                        'user/wallet/withdraw': 1,
                    },
                    'delete': {
                        'user/orders/{id}': 1,
                    },
                },
            },
            'fees': {
                'trading': {
                    'regular': {
                        'maker': this.parseNumber ('0.005'),
                        'taker': this.parseNumber ('0.005'),
                    },
                    'quick': {
                        'maker': this.parseNumber ('0.005'),
                        'taker': this.parseNumber ('0.005'),
                    },
                },
                'funding': {
                    'withdraw': {
                        'MINTME': { 'MintMe': 1 },
                        'BTC': { 'Bitcoin': 0.0004 },
                        'ETH': {
                            'Ethereum': 0.004,
                            'Arbitrum': 0.0004,
                            'BASE': 0.0004,
                        },
                        'USDC': {
                            'Ethereum': 20,
                            'BNB Smart Chain': 2,
                        },
                        'USDT': {
                            'Ethereum': 20,
                            'BNB Smart Chain': 2,
                        },
                        'BNB': { 'BNB Smart Chain': 0.002 },
                        'MATIC': { 'Polygon': 1.5 },
                        'SOL': { 'Solana': 0.008 },
                        'CFX': { 'Conflux': 6 },
                        'CRO': { 'Cronos': 10 },
                        'AVAX': { 'Avalanche': 0.04 },
                    },
                    'Deposit': { 'fee': 0 },
                },
                'donation': {
                    'direct_purchase_fee': this.parseNumber ('0.02'),
                },
            },
            'precisionMode': TICK_SIZE,
            'exceptions': {
                '400': BadRequest,
                '401': ArgumentsRequired,
            },
        });
    }

    /**
     * Callback for processing each ticker pair object.
     * @param {TickerPairObject} pairObject - The ticker pair object.
     * @param {Ticker[]} tickers - The array to accumulate parsed tickers.
     * @returns {void}
     */
    private parseTickerPairCallback (this: mintme, pairObject: TickerPairObject, tickers: Ticker[]): void {
        const tradingPairName = Object.keys (pairObject)[0];
        const details = pairObject[tradingPairName];
        if (tradingPairName && details) {
            tickers.push ({
                'symbol': tradingPairName,
                'info': null,
                'timestamp': 0,
                'datetime': '',
                'high': 0,
                'low': 0,
                'bid': 0,
                'bidVolume': 0,
                'ask': 0,
                'askVolume': this.safeFloat (details, 'quote_volume'),
                'vwap': 0,
                'open': 0,
                'close': 0,
                'last': this.safeFloat (details, 'last_price'),
                'previousClose': 0,
                'change': 0,
                'percentage': 0,
                'average': 0,
                'quoteVolume': 0,
                'baseVolume': this.safeFloat (details, 'base_volume'),
                'indexPrice': 0,
                'markPrice': 0,
            });
        }
    }

    /**
     * Callback for processing each currency item.
     * @param {any} item - The raw currency item.
     * @param {{ [key: string]: any }} currencies - The object to accumulate parsed currencies.
     * @returns {void}
     */
    private parseCurrencyCallback (this: mintme, item: any, currencies: { [key: string]: any }): void {
        const currencyId = this.safeString (item, 'symbol');
        if (currencyId) {
            currencies[currencyId] = {
                'id': this.safeInteger (item, 'id'),
                'name': this.safeString (item, 'name'),
                'priceDecimals': this.safeInteger (item, 'priceDecimals'),
                'hasTax': this.safeBool (item, 'hasTax'),
                'isPausable': this.safeBool (item, 'isPausable'),
                'depositsDisabled': this.safeBool (item, 'depositsDisabled'),
                'withdrawalsDisabled': this.safeBool (item, 'withdrawalsDisabled'),
                'tradesDisabled': this.safeBool (item, 'tradesDisabled'),
                'type': this.safeString (item, 'type'),
                'bondingCurvePool': this.safeBool (item, 'bondingCurvePool'),
                'symbol': this.safeString (item, 'symbol'),
                'deploymentStatus': this.safeString (item, 'deploymentStatus'),
                'blocked': this.safeBool (item, 'blocked'),
                'quiet': this.safeBool (item, 'quiet'),
                'availableContentReward': this.safeBool (item, 'availableContentReward'),
                'bondingCurveType': this.safeBool (item, 'bondingCurveType'),
            };
        }
    }

    /**
     * Parses ticker pairs from the response.
     * @param {any} response - The raw ticker response.
     * @returns {Ticker[]} An array of ticker objects.
     */
    parseTickerPairs (response: any): Ticker[] {
        const tickers: Ticker[] = [];
        if (Array.isArray (response)) {
            for (let i = 0; i < response.length; i++) {
                this.parseTickerPairCallback (response[i], tickers);
            }
        } else {
            console.warn ('Response is not an array!', response);
        }
        return tickers;
    }

    /**
     * Parses currencies from the response.
     * @param {any} response - The raw currencies response.
     * @returns {object} An object mapping currency symbols to currency details.
     */
    parseCurrencies (response: any) {
        const currencies: { [key: string]: any } = {};
        if (Array.isArray (response)) {
            for (let i = 0; i < response.length; i++) {
                this.parseCurrencyCallback (response[i], currencies);
            }
        }
        return currencies;
    }

    /**
     * Parses a specific currency response.
     * @param {any} response - The raw currency response.
     * @returns {object|null} The structured currency data or null if not found.
     */
    parseCurrencyName (response: any) {
        if (!response) {
            return null;
        }
        let networks = [];
        if (Array.isArray (response.networks)) {
            networks = response.networks;
        }
        return {
            'id': this.safeInteger (response, 'id'),
            'name': this.safeString (response, 'name'),
            'priceDecimals': this.safeInteger (response, 'priceDecimals'),
            'hasTax': this.safeBool (response, 'hasTax'),
            'isPausable': this.safeBool (response, 'isPausable'),
            'depositsDisabled': this.safeBool (response, 'depositsDisabled'),
            'withdrawalsDisabled': this.safeBool (response, 'withdrawalsDisabled'),
            'tradesDisabled': this.safeBool (response, 'tradesDisabled'),
            'type': this.safeString (response, 'type'),
            'bondingCurvePool': this.safeString (response, 'bondingCurvePool'),
            'symbol': this.safeString (response, 'symbol'),
            'deploymentStatus': this.safeString (response, 'deploymentStatus'),
            'blocked': this.safeBool (response, 'blocked'),
            'quiet': this.safeBool (response, 'quiet'),
            'availableContentReward': this.safeBool (response, 'availableContentReward'),
            'bondingCurveType': this.safeBool (response, 'bondingCurveType'),
            'networks': networks,
        };
    }

    /**
     * Parses market information from the response.
     * @param {any} response - The raw market info response.
     * @returns {object} The structured market info.
     */
    parseMarketInfo (response: any) {
        return {
            'last': response.last,
            'volume': response.volume,
            'open': response.open,
            'close': response.close,
            'high': response.high,
            'low': response.low,
            'deal': response.deal,
            'quote': response.quote,
            'base': response.base,
            'buyDepth': response.buyDepth,
        };
    }

    /**
     * Parses active market orders from the response.
     * @param {string | any} response - The raw active market orders response.
     * @returns {object[]} An array of parsed active market orders.
     */
    parseActiveMarketOrder (response: string | any) {
        const parsedOrders = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            let sideValue = 1;
            if (order.side !== 1) {
                sideValue = 2;
            }
            const parsedOrder = {
                'id': order.id,
                'timestamp': order.timestamp,
                'createdTimestamp': order.createdTimestamp,
                'side': sideValue,
                'amount': order.amount,
                'price': order.price,
                'fee': order.fee,
                'market': {
                    'base': {
                        'id': order.market.base.id,
                        'name': order.market.base.name,
                        'priceDecimals': order.market.base.priceDecimals,
                        'isPausable': order.market.base.isPausable,
                        'depositsDisabled': order.market.base.depositsDisabled,
                        'withdrawalsDisabled': order.market.base.withdrawalsDisabled,
                        'tradesDisabled': order.market.base.tradesDisabled,
                        'type': order.market.base.type,
                        'deploymentStatus': order.market.base.deploymentStatus,
                        'blocked': order.market.base.blocked,
                        'quiet': order.market.base.quiet,
                        'availableContentReward': order.market.base.availableContentReward,
                        'bondingCurveType': order.market.base.bondingCurveType,
                    },
                },
                'quote': {
                    'id': order.market.quote.id,
                    'name': order.market.quote.name,
                    'symbol': order.market.quote.symbol,
                },
            };
            parsedOrders.push (parsedOrder);
        }
        return parsedOrders;
    }

    /**
     * Parses finished market orders from the response.
     * @param {string | any} response - The raw finished market orders response.
     * @returns {object[]} An array of parsed finished market orders.
     */
    parseFinishedMarketOrder (response: string | any) {
        const parsedOrders = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            let sideValue = 1;
            if (order.side !== 1) {
                sideValue = 2;
            }
            const parsedOrder = {
                'id': order.id,
                'timestamp': order.timestamp,
                'createdTimestamp': order.createdTimestamp,
                'side': sideValue,
                'amount': order.amount,
                'price': order.price,
                'fee': order.fee,
                'market': {
                    'base': {
                        'id': order.market.base.id,
                        'name': order.market.base.name,
                        'priceDecimals': order.market.base.priceDecimals,
                        'isPausable': order.market.base.isPausable,
                        'depositsDisabled': order.market.base.depositsDisabled,
                        'withdrawalsDisabled': order.market.base.withdrawalsDisabled,
                        'tradesDisabled': order.market.base.tradesDisabled,
                        'type': order.market.base.type,
                        'deploymentStatus': order.market.base.deploymentStatus,
                        'blocked': order.market.base.blocked,
                        'quiet': order.market.base.quiet,
                        'availableContentReward': order.market.base.availableContentReward,
                        'bondingCurveType': order.market.base.bondingCurveType,
                    },
                },
                'quote': {
                    'id': order.market.quote.id,
                    'name': order.market.quote.name,
                    'symbol': order.market.quote.symbol,
                },
            };
            parsedOrders.push (parsedOrder);
        }
        return parsedOrders;
    }

    /**
     * Parses active user orders from the response.
     * @param {string | any} response - The raw active user orders response.
     * @returns {object[]} An array of parsed active user orders.
     */
    parseActiveUserOrders (response: string | any) {
        const parsedOrders = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            let sideValue = 1;
            if (order.side !== 1) {
                sideValue = 2;
            }
            const parsedOrder = {
                'id': order.id,
                'timestamp': order.timestamp,
                'createdTimestamp': order.createdTimestamp,
                'side': sideValue,
                'amount': order.amount,
                'price': order.price,
                'fee': order.fee,
                'market': {
                    'base': {
                        'id': order.market.base.id,
                        'name': order.market.base.name,
                        'hasTax': order.market.base.hasTax,
                        'isPausable': order.market.base.isPausable,
                        'depositsDisabled': order.market.base.depositsDisabled,
                        'withdrawalsDisabled': order.market.base.withdrawalsDisabled,
                        'tradesDisabled': order.market.base.tradesDisabled,
                        'type': order.market.base.type,
                        'bondingCurvePool': order.market.base.bondingCurvePool,
                        'symbol': order.market.base.symbol,
                        'deploymentStatus': order.market.base.deploymentStatus,
                        'blocked': order.market.base.blocked,
                        'quiet': order.market.base.quiet,
                        'availableContentReward': order.market.base.availableContentReward,
                        'priceDecimals': order.market.base.priceDecimals,
                        'bondingCurveType': order.market.base.bondingCurveType,
                        'network': [
                            order.market.base.symbol,
                            order.market.quote,
                        ],
                    },
                },
                'quote': {
                    'id': order.market.quote.id,
                    'name': order.market.quote.name,
                    'symbol': order.market.quote.symbol,
                },
            };
            parsedOrders.push (parsedOrder);
        }
        return parsedOrders;
    }

    /**
     * Parses finished user orders from the response.
     * @param {string | any} response - The raw finished user orders response.
     * @returns {object[]} An array of parsed finished user orders.
     */
    parseFinishedUserOrders (response: string | any) {
        const parsedOrders = [];
        for (let i = 0; i < response.length; i++) {
            const order = response[i];
            let sideValue = 1;
            if (order.side !== 1) {
                sideValue = 2;
            }
            const parsedOrder = {
                'dealOrderId': order.dealOrderId,
                'orderId': order.orderId,
                'id': order.id,
                'timestamp': order.timestamp,
                'createdTimestamp': order.createdTimestamp,
                'side': sideValue,
                'amount': order.amount,
                'price': order.price,
                'fee': order.fee,
                'market': {
                    'base': {
                        'id': order.market.base.id,
                        'name': order.market.base.name,
                        'hasTax': order.market.base.hasTax,
                        'isPausable': order.market.base.isPausable,
                        'depositsDisabled': order.market.base.depositsDisabled,
                        'withdrawalsDisabled': order.market.base.withdrawalsDisabled,
                        'tradesDisabled': order.market.base.tradesDisabled,
                        'type': order.market.base.type,
                        'bondingCurvePool': order.market.base.bondingCurvePool,
                        'symbol': order.market.base.symbol,
                        'deploymentStatus': order.market.base.deploymentStatus,
                        'blocked': order.market.base.blocked,
                        'quiet': order.market.base.quiet,
                        'availableContentReward': order.market.base.availableContentReward,
                        'priceDecimals': order.market.base.priceDecimals,
                        'bondingCurveType': order.market.base.bondingCurveType,
                        'network': [
                            order.market.base.symbol,
                            order.market.quote,
                        ],
                    },
                },
                'quote': {
                    'id': order.market.quote.id,
                    'name': order.market.quote.name,
                    'symbol': order.market.quote.symbol,
                },
            };
            parsedOrders.push (parsedOrder);
        }
        return parsedOrders;
    }

    /**
     * Parses a user order.
     * @param {Dict} order - The raw order data.
     * @param {Market} [market] - The market object.
     * @returns {Order} The parsed order.
     */
    parseUserOrder (order: Dict, market: Market = undefined): Order {
        const timestamp = this.safeInteger (order, 'timestamp');
        const marketId = this.safeString (order, 'pair');
        market = this.safeMarket (marketId, market);
        return this.safeOrder ({
            'info': order,
            'id': this.safeString (order, 'orderId'),
            'timestamp': timestamp,
            'datetime': this.iso8601 (timestamp),
            'symbol': market['symbol'],
            'type': this.safeString (order, 'type'),
            'side': this.safeString (order, 'side'),
            'price': this.safeString (order, 'price'),
            'amount': this.safeString (order, 'amount'),
            'filled': this.safeString (order, 'filled_amount'),
            'remaining': this.safeString (order, 'remaining_amount'),
            'status': this.safeString (order, 'status'),
            'fee': {
                'currency': market['quote'],
                'cost': this.safeString (order, 'fee'),
            },
        }, market);
    }

    /**
     * Parses completed orders from the response.
     * @param {any} response - The raw completed trades response.
     * @param {string} symbol - The market symbol.
     * @returns {object[]} An array of parsed trade objects.
     */
    parseCompletedOrder (response: any, symbol: string) {
        const result = [];
        for (let i = 0; i < response.length; i++) {
            const trade = response[i];
            result.push ({
                'id': this.safeString (trade, 'trade_id'),
                'symbol': symbol,
                'price': parseFloat (this.safeString (trade, 'price')),
                'amount': parseFloat (this.safeString (trade, 'base_volume')),
                'cost': parseFloat (this.safeString (trade, 'quote_volume')),
                'timestamp': this.safeInteger (trade, 'timestamp'),
                'datetime': this.iso8601 (this.safeInteger (trade, 'timestamp')),
                'side': this.safeString (trade, 'type'),
            });
        }
        return result;
    }

    /**
     * Initiates a withdrawal request.
     * @param {string} code - The currency code.
     * @param {number} amount - The amount to withdraw.
     * @param {string} address - The recipient's blockchain address.
     * @param {string} network - The blockchain network.
     * @param {string|undefined} [tag] - Optional tag/memo.
     * @param {object} params - Additional parameters for the withdrawal.
     * @returns {Promise<Transaction>} The transaction object.
     */
    async withdraw (code: string, amount: number, address: string, network: string, tag = undefined, params = {}): Promise<Transaction> {
        try {
            [ tag, params ] = this.handleWithdrawTagAndParams (tag, params);
            this.checkAddress (address);
            await this.loadMarkets ();
            const request: Dict = {
                'currency': code,
                'amount': amount,
                'address': address,
                'network': network,
            };
            if (tag !== undefined) {
                throw new ExchangeError (this.id + ' withdraw() does not support the tag argument yet due to a lack of docs on withdrawing on behalf of the exchange.');
            }
            const response = await this.privatePostUserWalletWithdraw (this.extend (request, params));
            return {
                'info': response,
                'id': undefined,
                'txid': undefined,
                'type': undefined,
                'currency': undefined,
                'network': undefined,
                'amount': undefined,
                'status': undefined,
                'timestamp': undefined,
                'datetime': undefined,
                'address': undefined,
                'addressFrom': undefined,
                'addressTo': undefined,
                'tag': undefined,
                'tagFrom': undefined,
                'tagTo': undefined,
                'updated': undefined,
                'comment': undefined,
                'fee': {
                    'currency': undefined,
                    'cost': undefined,
                    'rate': undefined,
                },
            } as Transaction;
        } catch (error: any) {
            if (error.message.indexOf ('Minimum withdrawal amount is') !== -1) {
                throw new ExchangeError ('Withdrawal failed: ' + error.message + ' - Please increase your withdrawal amount.');
            }
            throw new ExchangeError ('Withdrawal failed: ' + error.message);
        }
    }

    /**
     * Signs a request.
     * @param {string} path - The API endpoint path.
     * @param {string} [api] - The API type.
     * @param {string} [method] - The HTTP method.
     * @param {object} params - Request parameters.
     * @param {object|undefined} headers - Request headers.
     * @param {any} body - Request body.
     * @returns {object} An object containing URL, method, body, and headers.
     */
    sign (path: string, api = 'public', method = 'GET', params = {}, headers = undefined, body = undefined) {
        let url = this.urls['api'][api] + '/' + this.implodeParams (path, params);
        const query = this.omit (params, this.extractParams (path));
        headers = {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        };
        if (Object.keys (params).length) {
            url += '?' + this.urlencode (query);
        }
        if (api === 'private') {
            this.checkRequiredCredentials ();
            if (method === 'GET') {
                headers['X-API-ID'] = this.apiKey;
                headers['X-API-KEY'] = this.secret;
            } else {
                const nonce = this.nonce ();
                body = this.urlencode (this.extend ({
                    'nonce': nonce,
                    'method': path,
                }, query));
                const signature = this.hmac (this.encode (body), this.encode (this.secret), sha512);
                headers = {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'X-API-ID': this.apiKey,
                    'X-API-KEY': this.secret,
                    'Sign': signature,
                };
            }
        }
        return { 'url': url, 'method': method, 'body': body, 'headers': headers };
    }

    /**
     * Handles API errors.
     * @param {Int} httpCode - The HTTP status code.
     * @param {string} reason - The HTTP status reason.
     * @param {string} url - The request URL.
     * @param {string} method - The HTTP method.
     * @param {Dict} headers - The request headers.
     * @param {string} body - The response body.
     * @param {Dictionary<any>} response - The parsed response.
     * @param {any} requestHeaders - The request headers.
     * @param {any} requestBody - The request body.
     * @returns {undefined}
     */
    handleErrors (httpCode: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: Dictionary<any>, requestHeaders: any, requestBody: any) {
        if (!response) {
            throw new Error ('Empty response from server (' + httpCode + ' ' + reason + ')');
        }
        if (httpCode >= 400) {
            throw new Error ('Http Error: ' + httpCode + ' ' + reason);
        }
        if (response === undefined) {
            return undefined;
        }
        const error = this.safeValue (response, 'error');
        if (error !== undefined) {
            const errorCode = this.safeString (error, 'code');
            const message = this.safeString (error, 'message');
            const feedback = this.id + ' ' + message;
            this.throwExactlyMatchedException (this.exceptions, errorCode, feedback);
            this.throwBroadlyMatchedException (this.exceptions, message, feedback);
            throw new ExchangeError (feedback);
        }
        return undefined;
    }
}
