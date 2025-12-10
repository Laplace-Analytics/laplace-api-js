import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
    NewsClient,
    NewsHighlights,
    News,
    NewsType,
    NewsOrderBy,
} from "../client/news";
import "./client_test_suite";
import { Region, Locale } from "../client/collections";
import { SortDirection } from "../client/broker";
import { PaginatedResponse } from "../client/capital_increase";

const mockNewsHighlightsResponse: NewsHighlights = {
    consumer: ["news1", "news2"],
    energyAndUtilities: ["news3"],
    finance: ["news4", "news5"],
    healthcare: ["news6"],
    industrialsAndMaterials: ["news7"],
    tech: ["news8"],
    other: ["news9"]
};

const mockNewsResponse: News[] = [
    {
        url: "https://example.com/news1",
        imageUrl: "https://example.com/image1.jpg",
        timestamp: "2024-03-14T10:00:00Z",
        publisherUrl: "https://example.com",
        publisher: {
            name: "Example Publisher",
            logoUrl: "https://example.com/logo.png"
        },
        relatedTickers: [
            {
                id: "1",
                name: "Ticker 1",
                symbol: "TCK1"
            }
        ],
        qualityScore: 85,
        createdAt: "2024-03-14T09:00:00Z"
    },
    {
        url: "https://example.com/news2",
        imageUrl: "https://example.com/image2.jpg",
        timestamp: "2024-03-14T11:00:00Z",
        publisherUrl: "https://example.com",
        publisher: {
            name: "Example Publisher 2"
        },
        relatedTickers: [],
        qualityScore: 90,
        createdAt: "2024-03-14T10:00:00Z"
    }
];

const mockPaginatedNewsResponse: PaginatedResponse<News> = {
    recordCount: 2,
    items: mockNewsResponse
};

describe("News Client", () => {
    let client: NewsClient;

    beforeAll(() => {
        const config = (global as any).testSuite.config as LaplaceConfiguration;
        const logger: Logger = {
            info: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            debug: jest.fn(),
        } as unknown as Logger;

        client = new NewsClient(config, logger);
    });

    describe("Integration Tests", () => {
        describe("getHighlights", () => {
            test("should return news highlights for region and locale", async () => {
                const resp = await client.getHighlights(Region.Tr, Locale.Tr);

                expect(resp).toBeDefined();
                expect(Array.isArray(resp.consumer)).toBe(true);
                expect(Array.isArray(resp.energyAndUtilities)).toBe(true);
                expect(Array.isArray(resp.finance)).toBe(true);
                expect(Array.isArray(resp.healthcare)).toBe(true);
                expect(Array.isArray(resp.industrialsAndMaterials)).toBe(true);
                expect(Array.isArray(resp.tech)).toBe(true);
                expect(Array.isArray(resp.other)).toBe(true);
            });
        });

        describe("getNews", () => {
            test("should return paginated news list", async () => {
                const resp = await client.getNews(
                    Region.Tr,
                    Locale.Tr,
                    NewsType.BRIEFS,
                    1,
                    10,
                    NewsOrderBy.TIMESTAMP,
                    SortDirection.Desc,
                    null
                );

                expect(resp).toBeDefined();
                expect(typeof resp.recordCount).toBe("number");
                expect(Array.isArray(resp.items)).toBe(true);

                if (resp.items.length > 0) {
                    const firstNews = resp.items[0];
                    expect(typeof firstNews.url).toBe("string");
                    expect(typeof firstNews.timestamp).toBe("string");
                    expect(typeof firstNews.publisher).toBe("object");
                    expect(Array.isArray(firstNews.relatedTickers)).toBe(true);
                }
            });
        });
    });

    describe("Mock Tests", () => {
        beforeEach(() => {
            jest.clearAllMocks();
        });

        describe("getHighlights", () => {
            test("should return news highlights with mock data", async () => {
                jest.spyOn(client, 'getHighlights').mockResolvedValue(mockNewsHighlightsResponse);

                const resp = await client.getHighlights(Region.Tr, Locale.Tr);

                expect(resp).toBeDefined();
                expect(resp.consumer).toHaveLength(2);
                expect(resp.energyAndUtilities).toHaveLength(1);
                expect(resp.finance).toHaveLength(2);
                expect(resp.tech).toHaveLength(1);

                expect(client.getHighlights).toHaveBeenCalledWith(Region.Tr, Locale.Tr);
            });

            test("should handle API errors for highlights", async () => {
                jest.spyOn(client, 'getHighlights').mockRejectedValue(new Error("Failed to fetch highlights"));

                await expect(client.getHighlights(Region.Tr, Locale.Tr))
                    .rejects.toThrow("Failed to fetch highlights");
            });
        });

        describe("getNews", () => {
            test("should return paginated news with mock data", async () => {
                jest.spyOn(client, 'getNews').mockResolvedValue(mockPaginatedNewsResponse);

                const resp = await client.getNews(
                    Region.Tr,
                    Locale.Tr,
                    NewsType.BRIEFS,
                    1,
                    10,
                    NewsOrderBy.TIMESTAMP,
                    SortDirection.Desc,
                    null
                );

                expect(resp.items).toHaveLength(2);
                expect(resp.recordCount).toBe(2);

                const firstNews = resp.items[0];
                expect(firstNews.url).toBe("https://example.com/news1");
                expect(firstNews.publisher.name).toBe("Example Publisher");
                expect(firstNews.relatedTickers).toHaveLength(1);
                expect(firstNews.qualityScore).toBe(85);

                expect(client.getNews).toHaveBeenCalledWith(
                    Region.Tr,
                    Locale.Tr,
                    NewsType.BRIEFS,
                    1,
                    10,
                    NewsOrderBy.TIMESTAMP,
                    SortDirection.Desc,
                    null
                );
            });

            test("should handle API errors for news", async () => {
                jest.spyOn(client, 'getNews').mockRejectedValue(new Error("Failed to fetch news"));

                await expect(client.getNews(
                    Region.Tr,
                    Locale.Tr,
                    NewsType.BRIEFS,
                    1,
                    10,
                    NewsOrderBy.TIMESTAMP,
                    SortDirection.Desc,
                    null
                )).rejects.toThrow("Failed to fetch news");
            });
        });
    });
});

