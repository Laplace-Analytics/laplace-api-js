import { Client } from './client';
import { Region } from './collections';
import { Currency } from './financial_ratios';
import { AssetClass, AssetType } from './stocks';

export interface StockDividend {
  date: string;
  currency: Currency;
  netAmount: number;
  netRatio: number;
  grossAmount: number;
  grossRatio: number;
  priceThen: number;
  stoppageRatio: number;
  stoppageAmount: number;
}

export interface StockStats {
  ytdReturn: number;
  yearlyReturn: number;
  "3YearReturn": number;
  "5YearReturn": number;
  "3MonthReturn": number;
  monthlyReturn: number;
  weeklyReturn: number;
  symbol: string;
  dailyChange: number;
  previousClose?: number;
  marketCap?: number;
  peRatio?: number;
  pbRatio?: number;
  yearLow?: number;
  yearHigh?: number;
  latestPrice?: number;
  dayHigh?: number;
  dayLow?: number;
  dayOpen?: number;
  eps?: number;
  lowerPriceLimit?: number;
  upperPriceLimit?: number;
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
  assetClass?: AssetClass;
  assetType?: AssetType;
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
    return this.sendRequest<StockDividend[]>({
      method: 'GET',
      url: "/api/v2/stock/dividends",
      params: { symbol, region }
    });
  }

  async getStockStats(symbols: string[], region: Region): Promise<StockStats[]> {
    return this.sendRequest<StockStats[]>({
      method: 'GET',
      url: '/api/v2/stock/stats',
      params: {
        symbols: symbols.join(','),
        region,
      },
    });
  }

  async getTopMovers(region: Region, pageSize: number, direction: TopMoverDirection, page?: number, assetType?: AssetType,
    assetClass?: AssetClass
  ): Promise<TopMover[]> {
    return this.sendRequest<TopMover[]>({
      method: 'GET',
      url: '/api/v2/stock/top-movers',
      params: {
        region,
        pageSize,
        direction,
        ...(assetType != null && { assetType }),
        ...(assetClass != null && { assetClass }),
        ...(page != null && { page }),
      },
    });
  }
}