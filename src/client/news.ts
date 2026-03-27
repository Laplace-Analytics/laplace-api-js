import { Client } from "./client";
import { Locale, Region } from "./collections";
import { PaginatedResponse } from "./capital_increase";
import { SortDirection } from "./broker";

export interface NewsHighlights {
  consumer: string[];
  energyAndUtilities: string[];
  finance: string[];
  healthcare: string[];
  industrialsAndMaterials: string[];
  tech: string[];
  other: string[];
}

export enum NewsType {
  BRIEFS = "briefs",
  BLOOMBERG = "bloomberg",
  FDA = "fda",
  REUTERS = "reuters",
}

export enum NewsOrderBy {
  TIMESTAMP = "timestamp",
}

export interface News {
  url: string;
  imageUrl: string;
  timestamp: string;
  publisherUrl: string;
  publisher: NewsPublisher;
  relatedTickers: NewsTicker[];
  qualityScore: number;
  createdAt: string;
  tickers?: NewsTicker[];
  categories?: NewsCategories;
  sectors?: NewsSector;
  content?: NewsContent;
  industries?: NewsIndustry;
}

export type NewsV2 = Omit<News, "relatedTickers">;

export interface NewsPublisher {
  name: string;
  logoUrl: string | null;
}

export interface NewsTicker {
  id: string;
  name: string;
  symbol?: string;
}

export interface NewsCategories {
  name: string;
  newsCount: number;
  categoryType?: string | null;
  meanType?: number | null;
}

export interface NewsSector {
  name: string;
  newsCount: number;
  categoryType?: string | null;
  meanType?: number | null;
}

export interface NewsContent {
  title: string;
  description: string;
  content: string[];
  summary: string[];
  investorInsight: string;
}

export interface NewsIndustry {
  name: string;
  meanType: number;
}

export class NewsClient extends Client {
  async getHighlights(
    region: Region,
    locale: Locale
  ): Promise<NewsHighlights> {
    return this.sendRequest<NewsHighlights>({
      method: "GET",
      url: "/api/v1/news/highlights",
      params: {
        region,
        locale,
      },
    });
  }


  async getNews(
    region: Region,
    locale: Locale,
    newsType?: NewsType,
    page?: number,
    size?: number,
    orderBy?: NewsOrderBy,
    orderByDirection?: SortDirection,
    extraFilters?: string
  ): Promise<PaginatedResponse<News>> {
    const params = {
      region,
      locale,
      ...(newsType != null && { newsType }),
      ...(page != null && { page }),
      ...(size != null && { size }),
      ...(orderBy != null && { orderBy }),
      ...(orderByDirection != null && { orderByDirection }),
      ...(extraFilters != null && { extraFilters }),
    };

    return this.sendRequest<PaginatedResponse<News>>({
      method: "GET",
      url: "/api/v1/news",
      params,
    });
  }

  async getNewsV2(
    region: Region,
    locale: Locale,
    newsType?: NewsType,
    page?: number,
    size?: number,
    orderBy?: NewsOrderBy,
    orderByDirection?: SortDirection,
    extraFilters?: string
  ): Promise<PaginatedResponse<NewsV2>> {
    const params = {
      region,
      locale,
      ...(newsType != null && { newsType }),
      ...(page != null && { page }),
      ...(size != null && { size }),
      ...(orderBy != null && { orderBy }),
      ...(orderByDirection != null && { orderByDirection }),
      ...(extraFilters != null && { extraFilters }),
    };

    return this.sendRequest<PaginatedResponse<NewsV2>>({
      method: "GET",
      url: "/api/v2/news",
      params,
    });
  }

  streamNews(
    region: Region,
    locale: Locale,
    sectors?: string[],
    tickers?: string[],
    categories?: string[],
    industries?: string[]
  ): { events: AsyncIterable<NewsV2[]>, cancel: () => void } {
    let url = `${this["baseUrl"]}/api/v1/news/stream?locale=${locale}&region=${region}`;
    if (sectors?.length) url += `&sectors=${encodeURIComponent(sectors.join(","))}`;
    if (tickers?.length) url += `&tickers=${encodeURIComponent(tickers.join(","))}`;
    if (categories?.length) url += `&categories=${encodeURIComponent(categories.join(","))}`;
    if (industries?.length) url += `&industries=${encodeURIComponent(industries.join(","))}`;
    return this.sendSSERequest<NewsV2[]>(url);
  }
}