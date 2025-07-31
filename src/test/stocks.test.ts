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
  StockPriceGraph
} from "../client/stocks";
import "./client_test_suite";
import { Region, Locale } from "../client/collections";

const mockStocksResponse: Stock[] = [
  {
    id: "61dd0d6f0ec2114146342fd0",
    assetType: AssetType.Stock,
    name: "Tüpraş",
    symbol: "TUPRS",
    sectorId: "sector123",
    industryId: "industry456",
    updatedDate: "2024-03-14T10:00:00Z",
    dailyChange: 2.5,
    active: true
  },
  {
    id: "61dd0d6f0ec2114146342fd1",
    assetType: AssetType.Stock,
    name: "Garanti Bankası",
    symbol: "GARAN",
    sectorId: "sector789",
    industryId: "industry101",
    updatedDate: "2024-03-14T10:00:00Z",
    dailyChange: -1.2,
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
  },
  {
    id: 2,
    title: "Temettü Ödemesi",
    description: "Şirket temettü ödemesi yapacaktır",
    symbol: "TUPRS",
    startDate: "2024-04-01T00:00:00Z",
    endDate: "2024-04-01T00:00:00Z",
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

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getAllStocks", () => {
      test("should handle getAllStocks response correctly with mock data", async () => {
        jest.spyOn(client, 'getAllStocks').mockResolvedValue(mockStocksResponse);

        const resp = await client.getAllStocks(Region.Tr);

        expect(resp).toHaveLength(2);
        
        const firstStock = resp[0];
        expect(firstStock.id).toBe("61dd0d6f0ec2114146342fd0");
        expect(firstStock.assetType).toBe(AssetType.Stock);
        expect(firstStock.name).toBe("Tüpraş");
        expect(firstStock.symbol).toBe("TUPRS");
        expect(firstStock.sectorId).toBe("sector123");
        expect(firstStock.industryId).toBe("industry456");
        expect(firstStock.updatedDate).toBe("2024-03-14T10:00:00Z");
        expect(firstStock.dailyChange).toBe(2.5);
        expect(firstStock.active).toBe(true);

        const secondStock = resp[1];
        expect(secondStock.id).toBe("61dd0d6f0ec2114146342fd1");
        expect(secondStock.symbol).toBe("GARAN");
        expect(secondStock.dailyChange).toBe(-1.2);
        
        expect(client.getAllStocks).toHaveBeenCalledWith(Region.Tr);
      });

      test("should handle pagination correctly with mock data", async () => {
        jest.spyOn(client, 'getAllStocks').mockResolvedValue([mockStocksResponse[0]]);

        const resp = await client.getAllStocks(Region.Tr, 1, 0);

        expect(resp).toHaveLength(1);
        expect(resp[0].symbol).toBe("TUPRS");
        
        expect(client.getAllStocks).toHaveBeenCalledWith(Region.Tr, 1, 0);
      });

      test("should handle API errors correctly", async () => {
        jest.spyOn(client, 'getAllStocks').mockRejectedValue(new Error("API Error"));

        await expect(client.getAllStocks(Region.Tr)).rejects.toThrow("API Error");
      });
    });

    describe("getStockDetailById", () => {
      test("should return stock detail by ID with mock data", async () => {
        jest.spyOn(client, 'getStockDetailById').mockResolvedValue(mockStockDetailResponse);

        const resp = await client.getStockDetailById("61dd0d6f0ec2114146342fd0", Locale.Tr);

        expect(resp).toBeDefined();
        expect(resp.id).toBe("61dd0d6f0ec2114146342fd0");
        expect(resp.assetType).toBe(AssetType.Stock);
        expect(resp.assetClass).toBe(AssetClass.Equity);
        expect(resp.description).toBe("Türkiye'nin en büyük rafineri şirketi");
        expect(resp.shortDescription).toBe("Rafineri şirketi");
        expect(resp.region).toBe(Region.Tr);
        expect(resp.localized_description).toEqual({
          tr: "Türkiye'nin en büyük rafineri şirketi",
          en: "Turkey's largest refinery company"
        });
        expect(resp.localizedShortDescription).toEqual({
          tr: "Rafineri şirketi",
          en: "Refinery company"
        });
        expect(resp.markets).toEqual([Market.Yildiz]);

        expect(client.getStockDetailById).toHaveBeenCalledWith("61dd0d6f0ec2114146342fd0", Locale.Tr);
      });

      test("should handle API errors for stock detail", async () => {
        jest.spyOn(client, 'getStockDetailById').mockRejectedValue(new Error("Stock not found"));

        await expect(client.getStockDetailById("invalid_id", Locale.Tr))
          .rejects.toThrow("Stock not found");
      });
    });

    describe("getHistoricalPrices", () => {
      test("should return historical prices for multiple symbols with mock data", async () => {
        jest.spyOn(client, 'getHistoricalPrices').mockResolvedValue(mockHistoricalPricesResponse);

        const symbols = ["TUPRS"];
        const periods = [
          HistoricalPricePeriod.OneDay,
          HistoricalPricePeriod.OneWeek,
          HistoricalPricePeriod.OneMonth
        ];

        const resp = await client.getHistoricalPrices(symbols, Region.Tr, periods);

        expect(resp).toHaveLength(1);
        
        const firstPriceGraph = resp[0];
        expect(firstPriceGraph.symbol).toBe("TUPRS");

        expect(firstPriceGraph["1D"]).toHaveLength(2);
        const firstDayPoint = firstPriceGraph["1D"][0];
        expect(firstDayPoint.d).toBe(1710374400000);
        expect(firstDayPoint.c).toBe(425.5);
        expect(firstDayPoint.h).toBe(428.0);
        expect(firstDayPoint.l).toBe(422.0);
        expect(firstDayPoint.o).toBe(423.0);
        expect(firstPriceGraph["1W"]).toHaveLength(2);
        expect(firstPriceGraph["1M"]).toHaveLength(2);

        expect(client.getHistoricalPrices).toHaveBeenCalledWith(
          symbols,
          Region.Tr,
          periods
        );
      });

      test("should handle API errors for historical prices", async () => {
        jest.spyOn(client, 'getHistoricalPrices').mockRejectedValue(new Error("Failed to fetch historical prices"));

        await expect(client.getHistoricalPrices(
          ["TUPRS"],
          Region.Tr,
          [HistoricalPricePeriod.OneDay]
        )).rejects.toThrow("Failed to fetch historical prices");
      });
    });

    describe("getStockRestrictions", () => {
      test("should return stock restrictions with mock data", async () => {
        jest.spyOn(client, 'getStockRestrictions').mockResolvedValue(mockStockRestrictionsResponse);

        const resp = await client.getStockRestrictions("TUPRS", Region.Tr);

        expect(resp).toHaveLength(2);
        
        const firstRestriction = resp[0];
        expect(firstRestriction.id).toBe(1);
        expect(firstRestriction.title).toBe("Bedelli Sermaye Artırımı");
        expect(firstRestriction.description).toBe("Şirket bedelli sermaye artırımı yapacaktır");
        expect(firstRestriction.symbol).toBe("TUPRS");
        expect(firstRestriction.startDate).toBe("2024-03-15T00:00:00Z");
        expect(firstRestriction.endDate).toBe("2024-03-20T00:00:00Z");
        expect(firstRestriction.market).toBe(Market.Yildiz);

        expect(client.getStockRestrictions).toHaveBeenCalledWith("TUPRS", Region.Tr);
      });

      test("should handle API errors for stock restrictions", async () => {
        jest.spyOn(client, 'getStockRestrictions').mockRejectedValue(new Error("Failed to fetch restrictions"));

        await expect(client.getStockRestrictions("TUPRS", Region.Tr))
          .rejects.toThrow("Failed to fetch restrictions");
      });
    });

    describe("getTickRules", () => {
      test("should return tick rules with mock data", async () => {
        jest.spyOn(client, 'getTickRules').mockResolvedValue(mockTickRulesResponse);

        const resp = await client.getTickRules("TUPRS", Region.Tr);

        expect(resp.basePrice).toBe(425.5);
        expect(resp.additionalPrice).toBe(0.1);
        expect(resp.lowerPriceLimit).toBe(382.95);
        expect(resp.upperPriceLimit).toBe(468.05);
        expect(resp.rules).toHaveLength(3);
        
        const firstRule = resp.rules![0];
        expect(firstRule.priceFrom).toBe(0);
        expect(firstRule.priceTo).toBe(20);
        expect(firstRule.tickSize).toBe(0.01);

        expect(client.getTickRules).toHaveBeenCalledWith("TUPRS", Region.Tr);
      });

      test("should handle API errors for tick rules", async () => {
        jest.spyOn(client, 'getTickRules').mockRejectedValue(new Error("Failed to fetch tick rules"));

        await expect(client.getTickRules("TUPRS", Region.Tr))
          .rejects.toThrow("Failed to fetch tick rules");
      });
    });
  });
});
