import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  StockClient,
  HistoricalPricePeriod,
  HistoricalPriceInterval,
  AssetClass,
  Stock,
  AssetType,
  Market,
  StockPriceGraph,
  MarketState,
  EarningsTranscriptWithSummary,
  EarningsTranscriptListItem
} from "../client/stocks";
import "./client_test_suite";
import { Region, Locale } from "../client/collections";
import { PaginatedResponse } from "../client/capital_increase";

const mockStocksResponse = [
  {
    id: "61dd0d6f0ec2114146342fd0",
    assetType: AssetType.Stock,
    name: "Tüpraş",
    symbol: "TUPRS",
    sectorId: "sector123",
    industryId: "industry456",
    updatedDate: "2024-03-14T10:00:00Z",
    active: true
  }
];

const mockStockDetailResponse = {
  id: "61dd0d6f0ec2114146342fd0",
  assetType: AssetType.Stock,
  assetClass: AssetClass.Equity,
  name: "Tüpraş",
  symbol: "TUPRS",
  sectorId: "sector123",
  industryId: "industry456",
  updatedDate: "2024-03-14T10:00:00Z",
  dailyChange: 2.5,
  active: true,
  description: "Türkiye'nin en büyük rafineri şirketi",
  shortDescription: "Rafineri şirketi",
  region: Region.Tr,
  localized_description: {
    tr: "Türkiye'nin en büyük rafineri şirketi",
    en: "Turkey's largest refinery company"
  },
  localizedShortDescription: {
    tr: "Rafineri şirketi",
    en: "Refinery company"
  },
  markets: [Market.Yildiz]
};

const mockHistoricalPricesResponse: StockPriceGraph[] = [
  {
    symbol: "TUPRS",
    "1D": [
      { d: 1710374400000, c: 425.5, h: 428.0, l: 422.0, o: 423.0 },
      { d: 1710378000000, c: 426.8, h: 427.5, l: 425.0, o: 425.5 }
    ],
    "1W": [
      { d: 1709856000000, c: 420.5, h: 422.0, l: 419.0, o: 419.5 },
      { d: 1709942400000, c: 423.0, h: 424.5, l: 420.0, o: 420.5 }
    ],
    "1M": [
      { d: 1707436800000, c: 415.0, h: 416.5, l: 414.0, o: 414.5 },
      { d: 1707523200000, c: 417.2, h: 418.0, l: 415.0, o: 415.0 }
    ],
    "3M": [],
    "1Y": [],
    "2Y": [],
    "3Y": [],
    "5Y": []
  }
];

const mockStockRestrictionsResponse = [
  {
    id: 1,
    title: "Bedelli Sermaye Artırımı",
    description: "Şirket bedelli sermaye artırımı yapacaktır",
    symbol: "TUPRS",
    startDate: "2024-03-15T00:00:00Z",
    endDate: "2024-03-20T00:00:00Z",
    market: Market.Yildiz
  }
];

const mockTickRulesResponse = {
  basePrice: 425.5,
  additionalPrice: 0.1,
  lowerPriceLimit: 382.95,
  upperPriceLimit: 468.05,
  rules: [
    { priceFrom: 0, priceTo: 20, tickSize: 0.01 },
    { priceFrom: 20, priceTo: 50, tickSize: 0.02 },
    { priceFrom: 50, priceTo: 100, tickSize: 0.05 }
  ]
};

const mockEarningsTranscriptList: EarningsTranscriptListItem[] = [
  {
    symbol: "AAPL",
    year: 2024,
    quarter: 1,
    date: "2024-05-15",
    fiscal_year: 2024,
  },
  {
    symbol: "AAPL",
    year: 2023,
    quarter: 4,
    date: "2024-02-20",
    fiscal_year: 2023
  }
];

const mockEarningsTranscriptDetail: EarningsTranscriptWithSummary = {
  symbol: "AAPL",
  year: 2024,
  quarter: 1,
  date: "2024-05-15",
  content: "Q1 2024 earnings call transcript content...",
  summary: "Strong Q1 performance with 15% revenue growth",
  has_summary: true
};

const mockMarketStates: MarketState[] = [
  {
    id: 1,
    marketSymbol: "BIST",
    state: "OPEN",
    lastTimestamp: "2024-03-14T10:00:00Z",
    stockSymbol: "TUPRS"
  },
  {
    id: 2,
    marketSymbol: "BIST",
    state: "CLOSED",
    lastTimestamp: "2024-03-14T18:00:00Z",
    stockSymbol: "GARAN"
  }
];

const mockPaginatedMarketStates: PaginatedResponse<MarketState> = {
  recordCount: 2,
  items: mockMarketStates
};

const mockSingleMarketState: MarketState = {
  id: 1,
  marketSymbol: "BIST",
  state: "OPEN",
  lastTimestamp: "2024-03-14T10:00:00Z",
  stockSymbol: "TUPRS"
};

describe("Stocks Client", () => {
  let client: StockClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new StockClient(config, logger);
  });

  describe("Integration Tests", () => {
    describe("getAllStocks", () => {
      test("should return stocks list for TR region", async () => {
        const resp = await client.getAllStocks(Region.Tr);

        expect(resp).not.toBeEmpty();

        const firstStock = resp[0];
        expect(typeof firstStock.id).toBe("string");
        expect(typeof firstStock.assetType).toBe("string");
        expect(typeof firstStock.name).toBe("string");
        expect(typeof firstStock.symbol).toBe("string");
        expect(typeof firstStock.sectorId).toBe("string");
        expect(typeof firstStock.industryId).toBe("string");
        expect(typeof firstStock.updatedDate).toBe("string");
        expect(typeof firstStock.active).toBe("boolean");

        if (firstStock.dailyChange !== undefined) {
          expect(typeof firstStock.dailyChange).toBe("number");
        }
      });

      test("should handle pagination correctly", async () => {
        const resp = await client.getAllStocks(Region.Tr, 10, 10);

        expect(resp).not.toBeEmpty();
        expect(resp.length).toBeLessThanOrEqual(10);
      });
    });

    describe("getStockDetailById", () => {
      test("should return stock detail by ID", async () => {
        const resp = await client.getStockDetailById(
          "61dd0d6f0ec2114146342fd0",
          Locale.Tr
        );

        expect(resp).toBeDefined();
        expect(typeof resp.id).toBe("string");
        expect(typeof resp.assetClass).toBe("string");
        expect(typeof resp.description).toBe("string");
        expect(typeof resp.shortDescription).toBe("string");
        expect(typeof resp.region).toBe("string");
        expect(typeof resp.localized_description).toBe("object");
        expect(typeof resp.localizedShortDescription).toBe("object");

        if (resp.markets) {
          expect(Array.isArray(resp.markets)).toBe(true);
        }
      });
    });

    describe("getStockDetailBySymbol", () => {
      test("should return stock detail by symbol", async () => {
        const resp = await client.getStockDetailBySymbol(
          "TUPRS",
          AssetClass.Equity,
          Region.Tr,
          Locale.Tr
        );

        expect(resp).toBeDefined();
        expect(resp.symbol).toBe("TUPRS");
        expect(typeof resp.id).toBe("string");
        expect(typeof resp.assetClass).toBe("string");
        expect(typeof resp.description).toBe("string");
        expect(typeof resp.shortDescription).toBe("string");
        expect(typeof resp.region).toBe("string");
        expect(typeof resp.localized_description).toBe("object");
        expect(typeof resp.localizedShortDescription).toBe("object");
      });
    });

    describe("getHistoricalPrices", () => {
      test("should return historical prices for multiple symbols", async () => {
        const resp = await client.getHistoricalPrices(
          ["TUPRS", "SASA"],
          Region.Tr,
          [
            HistoricalPricePeriod.OneDay,
            HistoricalPricePeriod.OneWeek,
            HistoricalPricePeriod.OneMonth,
          ]
        );

        expect(resp).not.toBeEmpty();

        const firstPriceGraph = resp[0];
        expect(typeof firstPriceGraph.symbol).toBe("string");
        expect(Array.isArray(firstPriceGraph["1D"])).toBe(true);
        expect(Array.isArray(firstPriceGraph["1W"])).toBe(true);
        expect(Array.isArray(firstPriceGraph["1M"])).toBe(true);

        if (firstPriceGraph["1D"].length > 0) {
          const firstDataPoint = firstPriceGraph["1D"][0];
          expect(typeof firstDataPoint.d).toBe("number");
          expect(typeof firstDataPoint.c).toBe("number");
          expect(typeof firstDataPoint.h).toBe("number");
          expect(typeof firstDataPoint.l).toBe("number");
          expect(typeof firstDataPoint.o).toBe("number");
        }
      });
    });

    describe("getCustomHistoricalPrices", () => {
      test("should return custom historical prices", async () => {
        const resp = await client.getCustomHistoricalPrices(
          "TUPRS",
          Region.Tr,
          "2024-01-01",
          "2024-03-01",
          HistoricalPriceInterval.OneDay,
          false
        );

        expect(resp).not.toBeEmpty();

        const firstDataPoint = resp[0];
        expect(typeof firstDataPoint.d).toBe("number");
        expect(typeof firstDataPoint.c).toBe("number");
        expect(typeof firstDataPoint.h).toBe("number");
        expect(typeof firstDataPoint.l).toBe("number");
        expect(typeof firstDataPoint.o).toBe("number");
      });

      test("should handle detailed historical prices", async () => {
        const resp = await client.getCustomHistoricalPrices(
          "SASA",
          Region.Tr,
          "2024-01-01 10:00:00",
          "2024-01-05 10:00:00",
          HistoricalPriceInterval.OneHour,
          true
        );

        expect(resp).not.toBeEmpty();
        const firstDataPoint = resp[0];
        expect(typeof firstDataPoint.d).toBe("number");
        expect(typeof firstDataPoint.c).toBe("number");
        expect(typeof firstDataPoint.h).toBe("number");
        expect(typeof firstDataPoint.l).toBe("number");
        expect(typeof firstDataPoint.o).toBe("number");
        expect(typeof firstDataPoint.uc).toBe("number");
        expect(typeof firstDataPoint.uh).toBe("number");
        expect(typeof firstDataPoint.ul).toBe("number");
        expect(typeof firstDataPoint.uo).toBe("number");
        expect(typeof firstDataPoint.uv).toBe("number");
        expect(typeof firstDataPoint.v).toBe("number");
      });
    });

    describe("getStockRestrictions", () => {
      test("should return stock restrictions for specific symbol", async () => {
        const resp = await client.getStockRestrictions("TUPRS", Region.Tr);

        if (resp && resp.length > 0) {
          const firstRestriction = resp[0];
          expect(typeof firstRestriction.id).toBe("number");
          expect(typeof firstRestriction.title).toBe("string");
          expect(typeof firstRestriction.description).toBe("string");
          expect(typeof firstRestriction.startDate).toBe("string");
          expect(typeof firstRestriction.endDate).toBe("string");

          if (firstRestriction.symbol) {
            expect(typeof firstRestriction.symbol).toBe("string");
          }
          if (firstRestriction.market) {
            expect(typeof firstRestriction.market).toBe("string");
          }
        }
      });
    });

    describe("getAllStockRestrictions", () => {
      test("should return all stock restrictions for region", async () => {
        const resp = await client.getAllStockRestrictions();

        expect(Array.isArray(resp)).toBe(true);

        if (resp.length > 0) {
          const firstRestriction = resp[0];
          expect(typeof firstRestriction.id).toBe("number");
          expect(typeof firstRestriction.title).toBe("string");
          expect(typeof firstRestriction.description).toBe("string");
          expect(typeof firstRestriction.startDate).toBe("string");
          expect(typeof firstRestriction.endDate).toBe("string");
        }
      });
    });

    describe("getTickRules", () => {
      test("should return tick rules for symbol", async () => {
        const resp = await client.getTickRules("TUPRS", Region.Tr);

        expect(resp).toBeDefined();
        expect(typeof resp.basePrice).toBe("number");
        expect(typeof resp.additionalPrice).toBe("number");
        expect(typeof resp.lowerPriceLimit).toBe("number");
        expect(typeof resp.upperPriceLimit).toBe("number");

        if (resp.rules !== null) {
          expect(Array.isArray(resp.rules)).toBe(true);
          if (resp.rules.length > 0) {
            const firstRule = resp.rules[0]
            expect(firstRule).toBeDefined();
            expect(typeof firstRule.priceFrom).toBe("number");
            expect(typeof firstRule.priceTo).toBe("number");
            expect(typeof firstRule.tickSize).toBe("number");
          }
        }
      });
    });

    describe("getEarningsTranscripts", () => {
      test("should return earnings transcript list", async () => {
        const resp = await client.getEarningsTranscripts("AAPL", Region.Us);

        expect(Array.isArray(resp)).toBe(true);

        if (resp.length > 0) {
          const firstTranscript = resp[0];
          expect(typeof firstTranscript.symbol).toBe("string");
          expect(typeof firstTranscript.year).toBe("number");
          expect(typeof firstTranscript.quarter).toBe("number");
          expect(typeof firstTranscript.date).toBe("string");
          expect(typeof firstTranscript.fiscal_year).toBe("number");
        }
      });
    });

    describe("getEarningsTranscript", () => {
      test("should return earnings transcript detail", async () => {
        const resp = await client.getEarningsTranscript("AAPL", 2023, 4);

        expect(resp).toBeDefined();
        expect(typeof resp.symbol).toBe("string");
        expect(typeof resp.year).toBe("number");
        expect(typeof resp.quarter).toBe("number");
        expect(typeof resp.date).toBe("string");
        expect(typeof resp.content).toBe("string");
        expect(typeof resp.has_summary).toBe("boolean");

        if (resp.summary) {
          expect(typeof resp.summary).toBe("string");
        }
      });
    });

    describe("getStockStateAll", () => {
      test("should return paginated stock states", async () => {
        const resp = await client.getStockStateAll(0, 10, Region.Tr);

        expect(resp).toBeDefined();
        expect(Array.isArray(resp.items)).toBe(true);
        expect(typeof resp.recordCount).toBe("number");

        if (resp.items.length > 0) {
          const firstState = resp.items[0];
          expect(typeof firstState.id).toBe("number");
          expect(typeof firstState.state).toBe("string");
          expect(typeof firstState.lastTimestamp).toBe("string");
        }
      });
    });

    describe("getStockState", () => {
      test("should return single stock state", async () => {
        const resp = await client.getStockState("TUPRS");

        expect(resp).toBeDefined();
        expect(typeof resp.id).toBe("number");
        expect(typeof resp.state).toBe("string");
        expect(typeof resp.lastTimestamp).toBe("string");

        if (resp.stockSymbol) {
          expect(typeof resp.stockSymbol).toBe("string");
        }
        if (resp.marketSymbol) {
          expect(typeof resp.marketSymbol).toBe("string");
        }
      });
    });

    describe("getStateAll", () => {
      test("should return paginated market states", async () => {
        const resp = await client.getStateAll(0, 10, Region.Tr);

        expect(resp).toBeDefined();
        expect(Array.isArray(resp.items)).toBe(true);
        expect(typeof resp.recordCount).toBe("number");

        if (resp.items.length > 0) {
          const firstState = resp.items[0];
          expect(typeof firstState.id).toBe("number");
          expect(typeof firstState.state).toBe("string");
          expect(typeof firstState.lastTimestamp).toBe("string");
        }
      });
    });

    describe("getState", () => {
      test("should return single market state", async () => {
        const resp = await client.getState("BIST");

        expect(resp).toBeDefined();
        expect(typeof resp.id).toBe("number");
        expect(typeof resp.state).toBe("string");
        expect(typeof resp.lastTimestamp).toBe("string");

        if (resp.marketSymbol) {
          expect(typeof resp.marketSymbol).toBe("string");
        }
      });
    });
    describe("getStockChartImage", () => {
      test("should return chart image blob", async () => {
        const resp = await client.getStockChartImage({
          symbol: "TUPRS",
          region: Region.Tr,
        });
        expect(resp).toBeDefined();
        expect(resp).toBeInstanceOf(Blob);
        expect(resp.size).toBeGreaterThan(0);
      }, 30000);
    });
  });

  describe("Mock Tests (Data Injection)", () => {
    let client: StockClient;
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
  
      client = new StockClient(config, logger, cli as any);
    });
  
    test("getAllStocks: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockStocksResponse });
  
      const resp = await client.getAllStocks(Region.Tr);
  
      expect(cli.request).toHaveBeenCalledTimes(1);
      const call = cli.request.mock.calls[0][0];
  
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v2/stock/all");
      expect(call.params).toEqual({ region: Region.Tr });
  
      // raw match
      expect(resp).toEqual(mockStocksResponse);
    });
  
    test("getAllStocks: includes page/pageSize when provided (including 0)", async () => {
      cli.request.mockResolvedValueOnce({ data: mockStocksResponse });
  
      await client.getAllStocks(Region.Tr, 0, 0);
  
      const call = cli.request.mock.calls[0][0];
      expect(call.params).toEqual({ region: Region.Tr, page: 0, pageSize: 0 });
    });
  
    test("getStockDetailById: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockStockDetailResponse });
  
      const resp = await client.getStockDetailById("61dd0d6f0ec2114146342fd0", Locale.Tr);
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/stock/61dd0d6f0ec2114146342fd0");
      expect(call.params).toEqual({ locale: Locale.Tr });
  
      expect(resp).toEqual(mockStockDetailResponse);
    });
  
    test("getStockDetailBySymbol: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockStockDetailResponse });
  
      const resp = await client.getStockDetailBySymbol("TUPRS", AssetClass.Equity, Region.Tr, Locale.Tr);
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/stock/detail");
      expect(call.params).toEqual({
        symbol: "TUPRS",
        asset_class: AssetClass.Equity,
        region: Region.Tr,
        locale: Locale.Tr,
      });
  
      expect(resp).toEqual(mockStockDetailResponse);
    });
  
    test("getHistoricalPrices: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockHistoricalPricesResponse });
  
      const resp = await client.getHistoricalPrices(
        ["TUPRS"],
        Region.Tr,
        [HistoricalPricePeriod.OneDay, HistoricalPricePeriod.OneWeek, HistoricalPricePeriod.OneMonth]
      );
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/stock/price");
      expect(call.params).toEqual({
        symbols: "TUPRS",
        region: Region.Tr,
        keys: "1D,1W,1M",
      });
  
      expect(resp).toEqual(mockHistoricalPricesResponse);
    });
  
    test("getCustomHistoricalPrices: calls correct endpoint/params and matches raw response", async () => {
      const mockCustom = [{ d: 1, o: 1, h: 1, l: 1, c: 1 }];
      cli.request.mockResolvedValueOnce({ data: mockCustom });
  
      const resp = await client.getCustomHistoricalPrices(
        "TUPRS",
        Region.Tr,
        "2024-01-01",
        "2024-03-01",
        HistoricalPriceInterval.OneDay,
        false,
        10
      );
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/stock/price/interval");
      expect(call.params).toEqual({
        stock: "TUPRS",
        region: Region.Tr,
        fromDate: "2024-01-01",
        toDate: "2024-03-01",
        interval: HistoricalPriceInterval.OneDay,
        detail: false,
        numIntervals: 10,
      });
  
      expect(resp).toEqual(mockCustom);
    });
  
    test("getStockRestrictions: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockStockRestrictionsResponse });
  
      const resp = await client.getStockRestrictions("TUPRS", Region.Tr);
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/stock/restrictions");
      expect(call.params).toEqual({ symbol: "TUPRS", region: Region.Tr });
  
      expect(resp).toEqual(mockStockRestrictionsResponse);
    });
  
    test("getAllStockRestrictions: calls correct endpoint and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockStockRestrictionsResponse });
  
      const resp = await client.getAllStockRestrictions();
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/stock/restrictions/all");
      expect(call.params).toBeUndefined();
  
      expect(resp).toEqual(mockStockRestrictionsResponse);
    });
  
    test("getTickRules: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockTickRulesResponse });
  
      const resp = await client.getTickRules("TUPRS", Region.Tr);
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/stock/rules");
      expect(call.params).toEqual({ symbol: "TUPRS", region: Region.Tr });
  
      expect(resp).toEqual(mockTickRulesResponse);
    });
  
    test("getEarningsTranscripts: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockEarningsTranscriptList });
  
      const resp = await client.getEarningsTranscripts("AAPL", Region.Us);
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/earnings/transcripts");
      expect(call.params).toEqual({ symbol: "AAPL", region: Region.Us });
  
      expect(resp).toEqual(mockEarningsTranscriptList);
    });
  
    test("getEarningsTranscript: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockEarningsTranscriptDetail });
  
      const resp = await client.getEarningsTranscript("AAPL", 2024, 1);
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/earnings/transcript");
      expect(call.params).toEqual({ symbol: "AAPL", year: 2024, quarter: 1 });
  
      expect(resp).toEqual(mockEarningsTranscriptDetail);
    });
  
    test("getStockStateAll: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockPaginatedMarketStates });
  
      const resp = await client.getStockStateAll(0, 10, Region.Tr);
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/state/stock/all");
      expect(call.params).toEqual({ page: 0, size: 10, region: Region.Tr });
  
      expect(resp).toEqual(mockPaginatedMarketStates);
    });
  
    test("getStockState: calls correct endpoint and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockSingleMarketState });
  
      const resp = await client.getStockState("TUPRS");
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/state/stock/TUPRS");
      expect(call.params).toBeUndefined();
  
      expect(resp).toEqual(mockSingleMarketState);
    });
  
    test("getStateAll: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockPaginatedMarketStates });
  
      const resp = await client.getStateAll(0, 10, Region.Tr);
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/state/all");
      expect(call.params).toEqual({ page: 0, size: 10, region: Region.Tr });
  
      expect(resp).toEqual(mockPaginatedMarketStates);
    });
  
    test("getState: calls correct endpoint and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockSingleMarketState });
  
      const resp = await client.getState("BIST");
  
      const call = cli.request.mock.calls[0][0];
      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/state/BIST");
      expect(call.params).toBeUndefined();
  
      expect(resp).toEqual(mockSingleMarketState);
    });
  
    test("bubbles up request error", async () => {
      cli.request.mockRejectedValueOnce(new Error("API Error"));
  
      await expect(client.getAllStocks(Region.Tr)).rejects.toThrow("API Error");
      expect(cli.request).toHaveBeenCalledTimes(1);
    });

    test("getStockChartImage: calls correct endpoint/params and returns Blob", async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      cli.request.mockResolvedValueOnce({ data: mockArrayBuffer });

      const resp = await client.getStockChartImage({
        symbol: "TUPRS",
        region: Region.Tr,
      });

      expect(cli.request).toHaveBeenCalledTimes(1);
      const call = cli.request.mock.calls[0][0];

      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/stock/chart");
      expect(call.params).toEqual({ symbol: "TUPRS", region: Region.Tr });
      expect(call.responseType).toBe("arraybuffer");

      expect(resp).toBeInstanceOf(Blob);
      expect(resp.type).toBe("image/png");
    });

    test("getStockChartImage: includes optional params when provided", async () => {
      const mockArrayBuffer = new ArrayBuffer(8);
      cli.request.mockResolvedValueOnce({ data: mockArrayBuffer });

      await client.getStockChartImage({
        symbol: "TUPRS",
        region: Region.Tr,
        period: HistoricalPricePeriod.OneMonth,
        resolution: HistoricalPriceInterval.OneDay,
        indicators: ["RSI", "MACD"],
        chartType: 1,
      });

      const call = cli.request.mock.calls[0][0];
      expect(call.params).toEqual({
        symbol: "TUPRS",
        region: Region.Tr,
        period: HistoricalPricePeriod.OneMonth,
        resolution: HistoricalPriceInterval.OneDay,
        indicators: ["RSI", "MACD"],
        chartType: 1,
      });
    });

    test("getStockChartImage: bubbles up request error", async () => {
      cli.request.mockRejectedValueOnce(new Error("Failed to generate chart"));

      await expect(client.getStockChartImage({
        symbol: "INVALID",
        region: Region.Tr,
      })).rejects.toThrow("Failed to generate chart");

      expect(cli.request).toHaveBeenCalledTimes(1);
    });
  });  
});
