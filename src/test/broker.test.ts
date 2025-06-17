import { Logger } from "winston";
import { Region } from "../client/collections";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import {
  BaseBrokerStats,
  BrokerClient,
  BrokerSort,
  BrokerStats,
  BrokerStockStats,
  StockBrokerStats,
  StockOverallStats,
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
      "2025-05-27",
      "2025-05-28",
      BrokerSort.Volume,
      0,
      5
    );

    expect(response).toBeDefined();
    expect(typeof response.recordCount).toBe("number");

    const stats = response.totalStats;
    expect(stats).toMatchObject<BaseBrokerStats>({
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
        broker: {
          id: expect.any(Number),
          symbol: expect.any(String),
          name: expect.any(String),
          longName: expect.any(String),
          logo: expect.any(String),
        },
      });
    }
  });

  test("getTopMarketBrokers returns fully typed top and rest stats", async () => {
    const response = await brokerClient.getTopMarketBrokers(
      region,
      fromDate,
      toDate,
      BrokerSort.Volume
    );

    expect(response).toBeDefined();

    const statsList = [response.topStats, response.restStats];
    for (const stats of statsList) {
      expect(stats).toMatchObject<BaseBrokerStats>({
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
      });
    }

    expect(Array.isArray(response.topItems)).toBe(true);
    expect(response.topItems.length).toBeGreaterThan(0);

    for (const item of response.topItems) {
      expect(item).toMatchObject<BrokerStats>({
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
        broker: {
          id: expect.any(Number),
          symbol: expect.any(String),
          name: expect.any(String),
          longName: expect.any(String),
          logo: expect.any(String),
        },
      });
    }
  });

  test("getStockBrokers returns full broker stats with averageCost", async () => {
    const response = await brokerClient.getStockBrokers(
      region,
      fromDate,
      toDate,
      BrokerSort.Volume,
      "TUPRS",
      0,
      5
    );

    expect(response).toBeDefined();
    expect(typeof response.recordCount).toBe("number");

    expect(response.totalStats).toMatchObject<StockOverallStats>({
      totalBuyAmount: expect.any(Number),
      totalSellAmount: expect.any(Number),
      netAmount: expect.any(Number),
      totalBuyVolume: expect.any(Number),
      totalSellVolume: expect.any(Number),
      totalVolume: expect.any(Number),
      totalAmount: expect.any(Number),
      averageCost: expect.any(Number),
    });

    for (const item of response.items) {
      expect(item).toMatchObject<StockBrokerStats>({
        averageCost: expect.any(Number),
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
        broker: {
          id: expect.any(Number),
          symbol: expect.any(String),
          name: expect.any(String),
          longName: expect.any(String),
          logo: expect.any(String),
        },
      });
    }
  });

  test("getTopStockBrokers returns fully typed top & rest stats with averageCost", async () => {
    const response = await brokerClient.getTopStockBrokers(
      region,
      fromDate,
      toDate,
      BrokerSort.Volume,
      "TUPRS"
    );

    expect(response).toBeDefined();

    for (const stats of [response.topStats, response.restStats]) {
      expect(stats).toMatchObject<StockOverallStats>({
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
        averageCost: expect.any(Number),
      });
    }

    for (const item of response.topItems) {
      expect(item).toMatchObject<StockBrokerStats>({
        averageCost: expect.any(Number),
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
        broker: {
          id: expect.any(Number),
          symbol: expect.any(String),
          name: expect.any(String),
          longName: expect.any(String),
          logo: expect.any(String),
        },
      });
    }
  });

  test("getTopBrokersForBroker returns top brokers without averageCost", async () => {
    const response = await brokerClient.getTopStocksForBroker(
      region,
      fromDate,
      toDate,
      BrokerSort.Volume,
      "BIYKR"
    );

    expect(response).toBeDefined();

    for (const stats of [response.topStats, response.restStats]) {
      expect(stats).toMatchObject<BaseBrokerStats>({
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
      });
    }

    for (const item of response.topItems) {
      expect(item).toMatchObject<BrokerStockStats>({
        totalBuyAmount: expect.any(Number),
        totalSellAmount: expect.any(Number),
        netAmount: expect.any(Number),
        totalBuyVolume: expect.any(Number),
        totalSellVolume: expect.any(Number),
        totalVolume: expect.any(Number),
        totalAmount: expect.any(Number),
        stock: {
          id: expect.any(String),
          symbol: expect.any(String),
          name: expect.any(String),
          assetType: expect.any(String),
          assetClass: expect.any(String),
          region: expect.any(String),
        },
      });
    }
  });
});
