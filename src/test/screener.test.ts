import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  ScreenerClient,
  ScreenerRequest,
  ScreenerSortBy,
  ScreenerSortOrder,
} from "../client/screener";
import "./client_test_suite";
import { Region } from "../client/collections";

const mockScreenerResponse = {
  items: [
    {
      symbol: "AKBNK",
      price: 931.5,
      dailyChange: 27.12,
      marketCap: 4841200000000,
      peRatio: 84.6,
      pbRatio: 15.6,
      weeklyReturn: 0.417,
      monthlyReturn: 0.552,
      threeMonthReturn: 27.04,
      yearlyReturn: 27.47,
      threeYearReturn: 423.26,
      fiveYearReturn: 1589.99,
      ytdReturn: 27.04,
      compositeRating: 93,
      compositeScore: 88.2,
      rsRating: 88,
      rsScore: 0.91,
      perfQ1: 3.2,
      perfQ2: 5.1,
      perfQ3: 9.0,
      perfQ4: 12.4,
      epsRating: 85,
      epsScore: 0.77,
      epsGrowthYoy: 34.0,
      epsGrowthQoq: 21.0,
      epsTrailing4q: 65.2,
      epsAcceleration: true,
      adRating: "A",
      adScore: 0.65,
      upVolumeRatio: 1.4,
      volumeTrend: 0.2,
      smrRating: "B",
      smrScore: 0.72,
      salesGrowth2q: 18.0,
      grossMargin: 42.0,
      netMargin: 12.5,
      roe: 27.0,
      sma20: 305.1,
      sma50: 290.4,
      sma150: 250.7,
      sma200: 240.9,
      volumeSma50: 12500000,
      priceVsSma20: 2.4,
      priceVsSma50: 7.6,
      priceVsSma150: 24.6,
      priceVsSma200: 29.7,
      high52w: 320.0,
      low52w: 180.0,
      offHighPct: -2.3,
      volumeVsAvg50: 1.3,
      priceChangePct: 1.24,
      priceChangeAmount: 3.8,
      ytdChangePct: 12.4,
    },
  ],
  recordCount: 511,
};

describe("ScreenerClient", () => {
  let client: ScreenerClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new ScreenerClient(config, logger);
  });

  describe("Integration Tests", () => {
    jest.setTimeout(60_000);

    test("getScreener returns valid paginated data", async () => {
      const resp = await client.getScreener(Region.Tr, {
        sortBy: ScreenerSortBy.MarketCap,
        sortOrder: ScreenerSortOrder.Desc,
        page: 1,
        pageSize: 10,
      });

      expect(resp).toBeDefined();
      expect(typeof resp.recordCount).toBe("number");
      expect(resp.recordCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(resp.items)).toBe(true);

      if (resp.items.length > 0) {
        const s = resp.items[0];
        expect(typeof s.symbol).toBe("string");
        expect(s.price == null || typeof s.price === "number").toBe(true);
        expect(s.marketCap == null || typeof s.marketCap === "number").toBe(true);
      }
    });
  });

  describe("Mock Tests", () => {
    let client: ScreenerClient;
    let cli: { request: jest.Mock };

    beforeEach(() => {
      cli = { request: jest.fn() };

      const config = (global as any).testSuite.config as LaplaceConfiguration;
      const logger: Logger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      } as unknown as Logger;

      client = new ScreenerClient(config, logger, cli as any);
    });

    test("calls correct endpoint, query and body and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockScreenerResponse });

      const body: ScreenerRequest = {
        filters: {
          price: { min: 10.5, max: 500 },
          marketCap: { min: 10000000000 },
          peRatio: { min: 5, max: 20 },
          compositeRating: { min: 90 },
          rsRating: { min: 80 },
          epsRating: { min: 80 },
          roe: { min: 20 },
          netMargin: { min: 10 },
          priceVsSma200: { min: 0 },
          offHighPct: { min: -15, max: 0 },
          smrRating: ["A", "B"],
          adRating: ["A", "B"],
          epsAcceleration: true,
        },
        sortBy: ScreenerSortBy.CompositeRating,
        sortOrder: ScreenerSortOrder.Desc,
        page: 1,
        pageSize: 20,
      };

      const resp = await client.getScreener(Region.Tr, body);

      expect(cli.request).toHaveBeenCalledTimes(1);
      const call = cli.request.mock.calls[0][0];

      expect(call.method).toBe("POST");
      expect(call.url).toBe("/api/v1/screener");
      expect(call.params).toEqual({ region: Region.Tr });
      expect(call.data).toEqual(body);

      expect(resp.recordCount).toBe(511);
      expect(resp.items).toHaveLength(1);
      const s = resp.items[0];
      expect(s.symbol).toBe("AKBNK");
      expect(s.price).toBe(931.5);
      expect(s.marketCap).toBe(4841200000000);
      expect(s.compositeRating).toBe(93);
      expect(s.rsRating).toBe(88);
      expect(s.epsAcceleration).toBe(true);
      expect(s.adRating).toBe("A");
      expect(s.smrRating).toBe("B");
      expect(s.roe).toBe(27.0);
      expect(s.offHighPct).toBe(-2.3);
    });

    test("omits region param when not provided and sends empty body when request omitted", async () => {
      cli.request.mockResolvedValueOnce({ data: mockScreenerResponse });

      await client.getScreener();

      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("POST");
      expect(call.url).toBe("/api/v1/screener");
      expect(call.params).toBeUndefined();
      expect(call.data).toEqual({});
    });

    test("bubbles up request error", async () => {
      cli.request.mockRejectedValueOnce(new Error("Failed to fetch screener"));

      await expect(client.getScreener(Region.Tr)).rejects.toThrow(
        "Failed to fetch screener"
      );

      expect(cli.request).toHaveBeenCalledTimes(1);
    });
  });
});
