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

export interface NewsHighlightsItem extends NewsHighlights {
  id: string;
  createdAt: string;
}

export interface GetHighlightsParams {
  from?: string;
  to?: string;
  skip?: number;
  top?: number;
}

export enum NewsType {
  BRIEFS = "briefs",
  BLOOMBERG = "bloomberg",
  FDA = "fda",
  REUTERS = "reuters",
}

export enum NewsOrderBy {
  TIMESTAMP = "timestamp",
  QUALITY_SCORE = "quality_score",
}

export enum NewsLane {
  GLOBAL_MACRO = "global_macro",
  TR_EKONOMI = "tr_ekonomi",
  BIST = "bist",
  FAST_MOVERS = "fast_movers",
}

export interface GetNewsParams {
  lane?: NewsLane;
  apiSource?: string;
  newsType?: NewsType;
  orderBy?: NewsOrderBy;
  orderByDirection?: SortDirection;
  symbols?: string;
  categoryIds?: string;
  sectorIds?: string;
  industryIds?: string;
  qualityScoreMin?: number;
  qualityScoreMax?: number;
  timestampFrom?: string;
  timestampTo?: string;
  page?: number;
  size?: number;
}

/** @deprecated Use {@link GetNewsParams}; v1 and v2 now accept the same filters. */
export type GetNewsV2Params = GetNewsParams;

export interface News {
  id: string;
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
  id: string;
  name: string;
  categoryType?: string | null;
}

export interface NewsSector {
  id: string;
  name: string;
}

export interface NewsContent {
  title: string;
  description: string;
  content: string[];
  summary: string[];
  investorInsight: string;
}

export interface NewsIndustry {
  id: string;
  name: string;
}

export interface NewsCategory {
  id: string;
  name: string;
}

export interface NewsLaneInfo {
  id: NewsLane;
  label: string;
}

export interface NewsApiSource {
  id: string;
  name: string;
}

export class NewsClient extends Client {
  async getHighlights(
    region: Region,
    locale: Locale,
    options?: GetHighlightsParams
  ): Promise<PaginatedResponse<NewsHighlightsItem>> {
    return this.sendRequest<PaginatedResponse<NewsHighlightsItem>>({
      method: "GET",
      url: "/api/v1/news/highlights",
      params: {
        region,
        locale,
        ...(options?.from != null && { from: options.from }),
        ...(options?.to != null && { to: options.to }),
        ...(options?.skip != null && { skip: options.skip }),
        ...(options?.top != null && { top: options.top }),
      },
    });
  }

  async getNewsCategories(locale?: Locale): Promise<NewsCategory[]> {
    return this.sendRequest<NewsCategory[]>({
      method: "GET",
      url: "/api/v1/news/categories",
      params: {
        ...(locale != null && { locale }),
      },
    });
  }

  async getNewsLanes(region?: Region): Promise<NewsLaneInfo[]> {
    return this.sendRequest<NewsLaneInfo[]>({
      method: "GET",
      url: "/api/v1/news/lanes",
      params: {
        ...(region != null && { region }),
      },
    });
  }

  async getApiSourceNames(
    region?: Region,
    language?: Locale
  ): Promise<NewsApiSource[]> {
    return this.sendRequest<NewsApiSource[]>({
      method: "GET",
      url: "/api/v1/news/api-source-names",
      params: {
        ...(region != null && { region }),
        ...(language != null && { language }),
      },
    });
  }

  private buildNewsFilterParams(
    region: Region,
    locale: Locale,
    options?: GetNewsParams
  ): Record<string, unknown> {
    return {
      region,
      locale,
      ...(options?.lane != null && { lane: options.lane }),
      ...(options?.apiSource != null && { apiSource: options.apiSource }),
      ...(options?.newsType != null && { newsType: options.newsType }),
      ...(options?.orderBy != null && { orderBy: options.orderBy }),
      ...(options?.orderByDirection != null && {
        orderByDirection: options.orderByDirection,
      }),
      ...(options?.symbols != null && { symbols: options.symbols }),
      ...(options?.categoryIds != null && { categoryIds: options.categoryIds }),
      ...(options?.sectorIds != null && { sectorIds: options.sectorIds }),
      ...(options?.industryIds != null && { industryIds: options.industryIds }),
      ...(options?.qualityScoreMin != null && {
        qualityScoreMin: options.qualityScoreMin,
      }),
      ...(options?.qualityScoreMax != null && {
        qualityScoreMax: options.qualityScoreMax,
      }),
      ...(options?.timestampFrom != null && {
        timestampFrom: options.timestampFrom,
      }),
      ...(options?.timestampTo != null && { timestampTo: options.timestampTo }),
      ...(options?.page != null && { page: options.page }),
      ...(options?.size != null && { size: options.size }),
    };
  }

  async getNews(
    region: Region,
    locale: Locale,
    options?: GetNewsParams
  ): Promise<PaginatedResponse<News>> {
    return this.sendRequest<PaginatedResponse<News>>({
      method: "GET",
      url: "/api/v1/news",
      params: this.buildNewsFilterParams(region, locale, options),
    });
  }

  async getNewsV2(
    region: Region,
    locale: Locale,
    options?: GetNewsParams
  ): Promise<PaginatedResponse<NewsV2>> {
    return this.sendRequest<PaginatedResponse<NewsV2>>({
      method: "GET",
      url: "/api/v2/news",
      params: this.buildNewsFilterParams(region, locale, options),
    });
  }

  streamNews(
    region: Region,
    locale: Locale,
    sectorIds?: string[],
    symbols?: string[],
    categoryIds?: string[],
    industryIds?: string[],
    lane?: NewsLane,
    apiSource?: string[]
  ): { events: AsyncIterable<NewsV2[]>, cancel: () => void } {
    let url = `${this["baseUrl"]}/api/v1/news/stream?locale=${locale}&region=${region}`;
    if (lane != null) url += `&lane=${encodeURIComponent(lane)}`;
    if (apiSource?.length) url += `&apiSource=${encodeURIComponent(apiSource.join(","))}`;
    if (sectorIds?.length) url += `&sectorIds=${encodeURIComponent(sectorIds.join(","))}`;
    if (symbols?.length) url += `&symbols=${encodeURIComponent(symbols.join(","))}`;
    if (categoryIds?.length) url += `&categoryIds=${encodeURIComponent(categoryIds.join(","))}`;
    if (industryIds?.length) url += `&industryIds=${encodeURIComponent(industryIds.join(","))}`;
    return this.sendSSERequest<NewsV2[]>(url);
  }
}