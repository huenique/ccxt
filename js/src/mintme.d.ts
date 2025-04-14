import Exchange from './abstract/mintme.js';
import type { Dict, Int, Market, Order, Ticker, Transaction, Dictionary } from './base/types.js';
/**
 * @class mintme
 * @augments Exchange
 */
export default class mintme extends Exchange {
    /**
     * Describes the exchange properties.
     * @returns {object} The exchange description object.
     */
    describe(): any;
    /**
     * Callback for processing each ticker pair object.
     * @param {TickerPairObject} pairObject - The ticker pair object.
     * @param {Ticker[]} tickers - The array to accumulate parsed tickers.
     * @returns {void}
     */
    private parseTickerPairCallback;
    /**
     * Callback for processing each currency item.
     * @param {any} item - The raw currency item.
     * @param {{ [key: string]: any }} currencies - The object to accumulate parsed currencies.
     * @returns {void}
     */
    private parseCurrencyCallback;
    /**
     * Parses ticker pairs from the response.
     * @param {any} response - The raw ticker response.
     * @returns {Ticker[]} An array of ticker objects.
     */
    parseTickerPairs(response: any): Ticker[];
    /**
     * Parses currencies from the response.
     * @param {any} response - The raw currencies response.
     * @returns {object} An object mapping currency symbols to currency details.
     */
    parseCurrencies(response: any): {
        [key: string]: any;
    };
    /**
     * Parses a specific currency response.
     * @param {any} response - The raw currency response.
     * @returns {object|null} The structured currency data or null if not found.
     */
    parseCurrencyName(response: any): {
        id: number;
        name: string;
        priceDecimals: number;
        hasTax: boolean;
        isPausable: boolean;
        depositsDisabled: boolean;
        withdrawalsDisabled: boolean;
        tradesDisabled: boolean;
        type: string;
        bondingCurvePool: string;
        symbol: string;
        deploymentStatus: string;
        blocked: boolean;
        quiet: boolean;
        availableContentReward: boolean;
        bondingCurveType: boolean;
        networks: any[];
    };
    /**
     * Parses market information from the response.
     * @param {any} response - The raw market info response.
     * @returns {object} The structured market info.
     */
    parseMarketInfo(response: any): {
        last: any;
        volume: any;
        open: any;
        close: any;
        high: any;
        low: any;
        deal: any;
        quote: any;
        base: any;
        buyDepth: any;
    };
    /**
     * Parses active market orders from the response.
     * @param {string | any} response - The raw active market orders response.
     * @returns {object[]} An array of parsed active market orders.
     */
    parseActiveMarketOrder(response: string | any): any[];
    /**
     * Parses finished market orders from the response.
     * @param {string | any} response - The raw finished market orders response.
     * @returns {object[]} An array of parsed finished market orders.
     */
    parseFinishedMarketOrder(response: string | any): any[];
    /**
     * Parses active user orders from the response.
     * @param {string | any} response - The raw active user orders response.
     * @returns {object[]} An array of parsed active user orders.
     */
    parseActiveUserOrders(response: string | any): any[];
    /**
     * Parses finished user orders from the response.
     * @param {string | any} response - The raw finished user orders response.
     * @returns {object[]} An array of parsed finished user orders.
     */
    parseFinishedUserOrders(response: string | any): any[];
    /**
     * Parses a user order.
     * @param {Dict} order - The raw order data.
     * @param {Market} [market] - The market object.
     * @returns {Order} The parsed order.
     */
    parseUserOrder(order: Dict, market?: Market): Order;
    /**
     * Parses completed orders from the response.
     * @param {any} response - The raw completed trades response.
     * @param {string} symbol - The market symbol.
     * @returns {object[]} An array of parsed trade objects.
     */
    parseCompletedOrder(response: any, symbol: string): any[];
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
    withdraw(code: string, amount: number, address: string, network: string, tag?: any, params?: {}): Promise<Transaction>;
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
    sign(path: string, api?: string, method?: string, params?: {}, headers?: any, body?: any): {
        url: string;
        method: string;
        body: any;
        headers: any;
    };
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
    handleErrors(httpCode: Int, reason: string, url: string, method: string, headers: Dict, body: string, response: Dictionary<any>, requestHeaders: any, requestBody: any): any;
}
