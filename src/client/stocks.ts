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

export enum HistoricalPriceInterval {
  OneMinute = "1m",
  ThreeMinute = "3m",
  FiveMinute = "5m",
  FifteenMinute = "15m",
  ThirtyMinute = "30m",
  OneHour = "1h",
  TwoHour = "2h",
  OneDay = "1d",
  FiveDay = "5d",
  SevenDay = "7d",
  ThirtyDay = "30d",
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
  active: boolean;
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
  shortDescription: string;
  localizedShortDescription: LocaleString;
  region: string;
  sectorId: string;
  industryId: string;
  updatedDate: string;
  active: boolean;
  markets: Market[];
}

export enum Market {
  Yildiz = "YILDIZ",
  Ana = "ANA",
  Alt = "ALT",
  YakinIzleme = "YAKIN_IZLEME",
  POIP = "POIP",
  Fon = "FON",
  Girisim = "GIRISIM",
  Emtia = "EMTIA",
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

export interface StockRestriction {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
}

export interface TickRule {
  basePrice: number;
  additionalPrice: number;
  lowerPriceLimit: number;
  upperPriceLimit: number;
  rules: TickSizeRule[];
}

export interface TickSizeRule {
  priceFrom: number;
  priceTo: number;
  tickSize: number;
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

  async getCustomHistoricalPrices(stock: string, region: Region, fromDate: string, toDate: string, interval: HistoricalPriceInterval, detail: boolean): Promise<PriceDataPoint[]> {
    this.validateCustomHistoricalPriceDate(fromDate);
    this.validateCustomHistoricalPriceDate(toDate);

    return this.sendRequest<PriceDataPoint[]>({
      method: 'GET',
      url: '/api/v1/stock/price/interval',
      params: { stock, region, fromDate, toDate, interval, detail },
    });
  }

  async validateCustomHistoricalPriceDate(date: string) {
    const pattern =  /^\d{4}-\d{2}-\d{2}( \d{2}:\d{2}:\d{2})?$/;
    const matched = date.match(pattern);
    if (!matched) {
      throw new Error("Invalid date format, allowed formats: YYYY-MM-DD, YYYY-MM-DD HH:MM:SS");
    }
  }

  async getStockRestrictions(symbol: string, region: Region): Promise<StockRestriction[]> {
    return this.sendRequest<StockRestriction[]>({
      method: 'GET',
      url: '/api/v1/stock/restrictions',
      params: { symbol, region },
    });
  }

  async getTickRules(symbol: string, region: Region): Promise<TickRule> {
    return this.sendRequest<TickRule>({
      method: 'GET',
      url: '/api/v1/stock/rules',
      params: { symbol, region },
    });
  }
}
