import { Client } from './client';
import { Region, Locale } from './collections';

export enum AssetType {
  Stock = 'stock',
  Forex = 'forex',
  Index = 'index',
  Etf = 'etf',
  Commodity = 'commodity',
}

export enum AssetClass {
  Equity = 'equity',
  Crypto = 'crypto',
}

export enum HistoricalPricePeriod {
  OneDay = '1D',
  OneWeek = '1W',
  OneMonth = '1M',
  ThreeMonth = '3M',
  OneYear = '1Y',
  TwoYear = '2Y',
  ThreeYear = '3Y',
  FiveYear = '5Y',
}

export interface Stock {
  id: string;
  assetType: AssetType;
  name: string;
  symbol: string;
  sectorId: string;
  industryId: string;
  updatedDate: string;
  dailyChange?: number;
}

export interface LocaleString {
  [key: string]: string;
}

export interface StockDetail {
  id: string;
  assetType: AssetType;
  assetClass: AssetClass;
  name: string;
  symbol: string;
  description: string;
  localized_description: LocaleString;
  region: string;
  sectorId: string;
  industryId: string;
  updatedDate: string;
}

export interface PriceDataPoint {
  d: number;
  c: number;
  h: number;
  l: number;
  o: number;
}

export interface StockPriceGraph {
  symbol: string;
  '1D': PriceDataPoint[];
  '1W': PriceDataPoint[];
  '1M': PriceDataPoint[];
  '3M': PriceDataPoint[];
  '1Y': PriceDataPoint[];
  '2Y': PriceDataPoint[];
  '3Y': PriceDataPoint[];
  '5Y': PriceDataPoint[];
}

export class StockClient extends Client {
  async getAllStocks(region: Region): Promise<Stock[]> {
    return this.sendRequest<Stock[]>({
      method: 'GET',
      url: '/api/v1/stock/all',
      params: { region },
    });
  }

  async getStockDetailById(id: string, locale: Locale): Promise<StockDetail> {
    return this.sendRequest<StockDetail>({
      method: 'GET',
      url: `/api/v1/stock/${id}`,
      params: { locale },
    });
  }

  async getStockDetailBySymbol(symbol: string, assetClass: AssetClass, region: Region, locale: Locale): Promise<StockDetail> {
    return this.sendRequest<StockDetail>({
      method: 'GET',
      url: '/api/v1/stock/detail',
      params: { symbol, asset_class: assetClass, region, locale },
    });
  }

  async getHistoricalPrices(symbols: string[], region: Region, keys: HistoricalPricePeriod[]): Promise<StockPriceGraph[]> {
    return this.sendRequest<StockPriceGraph[]>({
      method: 'GET',
      url: '/api/v1/stock/price',
      params: {
        symbols: symbols.join(','),
        region,
        keys: keys.join(','),
      },
    });
  }
}