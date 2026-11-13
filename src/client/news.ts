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
  /** @deprecated "Best known time". Use {@link NewsOrderBy.PUBLISHED_AT} on v2. */
  TIMESTAMP = "timestamp",
  /** Older spelling of {@link NewsOrderBy.QUALITY_SCORE_V2}; both are accepted. */
  QUALITY_SCORE = "quality_score",
  PUBLISHED_AT = "publishedAt",
  INGESTED_AT = "ingestedAt",
  UPDATED_AT = "updatedAt",
  QUALITY_SCORE_V2 = "qualityScore",
}

/** How central a tagged company is to an article. */
export enum NewsTickerRelevance {
  /** The article is about this company (at most one per article). */
  PRIMARY = "primary",
  /** Named with some substance: a counterparty, competitor or comparison. */
  MENTIONED = "mentioned",
  /** Only appears in a list, ranking or market table. */
  LISTED = "listed",
}

/**
 * Event type slugs for the `eventTypes` / `excludeEventTypes` filters.
 * {@link NewsClient.getNewsEventTypes} returns the current list with localized names.
 */
export enum NewsEventType {
  FINANCIAL_RESULTS = "financial-results",
  GUIDANCE = "guidance",
  OPERATIONAL_DATA = "operational-data",
  ORDERS_INVESTMENTS = "orders-investments",
  MANAGEMENT_CHANGE = "management-change",
  REGULATION = "regulation",
  LITIGATION = "litigation",
  CREDIT_RATING = "credit-rating",
  DIVIDEND = "dividend",
  ANALYST_REPORT = "analyst-report",
  PRICE_ACTION_TECHNICAL = "price-action-technical",
  OTHER = "other",
}

export enum NewsOriginality {
  ORIGINAL = "original",
  REWRITE = "rewrite",
}

/** A sort field, or a `[field, direction]` pair. Without a direction the API uses desc. */
export type NewsOrder = NewsOrderBy | string | [NewsOrderBy | string, SortDirection?];

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
  /** @deprecated Use {@link GetNewsV2Params.publishedFrom} on v2. */
  timestampFrom?: string;
  /** @deprecated Use {@link GetNewsV2Params.publishedTo} on v2. */
  timestampTo?: string;
  page?: number;
  size?: number;
}

/**
 * Content filters shared by `getNewsV2` and `streamNews`. Lists are sent comma-joined.
 * Enum members and plain strings can be mixed; the API rejects unknown values with a 400.
 */
export interface NewsContentFilters {
  /** Keep news where a ticker (one of `symbols`, if given) has one of these relevances. */
  tickerRelevance?: (NewsTickerRelevance | string)[];
  /** `true` drops market wraps, "most traded" lists and top-gainer tables. */
  excludeListArticles?: boolean;
  eventTypes?: (NewsEventType | string)[];
  /** Drops these event types. Articles not classified yet are kept. */
  excludeEventTypes?: (NewsEventType | string)[];
  /** `true` returns each story once instead of once per outlet. */
  collapseClusters?: boolean;
}

/**
 * Parameters for {@link NewsClient.getNewsV2}: the v1 filters plus the v2-only ones.
 * `size` accepts any value from 1 to 100. Unset fields aren't sent.
 */
export interface GetNewsV2Params extends GetNewsParams, NewsContentFilters {
  /** 1-100 (percent). Limits how much of the result one publisher can take. */
  maxPublisherShare?: number;
  /** RFC3339 or YYYY-MM-DD (UTC). */
  publishedFrom?: string;
  /** A date-only value includes that whole day. */
  publishedTo?: string;
  /** Filters on `updatedAt`, for incremental sync. Changes the default order to updatedAt asc. */
  updatedSince?: string;
  /** The result as it was at that time. */
  asOf?: string;
  /**
   * Up to 3 sort fields, e.g. `[[NewsOrderBy.QUALITY_SCORE_V2, SortDirection.Desc],
   * [NewsOrderBy.PUBLISHED_AT, SortDirection.Desc]]`. Replaces `orderBy` / `orderByDirection`.
   * Cursors only work with a single field.
   */
  orderByFields?: NewsOrder[];
  /** `nextCursor` from the previous page. Can't be combined with `page`. */
  cursor?: string;
  /** `false` skips counting all matches (faster); `recordCount` is then `null`. */
  includeTotal?: boolean;
}

/** Filters for {@link NewsClient.streamNews}, beyond its positional arguments. */
export type StreamNewsFilters = NewsContentFilters;

export interface NewsPublisherCap {
  /** Requested share, in percent. */
  share: number;
  /** Item limit applied to each publisher. */
  perPublisher: number;
  /** Largest share any publisher actually has; can be above `share` when few publishers cover the query. */
  achievedShare: number;
}

/**
 * A page of v2 news. Same shape as `PaginatedResponse<NewsV2>`, except `recordCount` is `null`
 * when `includeTotal` is `false`.
 */
export interface NewsV2Page extends Omit<PaginatedResponse<NewsV2>, "recordCount"> {
  recordCount: number | null;
  /** Missing on the last page. Pass it back unchanged as `cursor`. */
  nextCursor?: string;
  /** Present only when `maxPublisherShare` was sent. */
  publisherCap?: NewsPublisherCap;
}

export interface NewsEventTypeInfo {
  slug: NewsEventType | string;
  name: string;
  language: string;
}

export interface News {
  id: string;
  url: string;
  imageUrl: string;
  /** @deprecated `publishedAt` if known, else `ingestedAt`. Use `publishedAt` (v2). */
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

/**
 * A news item from the v2 endpoint and the live stream. Fields added after the first v2
 * release are optional so older responses still type-check.
 */
export interface NewsV2 extends Omit<News, "relatedTickers"> {
  /** When the source published it; `null` when the source gave no usable date. */
  publishedAt?: string | null;
  /** When Laplace first stored it. */
  ingestedAt?: string;
  /** Last time the title or text changed; `null` if it never changed. */
  contentUpdatedAt?: string | null;
  /** Last change of any kind. Use it with `updatedSince`. */
  updatedAt?: string;
  /** The one company the article is about. */
  primaryTicker?: string;
  /** `true` for market wraps, rankings and "most traded" lists. */
  isListArticle?: boolean;
  /** Missing until the article is classified. */
  eventType?: NewsEventTypeInfo;
  clusterId?: string;
  /** `true` for the first report of the story. */
  isClusterLead?: boolean;
  /** How many articles cover the story. */
  clusterSize?: number;
  originality?: NewsOriginality | string;
}

export interface NewsPublisher {
  name: string;
  logoUrl: string | null;
}

export interface NewsTicker {
  /** Laplace stock ID. Empty if the symbol has no listing. */
  id: string;
  name: string;
  symbol?: string;
  /** Listing market. Set on v2 and stream items. */
  region?: Region | string;
  /** Empty string when not classified. Set on v2 and stream items. */
  relevance?: NewsTickerRelevance | "";
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

  /** Event type slugs accepted by `eventTypes` / `excludeEventTypes`, with localized names. */
  async getNewsEventTypes(locale?: Locale): Promise<NewsEventTypeInfo[]> {
    return this.sendRequest<NewsEventTypeInfo[]>({
      method: "GET",
      url: "/api/v1/news/event-types",
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

  private buildNewsV2Params(
    region: Region,
    locale: Locale,
    options?: GetNewsV2Params
  ): Record<string, unknown> {
    const params: Record<string, unknown> = {
      ...this.buildNewsFilterParams(region, locale, options),
      ...buildContentFilterParams(options),
      ...(options?.maxPublisherShare != null && {
        maxPublisherShare: options.maxPublisherShare,
      }),
      ...(options?.publishedFrom != null && { publishedFrom: options.publishedFrom }),
      ...(options?.publishedTo != null && { publishedTo: options.publishedTo }),
      ...(options?.updatedSince != null && { updatedSince: options.updatedSince }),
      ...(options?.asOf != null && { asOf: options.asOf }),
      ...(options?.cursor != null && { cursor: options.cursor }),
      ...(options?.includeTotal != null && { includeTotal: String(options.includeTotal) }),
    };
    if (options?.orderByFields?.length) {
      params.orderBy = renderNewsOrder(options.orderByFields);
      delete params.orderByDirection;
    }
    return params;
  }

  /**
   * A page of news from the v2 endpoint, newest first by default. Takes every v2 filter and
   * cursor paging; see {@link iterateNewsV2} to read all pages.
   */
  async getNewsV2(
    region: Region,
    locale: Locale,
    options?: GetNewsV2Params
  ): Promise<NewsV2Page> {
    return this.sendRequest<NewsV2Page>({
      method: "GET",
      url: "/api/v2/news",
      params: this.buildNewsV2Params(region, locale, options),
    });
  }

  /**
   * Yields every v2 news item matching the filters, following `nextCursor` until the last page.
   * Sends `includeTotal=false` and keeps the other options the same between pages. Start from
   * a saved position with `cursor`. `page` can't be used, since the API rejects it with a cursor.
   * Stops at the first request error and rethrows it.
   */
  async *iterateNewsV2(
    region: Region,
    locale: Locale,
    options?: Omit<GetNewsV2Params, "page" | "includeTotal">
  ): AsyncGenerator<NewsV2, void, undefined> {
    if ((options as GetNewsV2Params | undefined)?.page != null) {
      throw new Error("iterateNewsV2 uses cursor paging; don't pass page");
    }
    let cursor = options?.cursor;
    while (true) {
      const page = await this.getNewsV2(region, locale, {
        ...options,
        cursor,
        includeTotal: false,
      });
      yield* page.items;
      if (!page.nextCursor) return;
      cursor = page.nextCursor;
    }
  }

  streamNews(
    region: Region,
    locale: Locale,
    sectorIds?: string[],
    symbols?: string[],
    categoryIds?: string[],
    industryIds?: string[],
    lane?: NewsLane,
    apiSource?: string[],
    filters?: StreamNewsFilters
  ): { events: AsyncIterable<NewsV2[]>, cancel: () => void } {
    let url = `${this["baseUrl"]}/api/v1/news/stream?locale=${locale}&region=${region}`;
    if (lane != null) url += `&lane=${encodeURIComponent(lane)}`;
    if (apiSource?.length) url += `&apiSource=${encodeURIComponent(apiSource.join(","))}`;
    if (sectorIds?.length) url += `&sectorIds=${encodeURIComponent(sectorIds.join(","))}`;
    if (symbols?.length) url += `&symbols=${encodeURIComponent(symbols.join(","))}`;
    if (categoryIds?.length) url += `&categoryIds=${encodeURIComponent(categoryIds.join(","))}`;
    if (industryIds?.length) url += `&industryIds=${encodeURIComponent(industryIds.join(","))}`;
    for (const [key, value] of Object.entries(buildContentFilterParams(filters))) {
      url += `&${key}=${encodeURIComponent(value)}`;
    }
    return this.sendSSERequest<NewsV2[]>(url);
  }
}
function buildContentFilterParams(filters?: NewsContentFilters): Record<string, string> {
  return {
    ...(filters?.tickerRelevance?.length && {
      tickerRelevance: filters.tickerRelevance.join(","),
    }),
    ...(filters?.excludeListArticles != null && {
      excludeListArticles: String(filters.excludeListArticles),
    }),
    ...(filters?.eventTypes?.length && { eventTypes: filters.eventTypes.join(",") }),
    ...(filters?.excludeEventTypes?.length && {
      excludeEventTypes: filters.excludeEventTypes.join(","),
    }),
    ...(filters?.collapseClusters != null && {
      collapseClusters: String(filters.collapseClusters),
    }),
  };
}

function renderNewsOrder(fields: NewsOrder[]): string {
  return fields
    .map((f) => (Array.isArray(f) ? (f[1] ? `${f[0]} ${f[1]}` : f[0]) : f))
    .join(",");
}
