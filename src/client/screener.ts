import { Client } from "./client";
import { PaginatedResponse } from "./capital_increase";
import { Region } from "./collections";

export enum ScreenerSortBy {
  Symbol = "symbol",
  Price = "price",
  DailyChange = "dailyChange",
  MarketCap = "marketCap",
  PeRatio = "peRatio",
  PbRatio = "pbRatio",
  WeeklyReturn = "weeklyReturn",
  MonthlyReturn = "monthlyReturn",
  ThreeMonthReturn = "threeMonthReturn",
  YearlyReturn = "yearlyReturn",
  ThreeYearReturn = "threeYearReturn",
  FiveYearReturn = "fiveYearReturn",
  YtdReturn = "ytdReturn",
  CompositeRating = "compositeRating",
  CompositeScore = "compositeScore",
  RsRating = "rsRating",
  RsScore = "rsScore",
  PerfQ1 = "perfQ1",
  PerfQ2 = "perfQ2",
  PerfQ3 = "perfQ3",
  PerfQ4 = "perfQ4",
  EpsRating = "epsRating",
  EpsScore = "epsScore",
  EpsGrowthYoy = "epsGrowthYoy",
  EpsGrowthQoq = "epsGrowthQoq",
  EpsTrailing4q = "epsTrailing4q",
  EpsAcceleration = "epsAcceleration",
  AdRating = "adRating",
  AdScore = "adScore",
  UpVolumeRatio = "upVolumeRatio",
  VolumeTrend = "volumeTrend",
  SmrRating = "smrRating",
  SmrScore = "smrScore",
  SalesGrowth2q = "salesGrowth2q",
  GrossMargin = "grossMargin",
  NetMargin = "netMargin",
  Roe = "roe",
  Sma20 = "sma20",
  Sma50 = "sma50",
  Sma150 = "sma150",
  Sma200 = "sma200",
  VolumeSma50 = "volumeSma50",
  PriceVsSma20 = "priceVsSma20",
  PriceVsSma50 = "priceVsSma50",
  PriceVsSma150 = "priceVsSma150",
  PriceVsSma200 = "priceVsSma200",
  High52w = "high52w",
  Low52w = "low52w",
  OffHighPct = "offHighPct",
  VolumeVsAvg50 = "volumeVsAvg50",
  PriceChangePct = "priceChangePct",
  PriceChangeAmount = "priceChangeAmount",
  YtdChangePct = "ytdChangePct",
}

export enum ScreenerSortOrder {
  Asc = "asc",
  Desc = "desc",
}

/** Letter grade used by the SMR and A/D ratings. */
export type ScreenerLetterGrade = "A" | "B" | "C" | "D" | "E";

/**
 * Range filter. Both bounds are optional and inclusive. If both are set,
 * `min` must be <= `max`. Rows whose value is NULL in the underlying column
 * are excluded by any range filter that touches it.
 */
export interface ScreenerRange {
  min?: number;
  max?: number;
}

export interface ScreenerFilters {
  // Price & valuation
  price?: ScreenerRange;
  dailyChange?: ScreenerRange;
  peRatio?: ScreenerRange;
  pbRatio?: ScreenerRange;
  marketCap?: ScreenerRange;

  // Return windows
  weeklyReturn?: ScreenerRange;
  monthlyReturn?: ScreenerRange;
  threeMonthReturn?: ScreenerRange;
  yearlyReturn?: ScreenerRange;
  threeYearReturn?: ScreenerRange;
  fiveYearReturn?: ScreenerRange;
  ytdReturn?: ScreenerRange;

  // Composite rating
  compositeRating?: ScreenerRange;
  compositeScore?: ScreenerRange;

  // Relative strength (RS)
  rsRating?: ScreenerRange;
  rsScore?: ScreenerRange;
  perfQ1?: ScreenerRange;
  perfQ2?: ScreenerRange;
  perfQ3?: ScreenerRange;
  perfQ4?: ScreenerRange;

  // EPS
  epsRating?: ScreenerRange;
  epsScore?: ScreenerRange;
  epsGrowthYoy?: ScreenerRange;
  epsGrowthQoq?: ScreenerRange;
  epsTrailing4q?: ScreenerRange;

  // Accumulation / distribution (A/D)
  adScore?: ScreenerRange;
  upVolumeRatio?: ScreenerRange;
  volumeTrend?: ScreenerRange;

  // Sales / margins / ROE (SMR)
  smrScore?: ScreenerRange;
  salesGrowth2q?: ScreenerRange;
  grossMargin?: ScreenerRange;
  netMargin?: ScreenerRange;
  roe?: ScreenerRange;

  // Technicals
  sma20?: ScreenerRange;
  sma50?: ScreenerRange;
  sma150?: ScreenerRange;
  sma200?: ScreenerRange;
  volumeSma50?: ScreenerRange;
  priceVsSma20?: ScreenerRange;
  priceVsSma50?: ScreenerRange;
  priceVsSma150?: ScreenerRange;
  priceVsSma200?: ScreenerRange;
  high52w?: ScreenerRange;
  low52w?: ScreenerRange;
  offHighPct?: ScreenerRange;
  volumeVsAvg50?: ScreenerRange;
  priceChangePct?: ScreenerRange;
  priceChangeAmount?: ScreenerRange;
  ytdChangePct?: ScreenerRange;

  // Letter-grade list filters (IN match on grades 'A'..'E')
  smrRating?: ScreenerLetterGrade[];
  adRating?: ScreenerLetterGrade[];

  // Boolean filter
  epsAcceleration?: boolean;
}

export interface ScreenerRequest {
  filters?: ScreenerFilters;
  sortBy?: ScreenerSortBy;
  sortOrder?: ScreenerSortOrder;
  page?: number;
  pageSize?: number;
}

export interface ScreenerStock {
  symbol: string;

  // Price & valuation (decimal fields return 0 when no data)
  price: number;
  dailyChange: number;
  marketCap: number;
  peRatio: number;
  pbRatio: number;

  // Return windows
  weeklyReturn: number;
  monthlyReturn: number;
  threeMonthReturn: number;
  yearlyReturn: number;
  threeYearReturn: number;
  fiveYearReturn: number;
  ytdReturn: number;

  // Composite rating (rating integer is null when absent)
  compositeRating: number | null;
  compositeScore: number;

  // Relative strength (RS)
  rsRating: number | null;
  rsScore: number;
  perfQ1: number;
  perfQ2: number;
  perfQ3: number;
  perfQ4: number;

  // EPS
  epsRating: number | null;
  epsScore: number;
  epsGrowthYoy: number;
  epsGrowthQoq: number;
  epsTrailing4q: number;
  epsAcceleration: boolean | null;

  // Accumulation / distribution (A/D)
  adRating: ScreenerLetterGrade | null;
  adScore: number;
  upVolumeRatio: number;
  volumeTrend: number;

  // Sales / margins / ROE (SMR)
  smrRating: ScreenerLetterGrade | null;
  smrScore: number;
  salesGrowth2q: number;
  grossMargin: number;
  netMargin: number;
  roe: number;

  // Technicals
  sma20: number;
  sma50: number;
  sma150: number;
  sma200: number;
  volumeSma50: number;
  priceVsSma20: number;
  priceVsSma50: number;
  priceVsSma150: number;
  priceVsSma200: number;
  high52w: number;
  low52w: number;
  offHighPct: number;
  volumeVsAvg50: number;
  priceChangePct: number;
  priceChangeAmount: number;
  ytdChangePct: number;
}

export class ScreenerClient extends Client {
  async getScreener(
    region?: Region,
    request?: ScreenerRequest
  ): Promise<PaginatedResponse<ScreenerStock>> {
    return this.sendRequest<PaginatedResponse<ScreenerStock>>({
      method: "POST",
      url: "/api/v1/screener",
      params: region != null ? { region } : undefined,
      data: request ?? {},
    });
  }
}
