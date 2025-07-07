import { Logger } from "winston";
import { Region } from "../client/collections";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import {
  BrokerClient,
  BrokerSort,
  SortDirection,
  BrokerStats,
} from "../client/broker";

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
