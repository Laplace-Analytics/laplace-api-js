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
}

export enum ScreenerSortOrder {
  Asc = "asc",
  Desc = "desc",
}

export interface ScreenerRange {
  min?: number;
  max?: number;
}

export interface ScreenerFilters {
  price?: ScreenerRange;
  dailyChange?: ScreenerRange;
  peRatio?: ScreenerRange;
  pbRatio?: ScreenerRange;
  marketCap?: ScreenerRange;
  weeklyReturn?: ScreenerRange;
  monthlyReturn?: ScreenerRange;
  threeMonthReturn?: ScreenerRange;
  yearlyReturn?: ScreenerRange;
  threeYearReturn?: ScreenerRange;
  fiveYearReturn?: ScreenerRange;
  ytdReturn?: ScreenerRange;
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
  price: number | null;
  dailyChange: number | null;
  marketCap: number | null;
  peRatio: number | null;
  pbRatio: number | null;
  weeklyReturn: number | null;
  monthlyReturn: number | null;
  threeMonthReturn: number | null;
  yearlyReturn: number | null;
  threeYearReturn: number | null;
  fiveYearReturn: number | null;
  ytdReturn: number | null;
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
