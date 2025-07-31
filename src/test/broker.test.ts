import { Logger } from "winston";
import { Region } from "../client/collections";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import {
  BrokerClient,
  BrokerSort,
  SortDirection,
  BrokerStats,
  Broker,
  BrokerStock,
  BrokerList,
  BrokerItem,
} from "../client/broker";
import { AssetType, AssetClass } from "../client/stocks";

const mockBroker: Broker = {
  id: 1001,
  symbol: "BIYKR",
  name: "BİYİKLI YATIRIM",
  longName: "Bıyıklı Yatırım Menkul Değerler A.Ş.",
  logo: "https://example.com/biykr.png"
};

const mockBroker2: Broker = {
  id: 1002,
  symbol: "GEDIK",
  name: "GEDİK YATIRIM",
  longName: "Gedik Yatırım Menkul Değerler A.Ş.",
  logo: "https://example.com/gedik.png"
};

const mockStock: BrokerStock = {
  id: "61dd0d6f0ec2114146342fd0",
  symbol: "TUPRS",
  name: "Tüpraş",
  assetType: AssetType.Stock,
  assetClass: AssetClass.Equity
};

const mockStock2: BrokerStock = {
  id: "61dd0d6f0ec2114146342fd1",
  symbol: "GARAN",
  name: "Garanti Bankası",
  assetType: AssetType.Stock,
  assetClass: AssetClass.Equity
};

const mockBrokerStats: BrokerStats = {
  totalBuyAmount: 1000000,
  totalSellAmount: 800000,
  netAmount: 200000,
  totalBuyVolume: 50000,
  totalSellVolume: 40000,
  totalVolume: 90000,
  totalAmount: 1800000,
  averageCost: 20.5
};

const mockBrokerItem: BrokerItem = {
  ...mockBrokerStats,
  broker: mockBroker,
  stock: mockStock
};

const mockBrokerItem2: BrokerItem = {
  ...mockBrokerStats,
  totalBuyAmount: 900000,
  totalSellAmount: 700000,
  broker: mockBroker2,
  stock: mockStock2
};

const mockBrokerList: BrokerList = {
  recordCount: 2,
  items: [mockBrokerItem, mockBrokerItem2],
  totalStats: mockBrokerStats
};

describe("BrokerClient", () => {
  let brokerClient: BrokerClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;

    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    brokerClient = new BrokerClient(config, logger);
  });

  const region = Region.Tr;
  const fromDate = "2025-05-20";
  const toDate = "2025-05-28";

  describe("Integration Tests", () => {
    test("getMarketBrokers returns valid and fully typed data", async () => {
      const response = await brokerClient.getMarketBrokers(
        Region.Tr,
        BrokerSort.TotalVolume,
        SortDirection.Desc,
        "2025-05-27",
        "2025-05-28",
        0,
        5
      );

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");

      const stats = response.totalStats;
      expect(stats).toMatchObject<BrokerStats>({
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
      });

      expect(Array.isArray(response.items)).toBe(true);
      expect(response.items.length).toBeGreaterThan(0);

      for (const item of response.items) {
        expect(item).toMatchObject<BrokerStats>({
          totalBuyAmount: expect.any(Number),
          totalSellAmount: expect.any(Number),
          netAmount: expect.any(Number),
          totalBuyVolume: expect.any(Number),
          totalSellVolume: expect.any(Number),
          totalVolume: expect.any(Number),
          totalAmount: expect.any(Number),
        });

        if (item.broker) {
          expect(item.broker).toMatchObject({
            id: expect.any(Number),
            symbol: expect.any(String),
            name: expect.any(String),
            longName: expect.any(String),
            logo: expect.any(String),
          });
        }
      }
    });

    test("getMarketStocks returns valid stock data", async () => {
      const response = await brokerClient.getMarketStocks(
        region,
        BrokerSort.TotalVolume,
        SortDirection.Desc,
        fromDate,
        toDate,
        0,
        5
      );

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");

      const stats = response.totalStats;
      expect(stats).toMatchObject<BrokerStats>({
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
      });

      expect(Array.isArray(response.items)).toBe(true);

      for (const item of response.items) {
        expect(item).toMatchObject<BrokerStats>({
          totalBuyAmount: expect.any(Number),
          totalSellAmount: expect.any(Number),
          netAmount: expect.any(Number),
          totalBuyVolume: expect.any(Number),
          totalSellVolume: expect.any(Number),
          totalVolume: expect.any(Number),
          totalAmount: expect.any(Number),
        });

        if (item.stock) {
          expect(item.stock).toMatchObject({
            id: expect.any(String),
            symbol: expect.any(String),
            name: expect.any(String),
            assetType: expect.any(String),
            assetClass: expect.any(String),
          });
        }
      }
    });

    test("getBrokersByStock returns brokers for specific stock", async () => {
      const response = await brokerClient.getBrokersByStock(
        "TUPRS",
        region,
        BrokerSort.TotalVolume,
        SortDirection.Desc,
        fromDate,
        toDate,
        0,
        5
      );

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");

      const stats = response.totalStats;
      expect(stats).toMatchObject<BrokerStats>({
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
      });

      expect(Array.isArray(response.items)).toBe(true);

      for (const item of response.items) {
        expect(item).toMatchObject<BrokerStats>({
          totalBuyAmount: expect.any(Number),
          totalSellAmount: expect.any(Number),
          netAmount: expect.any(Number),
          totalBuyVolume: expect.any(Number),
          totalSellVolume: expect.any(Number),
          totalVolume: expect.any(Number),
          totalAmount: expect.any(Number),
        });

        if (item.broker) {
          expect(item.broker).toMatchObject({
            id: expect.any(Number),
            symbol: expect.any(String),
            name: expect.any(String),
            longName: expect.any(String),
            logo: expect.any(String),
          });
        }

        if ("averageCost" in item) {
          expect(item.averageCost).toEqual(expect.any(Number));
        }
      }
    });

    test("getStocksByBroker returns stocks for specific broker", async () => {
      const response = await brokerClient.getStocksByBroker(
        "BIYKR",
        region,
        BrokerSort.TotalVolume,
        SortDirection.Desc,
        fromDate,
        toDate,
        0,
        5
      );

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");

      const stats = response.totalStats;
      expect(stats).toMatchObject<BrokerStats>({
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
      });

      expect(Array.isArray(response.items)).toBe(true);

      for (const item of response.items) {
        expect(item).toMatchObject<BrokerStats>({
          totalBuyAmount: expect.any(Number),
          totalSellAmount: expect.any(Number),
          netAmount: expect.any(Number),
          totalBuyVolume: expect.any(Number),
          totalSellVolume: expect.any(Number),
          totalVolume: expect.any(Number),
          totalAmount: expect.any(Number),
        });

        if (item.stock) {
          expect(item.stock).toMatchObject({
            id: expect.any(String),
            symbol: expect.any(String),
            name: expect.any(String),
            assetType: expect.any(String),
            assetClass: expect.any(String),
          });
        }
      }
    });
  });

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getMarketBrokers", () => {
      test("should return market brokers with stats", async () => {
        jest.spyOn(brokerClient, 'getMarketBrokers').mockResolvedValue(mockBrokerList);

        const response = await brokerClient.getMarketBrokers(
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        );

        expect(response.recordCount).toBe(2);
        expect(response.items).toHaveLength(2);
        expect(response.totalStats).toEqual(mockBrokerStats);

        const firstItem = response.items[0];
        expect(firstItem.broker?.symbol).toBe("BIYKR");
        expect(firstItem.totalBuyAmount).toBe(1000000);
        expect(firstItem.totalSellAmount).toBe(800000);

        expect(brokerClient.getMarketBrokers).toHaveBeenCalledWith(
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        );
      });

      test("should handle empty response", async () => {
        const emptyResponse: BrokerList = {
          recordCount: 0,
          items: [],
          totalStats: {
            totalBuyAmount: 0,
            totalSellAmount: 0,
            netAmount: 0,
            totalBuyVolume: 0,
            totalSellVolume: 0,
            totalVolume: 0,
            totalAmount: 0
          }
        };
        jest.spyOn(brokerClient, 'getMarketBrokers').mockResolvedValue(emptyResponse);

        const response = await brokerClient.getMarketBrokers(
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        );

        expect(response.recordCount).toBe(0);
        expect(response.items).toHaveLength(0);
        expect(response.totalStats.totalAmount).toBe(0);
      });
    });

    describe("getMarketStocks", () => {
      test("should return market stocks with stats", async () => {
        jest.spyOn(brokerClient, 'getMarketStocks').mockResolvedValue(mockBrokerList);

        const response = await brokerClient.getMarketStocks(
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        );

        expect(response.recordCount).toBe(2);
        expect(response.items).toHaveLength(2);
        expect(response.totalStats).toEqual(mockBrokerStats);

        const firstItem = response.items[0];
        expect(firstItem.stock?.symbol).toBe("TUPRS");
        expect(firstItem.stock?.assetType).toBe(AssetType.Stock);
        expect(firstItem.stock?.assetClass).toBe(AssetClass.Equity);

        expect(brokerClient.getMarketStocks).toHaveBeenCalledWith(
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        );
      });
    });

    describe("getBrokersByStock", () => {
      test("should return brokers for specific stock", async () => {
        jest.spyOn(brokerClient, 'getBrokersByStock').mockResolvedValue(mockBrokerList);

        const response = await brokerClient.getBrokersByStock(
          "TUPRS",
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        );

        expect(response.recordCount).toBe(2);
        expect(response.items).toHaveLength(2);
        expect(response.totalStats).toEqual(mockBrokerStats);

        const firstItem = response.items[0];
        expect(firstItem.broker?.symbol).toBe("BIYKR");
        expect(firstItem.averageCost).toBe(20.5);

        expect(brokerClient.getBrokersByStock).toHaveBeenCalledWith(
          "TUPRS",
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        );
      });

      test("should handle invalid stock symbol", async () => {
        jest.spyOn(brokerClient, 'getBrokersByStock').mockRejectedValue(new Error("Invalid stock symbol"));

        await expect(brokerClient.getBrokersByStock(
          "INVALID",
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        )).rejects.toThrow("Invalid stock symbol");
      });
    });

    describe("getStocksByBroker", () => {
      test("should return stocks for specific broker", async () => {
        jest.spyOn(brokerClient, 'getStocksByBroker').mockResolvedValue(mockBrokerList);

        const response = await brokerClient.getStocksByBroker(
          "BIYKR",
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        );

        expect(response.recordCount).toBe(2);
        expect(response.items).toHaveLength(2);
        expect(response.totalStats).toEqual(mockBrokerStats);

        const firstItem = response.items[0];
        expect(firstItem.stock?.symbol).toBe("TUPRS");
        expect(firstItem.stock?.assetType).toBe(AssetType.Stock);

        expect(brokerClient.getStocksByBroker).toHaveBeenCalledWith(
          "BIYKR",
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        );
      });

      test("should handle invalid broker symbol", async () => {
        jest.spyOn(brokerClient, 'getStocksByBroker').mockRejectedValue(new Error("Invalid broker symbol"));

        await expect(brokerClient.getStocksByBroker(
          "INVALID",
          Region.Tr,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          0,
          5
        )).rejects.toThrow("Invalid broker symbol");
      });
    });
  });
});