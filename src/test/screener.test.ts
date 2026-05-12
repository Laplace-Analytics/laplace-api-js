import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  ScreenerClient,
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

      const body = {
        filters: {
          price: { min: 10.5, max: 500 },
          marketCap: { min: 10000000000 },
        },
        sortBy: ScreenerSortBy.MarketCap,
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
      expect(resp.items[0].symbol).toBe("AKBNK");
      expect(resp.items[0].price).toBe(931.5);
      expect(resp.items[0].marketCap).toBe(4841200000000);
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
