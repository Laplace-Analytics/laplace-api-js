import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  NewsClient,
  NewsType,
  NewsOrderBy,
} from "../client/news";
import "./client_test_suite";
import { Region, Locale } from "../client/collections";
import { SortDirection } from "../client/broker";

const mockNewsHighlightsResponse = {
    tech: [
      "Alphabet ve Amazon'un desteğiyle Anthropic, 2026 başlarında Hindistan'ın Bengaluru kentinde bir ofis açacak."
    ],
    other: [
      "ABD Yüksek Mahkemesi, Epic Games'in davası kapsamında Google'ın Play uygulamalarındaki değişikliği engellemeyecek."
    ],
    finance: [
      "Fifth Third Bank, Comerica'yı 10,9 milyar dolara satın alacak ve böylece ABD'nin 9. en büyük bankası olacak."
    ],
    consumer: [
      "Tesla, rekabet ortamında pazar payını geri almak için daha ucuz Model Y ve Model 3'ü piyasaya sürdü; duyuru hisseleri etkiledi."
    ],
    healthcare: [
      "İlaç üreticileri, Amgen ve Novo Nordisk'in de dahil olduğu şekilde, Trump'ın ilaç fiyatlarını düşürme planıyla uyumlu olarak tele-sağlık satışlarını artırıyor."
    ],
    energyAndUtilities: [
      "ABD Enerji Bakanlığı, Stellantis ve GM'ye verilen 1,1 milyar dolarlık hibeleri iptal edebilir."
    ],
    industrialsAndMaterials: [
      "Boeing, bir grevi sona erdirmek için IAM Sendikası ile geçici bir anlaşmaya vardı; detaylar açıklanmadı."
    ]
  };
  
  const mockNewsResponse = {
    items: [
      {
        url: "https://www.reuters.com/business/energy/commonwealth-lng-wants-more-time-build-planned-export-facility-louisiana-2025-10-07/",
        content: {
          title: "Commonwealth LNG wants more time to build planned export facility in Louisiana",
          content: [
            "Commonwealth LNG has requested a four-year extension from federal regulators to construct & begin exporting liquefied natural gas..."
          ],
          summary: [
            "Commonwealth LNG has requested a four-year extension from federal regulators..."
          ],
          description:
            "Commonwealth LNG has asked federal regulators for a four-year extension...",
          investorInsight:
            "What it means for investors: The extension request could postpone..."
        },
        sectors: { name: "Energy", meanType: 9, newsCount: 1 },
        tickers: [{ id: "6203d1ba1e674875275558f7", name: "EQT Corp", symbol: "EQT" }],
        imageUrl: "",
        createdAt: "2025-10-07T17:10:01.560644Z",
        publisher: { name: "Reuters", logoUrl: null },
        timestamp: "2025-10-07T16:50:16Z",
        categories: { name: "Sector News", newsCount: 1, categoryType: "StockSpesific" },
        industries: { name: "Oil/Gas (Production and Exploration)", meanType: 78 },
        publisherUrl: "Reuters",
        qualityScore: 0,
        relatedTickers: [{ id: "6203d1ba1e674875275558f7", name: "EQT Corp", symbol: "EQT" }]
      }
    ],
    recordCount: 352
  };

describe("NewsClient", () => {
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
    jest.setTimeout(60_000);

    test("getHighlights returns valid data", async () => {
      const resp = await client.getHighlights(Region.Us, Locale.Tr);

      expect(resp).toBeDefined();

      expect(Array.isArray(resp.consumer)).toBe(true);
      expect(Array.isArray(resp.energyAndUtilities)).toBe(true);
      expect(Array.isArray(resp.finance)).toBe(true);
      expect(Array.isArray(resp.healthcare)).toBe(true);
      expect(Array.isArray(resp.industrialsAndMaterials)).toBe(true);
      expect(Array.isArray(resp.tech)).toBe(true);
      expect(Array.isArray(resp.other)).toBe(true);

      const first = resp.tech?.[0];
      if (first != null) expect(typeof first).toBe("string");
    });

    test("getNews returns valid paginated data", async () => {
      const resp = await client.getNews(
        Region.Us,
        Locale.Tr,
        NewsType.BRIEFS,
        0,
        10,
        NewsOrderBy.TIMESTAMP,
        SortDirection.Desc
      );

      expect(resp).toBeDefined();
      expect(typeof resp.recordCount).toBe("number");
      expect(resp.recordCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(resp.items)).toBe(true);

      if (resp.items.length > 0) {
        const n = resp.items[0];

        expect(typeof n.url).toBe("string");
        expect(typeof n.imageUrl).toBe("string");
        expect(typeof n.timestamp).toBe("string");
        expect(typeof n.publisherUrl).toBe("string");
        expect(typeof n.qualityScore).toBe("number");
        expect(typeof n.createdAt).toBe("string");

        expect(n.publisher).toBeDefined();
        expect(typeof n.publisher.name).toBe("string");
        expect(
          typeof n.publisher.logoUrl === "string" || n.publisher.logoUrl == null
        ).toBe(true);

        expect(Array.isArray(n.relatedTickers)).toBe(true);
        if (n.relatedTickers.length > 0) {
          const t = n.relatedTickers[0];
          expect(typeof t.id).toBe("string");
          expect(typeof t.name).toBe("string");
          expect(typeof t.symbol === "string" || t.symbol == null).toBe(true);
        }

        if (n.tickers != null) {
          expect(Array.isArray(n.tickers)).toBe(true);
        }

        if (n.categories != null) {
          expect(typeof n.categories.name).toBe("string");
          expect(typeof n.categories.newsCount).toBe("number");
          expect(
            typeof n.categories.categoryType === "string" ||
              n.categories.categoryType == null ||
              n.categories.categoryType === undefined
          ).toBe(true);
          expect(
            typeof n.categories.meanType === "number" ||
              n.categories.meanType == null ||
              n.categories.meanType === undefined
          ).toBe(true);
        }

        if (n.sectors != null) {
          expect(typeof n.sectors.name).toBe("string");
          expect(typeof n.sectors.newsCount).toBe("number");
          expect(
            typeof n.sectors.categoryType === "string" ||
              n.sectors.categoryType == null ||
              n.sectors.categoryType === undefined
          ).toBe(true);
          expect(
            typeof n.sectors.meanType === "number" ||
              n.sectors.meanType == null ||
              n.sectors.meanType === undefined
          ).toBe(true);
        }

        if (n.industries != null) {
          expect(typeof n.industries.name).toBe("string");
          expect(typeof n.industries.meanType).toBe("number");
        }

        if (n.content != null) {
          expect(typeof n.content.title).toBe("string");
          expect(typeof n.content.description).toBe("string");
          expect(Array.isArray(n.content.content)).toBe(true);
          expect(Array.isArray(n.content.summary)).toBe(true);
          expect(typeof n.content.investorInsight).toBe("string");
        }
      }
    });
  });

  describe("Mock Tests", () => {
    let client: NewsClient;
    let cli: { request: jest.Mock };

    beforeEach(() => {
      cli = { request: jest.fn() };

      const config = (global as any).testSuite.config as LaplaceConfiguration;
      const logger: Logger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn()
      } as unknown as Logger;

      client = new NewsClient(config, logger, cli as any);
    });

    describe("getHighlights", () => {
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockNewsHighlightsResponse });

        const resp = await client.getHighlights(Region.Tr, Locale.Tr);

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/news/highlights");
        expect(call.params).toEqual({ region: Region.Tr, locale: Locale.Tr });

        expect(resp.consumer).toEqual(mockNewsHighlightsResponse.consumer);
        expect(resp.energyAndUtilities).toEqual(mockNewsHighlightsResponse.energyAndUtilities);
        expect(resp.finance).toEqual(mockNewsHighlightsResponse.finance);
        expect(resp.healthcare).toEqual(mockNewsHighlightsResponse.healthcare);
        expect(resp.industrialsAndMaterials).toEqual(mockNewsHighlightsResponse.industrialsAndMaterials);
        expect(resp.tech).toEqual(mockNewsHighlightsResponse.tech);
        expect(resp.other).toEqual(mockNewsHighlightsResponse.other);
      });

      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Failed to fetch highlights"));

        await expect(client.getHighlights(Region.Tr, Locale.Tr)).rejects.toThrow(
          "Failed to fetch highlights"
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
      });
    });

    describe("getNews", () => {
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockNewsResponse });

        const resp = await client.getNews(
          Region.Tr,
          Locale.Tr,
          NewsType.BRIEFS,
          1,
          10,
          NewsOrderBy.TIMESTAMP,
          SortDirection.Desc,
          undefined
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/news");
        expect(call.params).toEqual({
          region: Region.Tr,
          locale: Locale.Tr,
          newsType: NewsType.BRIEFS,
          page: 1,
          size: 10,
          orderBy: NewsOrderBy.TIMESTAMP,
          orderByDirection: SortDirection.Desc
        });

        expect(resp.recordCount).toBe(352);
        expect(resp.items).toHaveLength(1);

        const n = resp.items[0];

        expect(n.url).toBe(mockNewsResponse.items[0].url);
        expect(n.imageUrl).toBe(mockNewsResponse.items[0].imageUrl);
        expect(n.timestamp).toBe(mockNewsResponse.items[0].timestamp);
        expect(n.publisherUrl).toBe(mockNewsResponse.items[0].publisherUrl);
        expect(n.qualityScore).toBe(mockNewsResponse.items[0].qualityScore);
        expect(n.createdAt).toBe(mockNewsResponse.items[0].createdAt);

        expect(n.publisher.name).toBe(mockNewsResponse.items[0].publisher.name);
        expect(n.publisher.logoUrl).toBeNull();

        expect(n.relatedTickers).toHaveLength(1);
        expect(n.relatedTickers[0].id).toBe(mockNewsResponse.items[0].relatedTickers[0].id);
        expect(n.relatedTickers[0].name).toBe(mockNewsResponse.items[0].relatedTickers[0].name);
        expect(n.relatedTickers[0].symbol).toBe(mockNewsResponse.items[0].relatedTickers[0].symbol);

        expect(n.tickers).toHaveLength(1);
        expect(n.tickers![0].symbol).toBe("EQT");

        expect(n.categories?.name).toBe(mockNewsResponse.items[0].categories.name);
        expect(n.categories?.newsCount).toBe(mockNewsResponse.items[0].categories.newsCount);
        expect(n.categories?.categoryType).toBe(mockNewsResponse.items[0].categories.categoryType);

        expect(n.sectors?.name).toBe(mockNewsResponse.items[0].sectors.name);
        expect(n.sectors?.newsCount).toBe(mockNewsResponse.items[0].sectors.newsCount);
        expect(n.sectors?.meanType).toBe(mockNewsResponse.items[0].sectors.meanType);

        expect(n.industries?.name).toBe(mockNewsResponse.items[0].industries.name);
        expect(n.industries?.meanType).toBe(mockNewsResponse.items[0].industries.meanType);

        expect(n.content?.title).toBe(mockNewsResponse.items[0].content.title);
        expect(n.content?.description).toBe(mockNewsResponse.items[0].content.description);
        expect(n.content?.content).toEqual(mockNewsResponse.items[0].content.content);
        expect(n.content?.summary).toEqual(mockNewsResponse.items[0].content.summary);
        expect(n.content?.investorInsight).toBe(mockNewsResponse.items[0].content.investorInsight);
      });

      test("does not send optional params when undefined", async () => {
        cli.request.mockResolvedValueOnce({ data: mockNewsResponse });

        await client.getNews(Region.Tr, Locale.Tr);

        const call = cli.request.mock.calls[0][0];
        expect(call.params).toEqual({
          region: Region.Tr,
          locale: Locale.Tr
        });
      });

      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Failed to fetch news"));

        await expect(
          client.getNews(
            Region.Tr,
            Locale.Tr,
            NewsType.REUTERS,
            0,
            10,
            NewsOrderBy.TIMESTAMP,
            SortDirection.Desc
          )
        ).rejects.toThrow("Failed to fetch news");

        expect(cli.request).toHaveBeenCalledTimes(1);
      });
    });
  });
});
