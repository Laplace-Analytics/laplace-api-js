import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  StockClient,
  HistoricalPricePeriod,
  HistoricalPriceInterval,
  AssetClass,
} from "../client/stocks";
import "./client_test_suite";
import { Region, Locale } from "../client/collections";

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
      expect(typeof resp.assetClass).toBe("string");
      expect(typeof resp.description).toBe("string");
      expect(typeof resp.region).toBe("string");
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
      const resp = await client.getAllStockRestrictions(Region.Tr);

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
      }
    });
  });
});
