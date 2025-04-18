import { Client } from './client';
import { Region, Locale } from './collections';

export interface StockSectorFinancialRatioComparison {
  metric_name: string;
  normalizedValue: number;
  details: StockSectorFinancialRatioComparisonDetail[];
}

export interface StockSectorFinancialRatioComparisonDetail {
  slug: string;
  value: number;
  sectorAverage: number;
}

export interface StockHistoricalRatios {
  symbol: string;
  data: StockHistoricalRatiosData[];
  formatting: Record<string, StockHistoricalRatiosFormatting>;
}

export interface StockHistoricalRatiosV2 {
  slug: string;
  finalValue: number;
  threeYearGrowth: number;
  yearGrowth: number;
  finalSectorValue: number;
  currency: Currency;
  format: HistoricalRatiosFormat;
  name: string;
  items: StockHistoricalRatiosDataV2[]
}

export interface StockHistoricalRatiosData {
  fiscalYear: number;
  fiscalQuarter: number;
  values: Record<string, StockHistoricalRatiosValue>;
}

export interface StockHistoricalRatiosDataV2 {
  period: string;
  value: number;
  sectorMean: number;
}

export interface StockHistoricalRatiosValue {
  value: number;
  sectorAverage: number;
}

export interface StockHistoricalRatiosFormatting {
  name: string;
  slug: string;
  precision: number;
  multiplier: number;
  suffix: string;
  prefix: string;
  interval: string;
  description: string;
}

export enum HistoricalRatiosFormat {
  CURRENCY = "currency",
  PERCENTAGE = "percentage",
  DECIMAL = "decimal"
}

export enum HistoricalRatiosKey {
  PriceToEarningsRatio = 'pe-ratio',
  ReturnOnEquity = 'roe',
  ReturnOnAssets = 'roa',
  ReturnOnCapital = 'roic',
}

export interface StockHistoricalRatiosDescription {
  slug: string;
  name: string;
  suffix: string;
  prefix: string;
  display: boolean;
  precision: number;
  multiplier: number;
  description: string;
  interval: string;
}

export interface HistoricalFinancialSheets {
  sheets: HistoricalFinancialSheet[];
}

export interface HistoricalFinancialSheet {
  period: string;
  rows: HistoricalFinancialSheetRow[];
}

export interface HistoricalFinancialSheetRow {
  description: string;
  value: number;
  lineCodeId: number;
  indentLevel: number;
  firstAncestorLineCodeId: number;
  sectionLineCodeId: number;
}

export enum FinancialSheetType {
  IncomeStatement = 'incomeStatement',
  BalanceSheet = 'balanceSheet',
  CashFlow = 'cashFlowStatement',
}

export enum FinancialSheetPeriod {
  Annual = 'annual',
  Quarterly = 'quarterly',
  Cumulative = 'cumulative',
}

export enum Currency {
  USD = 'USD',
  TRY = 'TRY',
  EUR = 'EUR',
}

export interface FinancialSheetDate {
  day: number;
  month: number;
  year: number;
}

export class FinancialClient extends Client  {
  async getFinancialRatioComparison(symbol: string, region: Region): Promise<StockSectorFinancialRatioComparison[]> {
    const url = new URL(`${this['baseUrl']}/api/v1/stock/financial-ratio-comparison`);
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('region', region);

    return this.sendRequest<StockSectorFinancialRatioComparison[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getHistoricalRatios(symbol: string, keys: HistoricalRatiosKey[], region: Region): Promise<StockHistoricalRatios> {
    const url = new URL(`${this['baseUrl']}/api/v1/stock/historical-ratios`);
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('region', region);
    url.searchParams.append('slugs', keys.join(','));

    return this.sendRequest<StockHistoricalRatios>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getHistoricalRatiosV2(symbol: string, keys: HistoricalRatiosKey[], region: Region): Promise<StockHistoricalRatiosV2[]> {
    const url = new URL(`${this['baseUrl']}/api/v2/stock/historical-ratios`);
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('region', region);
    url.searchParams.append('slugs', keys.join(','));

    return this.sendRequest<StockHistoricalRatiosV2[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getHistoricalRatiosDescriptions(locale: Locale, region: Region): Promise<StockHistoricalRatiosDescription[]> {
    const url = new URL(`${this['baseUrl']}/api/v1/stock/historical-ratios/descriptions`);
    url.searchParams.append('locale', locale);
    url.searchParams.append('region', region);

    return this.sendRequest<StockHistoricalRatiosDescription[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getHistoricalFinancialSheets(
    symbol: string,
    from: FinancialSheetDate,
    to: FinancialSheetDate,
    sheetType: FinancialSheetType,
    period: FinancialSheetPeriod,
    currency: Currency,
    region: Region
  ): Promise<HistoricalFinancialSheets> {
    const url = new URL(`${this['baseUrl']}/api/v1/stock/historical-financial-sheets`);
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('from', `${from.year.toString().padStart(4, '0')}-${from.month.toString().padStart(2, '0')}-${from.day.toString().padStart(2, '0')}`);
    url.searchParams.append('to', `${to.year.toString().padStart(4, '0')}-${to.month.toString().padStart(2, '0')}-${to.day.toString().padStart(2, '0')}`);
    url.searchParams.append('sheetType', sheetType);
    url.searchParams.append('periodType', period);
    url.searchParams.append('currency', currency);
    url.searchParams.append('region', region);

    return this.sendRequest<HistoricalFinancialSheets>({
      method: 'GET',
      url: url.toString(),
    });
  }
}