import {Client} from "./client";
import {Locale, Region} from "./collections";
import {PaginatedResponse} from "./capital_increase";
import {SortDirection} from "./broker";

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

export interface NewsPublisher {
    name: string;
    logoUrl?: string;
}

export interface NewsTicker {
    id: string;
    name: string;
    symbol?: string;
}

export interface NewsCategories {
    name: string;
    newsCount: number;
    categoryType?: string;
    meanType?: number;
}

export interface NewsSector {
    name: string;
    newsCount: number;
    categoryType?: string;
    meanType?: number;
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
    async getHighlights(region: Region, locale: Locale): Promise<NewsHighlights> {
        const url = new URL(
            `${this["baseUrl"]}/api/v1/news/highlights`,
        );
        url.searchParams.append("region", region);
        url.searchParams.append("locale", locale);

        return this.sendRequest<NewsHighlights>({
            method: "GET",
            url: url.toString(),
        })
    }

    async getNews(
        region: Region,
        locale: Locale,
        newsType: NewsType,
        page: number | null,
        size: number | null,
        orderBy: NewsOrderBy | null,
        orderByDirection: SortDirection | null,
        extraFilters: string | null,
    ): Promise<PaginatedResponse<News>> {
        const url = new URL(
            `${this["baseUrl"]}/api/v1/news`,
        );
        url.searchParams.append("region", region);
        url.searchParams.append("locale", locale);
        url.searchParams.append("newsType", newsType);

        if (page) {
            url.searchParams.append("page", page.toString());
        }

        if (size) {
            url.searchParams.append("size", size.toString());
        }

        if (orderBy) {
            url.searchParams.append("orderBy", orderBy);
        }

        if (orderByDirection) {
            url.searchParams.append("orderByDirection", orderByDirection);
        }

        if (extraFilters) {
            url.searchParams.append("extraFilters", extraFilters);
        }

        return this.sendRequest<PaginatedResponse<News>>({
            method: "GET",
            url: url.toString(),
        });
    }
}