import { Client } from './client';
import { Region } from './collections';
import { AssetClass, AssetType } from './stocks';

export interface StockDividend {
  date: string;
  netAmount: number;
  netRatio: number;
  grossAmount: number;
  grossRatio: number;
  priceThen: number;
  stoppageRatio: number;
  stoppageAmount: number;
}

export interface StockStats {
  previousClose?: number;
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  yearLow?: number;
  yearHigh?: number;
  weeklyReturn?: number;
  monthlyReturn?: number;
  "3MonthReturn"?: number;
  ytdReturn?: number;
  yearlyReturn?: number;
  "3YearReturn"?: number;
  "5YearReturn"?: number;
  symbol: string;
  latestPrice?: number;
  dailyChange?: number;
  dayLow?: number;
  dayHigh?: number;
  lowerPriceLimit?: number;
  upperPriceLimit?: number;
  dayOpen?: number;
  eps?: number;
}

export enum StockStatsKey {
  PreviousClose = 'previous_close',
  MarketCap = 'market_cap',
  FK = 'fk',
  PDDD = 'pddd',
  DayLow = 'day_low',
  DayHigh = 'day_high',
  YearLow = 'year_low',
  YearHigh = 'year_high',
  DailyChange = 'daily_change',
  WeeklyReturn = 'weekly_return',
  MonthlyReturn = 'monthly_return',
  ThreeMonthReturn = '3_month_return',
  YtdReturn = 'ytd_return',
  YearlyReturn = 'yearly_return',
  ThreeYearReturn = '3_year_return',
  FiveYearReturn = '5_year_return',
  LatestPrice = 'latest_price'
}

export interface TopMover {
  symbol: string;
  change: number;
  assetClass: AssetClass;
  assetType: AssetType
}

export enum TopMoverDirection {
  Gainers = "gainers",
  Losers = "losers"
}

export class FinancialFundamentalsClient extends Client {
  async getStockDividends(
    symbol: string,
    region: Region
  ): Promise<StockDividend[]> {
    const url = new URL(`${this["baseUrl"]}/api/v2/stock/dividends`);
    url.searchParams.append("symbol", symbol);
    url.searchParams.append("region", region);

    return this.sendRequest<StockDividend[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getStockStats(symbols: string[], region: Region): Promise<StockStats[]> {
    const url = new URL(`${this['baseUrl']}/api/v2/stock/stats`);
    url.searchParams.append('symbols', symbols.join(','));
    url.searchParams.append('region', region);

    return this.sendRequest<StockStats[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getTopMovers(region: Region, page: number, pageSize: number, direction: TopMoverDirection, assetType?: AssetType): Promise<TopMover[]> {
    const url = new URL(`${this['baseUrl']}/api/v2/stock/top-movers`);
    url.searchParams.append('region', region);
    url.searchParams.append('page', page.toString());
    url.searchParams.append('pageSize', pageSize.toString());
    url.searchParams.append('direction', direction);
    if (assetType) url.searchParams.append('assetType', assetType);

    return this.sendRequest<TopMover[]>({
      method: 'GET',
      url: url.toString(),
    });
  }
}