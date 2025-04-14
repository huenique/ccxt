import { implicitReturnType } from '../base/types.js';
import { Exchange as _Exchange } from '../base/Exchange.js';
interface Exchange {
    publicGetOrderbookBaseQuote(params?: {}): Promise<implicitReturnType>;
    publicGetSummary(params?: {}): Promise<implicitReturnType>;
    publicGetTicker(params?: {}): Promise<implicitReturnType>;
    publicGetTradesMarketPair(params?: {}): Promise<implicitReturnType>;
    privateGetCurrencies(params?: {}): Promise<implicitReturnType>;
    privateGetCurrenciesName(params?: {}): Promise<implicitReturnType>;
    privateGetMarketsBaseQuote(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersActive(params?: {}): Promise<implicitReturnType>;
    privateGetOrdersFinished(params?: {}): Promise<implicitReturnType>;
    privateGetUserOrdersActive(params?: {}): Promise<implicitReturnType>;
    privateGetUserOrdersFinished(params?: {}): Promise<implicitReturnType>;
    privateGetUserWalletAddresses(params?: {}): Promise<implicitReturnType>;
    privateGetUserWalletBalances(params?: {}): Promise<implicitReturnType>;
    privateGetUserWalletHistory(params?: {}): Promise<implicitReturnType>;
    privatePostUserOrders(params?: {}): Promise<implicitReturnType>;
    privatePostUserWalletWithdraw(params?: {}): Promise<implicitReturnType>;
    privateDeleteUserOrdersId(params?: {}): Promise<implicitReturnType>;
}
declare abstract class Exchange extends _Exchange {
}
export default Exchange;
