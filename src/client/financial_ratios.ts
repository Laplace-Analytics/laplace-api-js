import { Client } from './client';
import { Region, Locale } from './collections';

export enum RatioComparisonPeerType {
  Industry = 'industry',
  Sector = 'sector'
}

export interface StockPeerFinancialRatioComparison {
  metricName: string;
  normalizedValue: number;
  data: StockPeerFinancialRatioComparisonData[];
}

export interface StockPeerFinancialRatioComparisonData {
  slug: string;
  value: number;
  average: number;
}

export interface StockHistoricalRatios {
  slug: string;
  finalValue: number;
  threeYearGrowth: number;
  yearGrowth: number;
  finalSectorValue: number;
  currency: Currency;
  format: HistoricalRatiosFormat;
  name: string;
  items: StockHistoricalRatiosData[];
}

export interface StockHistoricalRatiosData {
  period: string;
  value: number;
  sectorMean: number;
}

export enum HistoricalRatiosFormat {
  CURRENCY = 'currency',
  PERCENTAGE = 'percentage',
  DECIMAL = 'decimal',
}

export enum HistoricalRatiosKey {
  Revenue = 'satislar',
  EBITDA = 'ebitda',
  NetProfit = 'net_kar',
  GrossMargin = 'gross-margin',
  NetMargin = 'net-margin',
  ReturnOnAssets = 'roa',
  ReturnOnEquity = 'roe',
  ReturnOnCapitalEmployed = 'roce',
  ReturnOnInvestedCapital = 'roic',
  PriceToEarningsRatio = 'pe-ratio',
  PriceToEarnings = 'poe',
  PriceToBookRatio = 'pb-ratio',
  EnterpriseValueToEBITDA = 'ev-to-ebitda',
  EnterpriseValueToInvestedCapital = 'evic',
  InterestCoverage = 'interestCoverage',
  QuickRatio = 'quick-ratio',
  LeverageRatio = 'leverage-ratio',
  DebtToEquity = 'debt-to-equity',
  RevenueGrowth = 'satis_buyumesi',
  EBITDAGrowth = 'favok_buyumesi',
  NetProfitGrowth = 'net_kar_buyumesi',
  FreeCashFlowGrowth = 'serbest_nakit_akisi_buyumesi',
  CashConversionCycle = 'cash-conversion-cycle',
  DaysSalesOutstanding = 'days-sales-outstanding',
  DaysPayable = 'days-payable',
  DaysInventory = 'days-inventory',

  EBITDAMargin = 'favok_marji',
  InventoryTurnover = 'inventory-turnover',
  DepositGrowth = 'mevduat_buyumesi',
  NetInterestMargin = 'net_faiz_marji',
  CompensationGrowth = 'gerceklesen_tazminatlar_buyumesi',
  PremiumPerCompensation = 'prim_basina_tazminat_orani',
  EnterpriseValueToOperatingCashFlow = 'evOcf',
  EarningsBeforeTax = 'ebt',
  CapitalExpenditure = 'capex',
  FinancialInvestments = 'financial_investments',
  RealtimeEarningsPerShare = 'realtime_eps-basic',
  RealtimeMarketValue = 'realtime_piyasa_degeri',
  RealtimePriceToBookRatio = 'realtime_pb-ratio',
  RealtimePriceToEarningsRatio = 'realtime_pe-ratio',
  CurrentRatio = 'current-ratio',
  AssetTurnover = 'asset-turnover',
  TotalOperationalExpense = 'total_operational_expense',
  TotalOperationalExpenseToGrossProfit = 'total_operational_expense_gross_profit_ratio',
  CashAndCashEquivalents = 'cash_and_cash_equivalents',
  CashToAssets = 'cash_to_assets',
  CapexToNetProfit = 'capex_to_net_profit',
  RealtimeEnterpriseValueToEBITDA = 'realtime_ev-to-ebitda',
  ReceivablesTurnover = 'alacak_devir_hizi',
  EarningsPerShare = 'eps-basic',
  CreditToAssetRatio = 'kredi_aktif_orani',
  CreditToDepositRatio = 'kredi_mevduat_orani',
  TechnicalProfitGrowth = 'teknik_kar_buyumesi',
  NetEarnedPremiumGrowth = 'net_kazanilan_prim_buyumesi',
  EBITGrowth = 'ebitGrowth',
  CashReturnOnInvestedCapital = 'croic',
  MarketCapitalization = 'piyasa_degeri',
  ShortTermToLongTermObligations = 'short_term_obligations_long_term_obligations',
  RetainedEarnings = 'retained_earnings',
  ThreeYearCAGRFreeCashFlow = 'three_year_cagr_free_cash_flow',
  LongTermLoansToPeriodicProfitRatio = 'long_term_loans_period_profit_ratio',
  LongTermLoans = 'long_term_loans',
  CommercialReceivablesToTotalCurrentAssets = 'commercial_receivables_total_current_assets',
  StockGrowth = 'stock_growth',
  FiveYearRetainedEarningsChange = 'five_year_retained_earnings_change',
  ThreeYearCAGRRetainedEarnings = 'three_year_cagr_retained_earnings',
  PotentialOperatingCashFlow = 'pocf',
  FreeCashFlowToEnterpriseValue = 'fcfEv',
  DebtToDeposit = 'dd',
  NetDebt = 'net_borc',
  PaidCapital = 'odenmis_sermaye',
  FinancialExpensesToEBIT = 'financial_expenses_ebit_ratio'
}

export interface StockHistoricalRatiosDescription {
  id: number;
  format: string;
  currency: string;
  slug: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description: string;
  locale: string;
  isRealtime: boolean;
}

export interface HistoricalFinancialSheets {
  sheets: HistoricalFinancialSheet[];
}

export interface HistoricalFinancialSheet {
  period: string;
  items: HistoricalFinancialSheetRow[];
}

export interface HistoricalFinancialSheetRow {
  description: string;
  value: number;
  lineCodeId: number;
  indentLevel: number;
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

export class FinancialClient extends Client {
  async getFinancialRatioComparison(
    symbol: string,
    region: Region,
    peerType: RatioComparisonPeerType
  ): Promise<StockPeerFinancialRatioComparison[]> {
    const url = new URL(
      `${this['baseUrl']}/api/v2/stock/financial-ratio-comparison`
    );
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('region', region);
    url.searchParams.append('peerType', peerType);

    return this.sendRequest<StockPeerFinancialRatioComparison[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getHistoricalRatios(
    symbol: string,
    keys: HistoricalRatiosKey[],
    region: Region,
    locale: Locale
  ): Promise<StockHistoricalRatios[]> {
    const url = new URL(`${this['baseUrl']}/api/v2/stock/historical-ratios`);
    url.searchParams.append('symbol', symbol);
    url.searchParams.append('region', region);
    url.searchParams.append('locale', locale);
    url.searchParams.append('slugs', keys.join(','));

    return this.sendRequest<StockHistoricalRatios[]>({
      method: 'GET',
      url: url.toString(),
    });
  }

  async getHistoricalRatiosDescriptions(
    locale: Locale,
    region: Region
  ): Promise<StockHistoricalRatiosDescription[]> {
    const url = new URL(
      `${this['baseUrl']}/api/v2/stock/historical-ratios/descriptions`
    );
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
    const url = new URL(
      `${this['baseUrl']}/api/v2/stock/historical-financial-sheets`
    );
    url.searchParams.append('symbol', symbol);
    url.searchParams.append(
      'from',
      `${from.year.toString().padStart(4, '0')}-${from.month
        .toString()
        .padStart(2, '0')}-${from.day.toString().padStart(2, '0')}`
    );
    url.searchParams.append(
      'to',
      `${to.year.toString().padStart(4, '0')}-${to.month
        .toString()
        .padStart(2, '0')}-${to.day.toString().padStart(2, '0')}`
    );
    url.searchParams.append('sheetType', sheetType);
    url.searchParams.append('periodType', period);
    url.searchParams.append('currency', currency);
    url.searchParams.append('region', region);

    if (
      sheetType === FinancialSheetType.BalanceSheet &&
      period !== FinancialSheetPeriod.Cumulative
    ) {
      throw new Error('balance sheet is only available for cumulative period');
    }

    return this.sendRequest<HistoricalFinancialSheets>({
      method: 'GET',
      url: url.toString(),
    });
  }
}
