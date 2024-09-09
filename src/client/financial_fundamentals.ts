import { Client } from './client';
import { Region } from './collections';

export interface StockDividend {
  date: Date;
  dividendAmount: number;
  dividendRatio: number;
  netDividendAmount: number;
  netDividendRatio: number;
  priceThen: number;
}

export interface StockStats {
  previousClose: number;
  ytdReturn: number;
  yearlyReturn: number;
  marketCap: number;
  peRatio: number;
  pbRatio: number;
  yearLow: number;
  yearHigh: number;
  threeYear: number;
  fiveYear: number;
  symbol: string;
}

export enum StockStatsKey {
  PreviousClose = 'previous_close',
  YtdReturn = 'ytd_return',
  YearlyReturn = 'yearly_return',
  MarketCap = 'market_cap',
  FK = 'fk',
  PDDD = 'pddd',
  YearLow = 'year_low',
  YearHigh = 'year_high',
  ThreeYearReturn = '3_year_return',
  FiveYearReturn = '5_year_return',
  LatestPrice = 'latest_price'
}

export interface TopMover {
  symbol: string;
  percentChange: number;
}

export class FinancialFundamentalsClient {
  constructor(private client: Client) {}

  async getStockDividends(symbol: string, region: Region): Promise<StockDividend[]> {
    const url = new URL(`${this.client['baseUrl']}/api/v1/stock/dividends`);
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('region', region);

    return this.client.sendRequest<StockDividend[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getStockStats(symbols: string[], keys: StockStatsKey[], region: Region): Promise<StockStats[]> {
    const url = new URL(`${this.client['baseUrl']}/api/v1/stock/stats`);
    url.searchParams.append('symbols', symbols.join(','));
    url.searchParams.append('region', region);
    url.searchParams.append('keys', keys.join(','));

    return this.client.sendRequest<StockStats[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getTopMovers(region: Region): Promise<TopMover[]> {
    const url = new URL(`${this.client['baseUrl']}/api/v1/stock/top-movers`);
    url.searchParams.append('region', region);

    return this.client.sendRequest<TopMover[]>({
      method: 'GET',
      url: url.toString(),
    });
  }
}