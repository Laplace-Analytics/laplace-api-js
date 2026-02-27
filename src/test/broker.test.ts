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
import { PaginatedResponse } from "../client/capital_increase";
import { AxiosInstance } from "axios";

const fxGetMarketBrokers = {
  recordCount: 2,
  items: [
    {
      broker: {
        id: 1,
        symbol: "BIDZY",
        name: "DENIZ YATIRIM",
        longName: "DENIZ YATIRIM MENKUL KIYMETLER A.S.",
        logo: "https://finfree-storage.s3.eu-central-1.amazonaws.com/brokers/BIDZY.svg",
      },
      netAmount: 2500000.0,
      totalAmount: 10000000.0,
      totalVolume: 200000,
      totalBuyAmount: 6250000.0,
      totalBuyVolume: 100000,
      totalSellAmount: 3750000.0,
      totalSellVolume: 100000,
    },
  ],
  totalStats: {
    netAmount: 4000000.0,
    totalAmount: 17500000.0,
    totalVolume: 350000,
    totalBuyAmount: 10750000.0,
    totalBuyVolume: 175000,
    totalSellAmount: 6750000.0,
    totalSellVolume: 175000,
  },
};


const fxGetMarketStocks = {
  recordCount: 2,
  items: [
    {
      stock: {
        id: "61dd0d670ec2114146342fa5",
        name: "SASA Polyester",
        symbol: "SASA",
        assetType: AssetType.Stock,
        assetClass: AssetClass.Equity,
      },
      averageCost: 2.91,
      netAmount: 1000000.0,
      totalAmount: 5000000.0,
      totalVolume: 100000,
      totalBuyAmount: 3000000.0,
      totalBuyVolume: 50000,
      totalSellAmount: 2000000.0,
      totalSellVolume: 50000,
    },
  ],
  totalStats: {
    averageCost: 2.91,
    netAmount: 1750000.0,
    totalAmount: 8750000.0,
    totalVolume: 175000,
    totalBuyAmount: 5250000.0,
    totalBuyVolume: 87500,
    totalSellAmount: 3500000.0,
    totalSellVolume: 87500,
  },
};


const fxGetBrokersByStock = {
  recordCount: 2,
  items: [
    {
      broker: {
        id: 1,
        symbol: "BIMLB",
        name: "BIMLB",
        longName: "BIM Yatırım Menkul Değerler A.Ş.",
        logo: "https://finfree-storage.s3.eu-central-1.amazonaws.com/broker-logos/bimlb.png",
      },
      averageCost: 2.91,
      netAmount: 500000.0,
      totalAmount: 2000000.0,
      totalVolume: 40000,
      totalBuyAmount: 1250000.0,
      totalBuyVolume: 20000,
      totalSellAmount: 750000.0,
      totalSellVolume: 20000,
    },
  ],
  totalStats: {
    averageCost: 2.91,
    netAmount: 800000.0,
    totalAmount: 3500000.0,
    totalVolume: 70000,
    totalBuyAmount: 2150000.0,
    totalBuyVolume: 35000,
    totalSellAmount: 1350000.0,
    totalSellVolume: 35000,
  },
};


const fxGetStocksByBroker = {
  recordCount: 2,
  items: [
    {
      stock: {
        id: "61dd0d670ec2114146342fa5",
        name: "SASA Polyester",
        symbol: "SASA",
        assetType: AssetType.Stock,
        assetClass: AssetClass.Equity,
      },
      netAmount: 500000.0,
      totalAmount: 2000000.0,
      totalVolume: 40000,
      totalBuyAmount: 1250000.0,
      totalBuyVolume: 20000,
      totalSellAmount: 750000.0,
      totalSellVolume: 20000,
    },
  ],
  totalStats: {
    netAmount: 800000.0,
    totalAmount: 3500000.0,
    totalVolume: 70000,
    totalBuyAmount: 2150000.0,
    totalBuyVolume: 35000,
    totalSellAmount: 1350000.0,
    totalSellVolume: 35000,
  },
};

const fxGetBrokers = {
  recordCount: 239,
  items: [
    {
      id: 1,
      symbol: "BIDZY",
      name: "DENIZ YATIRIM",
      longName: "DENIZ YATIRIM MENKUL KIYMETLER A.S.",
      logo: "https://finfree-storage.s3.eu-central-1.amazonaws.com/brokers/BIDZY.svg",
      supportedAssetClasses: [AssetClass.Equity],
    },
  ],
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
  const fromDate = "2025-06-01";
  const toDate = "2025-06-30";

  describe("Integration Tests", () => {
    jest.setTimeout(60_000);
    test("getMarketBrokers returns valid data", async () => {
      const response = await brokerClient.getMarketBrokers(
        Region.Tr,
        BrokerSort.TotalVolume,
        SortDirection.Desc,
        "2025-05-27",
        "2025-05-28",
        5,
        0
      );

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");
      expect(response.recordCount).toBeGreaterThanOrEqual(0);

      const stats = response.totalStats;
      expect(typeof stats.totalBuyAmount).toBe("number");
      expect(typeof stats.totalSellAmount).toBe("number");
      expect(typeof stats.netAmount).toBe("number");
      expect(typeof stats.totalBuyVolume).toBe("number");
      expect(typeof stats.totalSellVolume).toBe("number");
      expect(typeof stats.totalVolume).toBe("number");
      expect(typeof stats.totalAmount).toBe("number");

      expect(Array.isArray(response.items)).toBe(true);

      if (response.items.length > 0) {
        const item = response.items[0];

        expect(typeof item.totalBuyAmount).toBe("number");
        expect(typeof item.totalSellAmount).toBe("number");
        expect(typeof item.netAmount).toBe("number");
        expect(typeof item.totalBuyVolume).toBe("number");
        expect(typeof item.totalSellVolume).toBe("number");
        expect(typeof item.totalVolume).toBe("number");
        expect(typeof item.totalAmount).toBe("number");

        if (item.broker) {
          expect(typeof item.broker.id).toBe("number");
          expect(typeof item.broker.symbol).toBe("string");
          expect(typeof item.broker.name).toBe("string");
          expect(typeof item.broker.longName).toBe("string");
          // python tarafında logo None olabilir kuralı vardı -> burada da izin ver
          expect(
            typeof item.broker.logo === "string" || item.broker.logo == null
          ).toBe(true);
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
        5,
        0
      );

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");
      expect(response.recordCount).toBeGreaterThanOrEqual(0);

      const stats = response.totalStats;
      expect(typeof stats.totalBuyAmount).toBe("number");
      expect(typeof stats.totalSellAmount).toBe("number");
      expect(typeof stats.netAmount).toBe("number");
      expect(typeof stats.totalBuyVolume).toBe("number");
      expect(typeof stats.totalSellVolume).toBe("number");
      expect(typeof stats.totalVolume).toBe("number");
      expect(typeof stats.totalAmount).toBe("number");

      expect(Array.isArray(response.items)).toBe(true);

      if (response.items.length > 0) {
        const item = response.items[0];

        expect(typeof item.totalBuyAmount).toBe("number");
        expect(typeof item.totalSellAmount).toBe("number");
        expect(typeof item.netAmount).toBe("number");
        expect(typeof item.totalBuyVolume).toBe("number");
        expect(typeof item.totalSellVolume).toBe("number");
        expect(typeof item.totalVolume).toBe("number");
        expect(typeof item.totalAmount).toBe("number");

        if (item.stock) {
          expect(typeof item.stock.id).toBe("string");
          expect(typeof item.stock.symbol).toBe("string");
          expect(typeof item.stock.name).toBe("string");
          expect(typeof item.stock.assetType).toBe("string");
          expect(typeof item.stock.assetClass).toBe("string");
        }

        // bu endpoint averageCost döndürüyorsa kontrol et (python’da market stock list’te vardı)
        if ("averageCost" in item) {
          expect(typeof (item as any).averageCost).toBe("number");
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
        5,
        0
      );

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");
      expect(response.recordCount).toBeGreaterThanOrEqual(0);

      const stats = response.totalStats;
      expect(typeof stats.totalBuyAmount).toBe("number");
      expect(typeof stats.totalSellAmount).toBe("number");
      expect(typeof stats.netAmount).toBe("number");
      expect(typeof stats.totalBuyVolume).toBe("number");
      expect(typeof stats.totalSellVolume).toBe("number");
      expect(typeof stats.totalVolume).toBe("number");
      expect(typeof stats.totalAmount).toBe("number");

      expect(Array.isArray(response.items)).toBe(true);

      if (response.items.length > 0) {
        const item = response.items[0];

        expect(typeof item.totalBuyAmount).toBe("number");
        expect(typeof item.totalSellAmount).toBe("number");
        expect(typeof item.netAmount).toBe("number");
        expect(typeof item.totalBuyVolume).toBe("number");
        expect(typeof item.totalSellVolume).toBe("number");
        expect(typeof item.totalVolume).toBe("number");
        expect(typeof item.totalAmount).toBe("number");

        if (item.broker) {
          expect(typeof item.broker.id).toBe("number");
          expect(typeof item.broker.symbol).toBe("string");
          expect(typeof item.broker.name).toBe("string");
          expect(typeof item.broker.longName).toBe("string");
          expect(
            typeof item.broker.logo === "string" || item.broker.logo == null
          ).toBe(true);
        }

        if ("averageCost" in item) {
          expect(typeof (item as any).averageCost).toBe("number");
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
        5,
        0
      );

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");
      expect(response.recordCount).toBeGreaterThanOrEqual(0);

      const stats = response.totalStats;
      expect(typeof stats.totalBuyAmount).toBe("number");
      expect(typeof stats.totalSellAmount).toBe("number");
      expect(typeof stats.netAmount).toBe("number");
      expect(typeof stats.totalBuyVolume).toBe("number");
      expect(typeof stats.totalSellVolume).toBe("number");
      expect(typeof stats.totalVolume).toBe("number");
      expect(typeof stats.totalAmount).toBe("number");

      expect(Array.isArray(response.items)).toBe(true);

      if (response.items.length > 0) {
        const item = response.items[0];

        expect(typeof item.totalBuyAmount).toBe("number");
        expect(typeof item.totalSellAmount).toBe("number");
        expect(typeof item.netAmount).toBe("number");
        expect(typeof item.totalBuyVolume).toBe("number");
        expect(typeof item.totalSellVolume).toBe("number");
        expect(typeof item.totalVolume).toBe("number");
        expect(typeof item.totalAmount).toBe("number");

        if (item.stock) {
          expect(typeof item.stock.id).toBe("string");
          expect(typeof item.stock.symbol).toBe("string");
          expect(typeof item.stock.name).toBe("string");
          expect(typeof item.stock.assetType).toBe("string");
          expect(typeof item.stock.assetClass).toBe("string");
        }

        if ("averageCost" in item) {
          expect(typeof (item as any).averageCost).toBe("number");
        }
      }
    });

    test("getBrokers with assetClass parameter", async () => {
      const response = await brokerClient.getBrokers(
        Region.Tr,
        10,
        0,
        AssetClass.Equity
      );

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");
      expect(response.recordCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(response.items)).toBe(true);

      if (response.items.length > 0) {
        const broker = response.items[0];

        expect(typeof broker.id).toBe("number");
        expect(typeof broker.symbol).toBe("string");
        expect(typeof broker.name).toBe("string");
        expect(typeof broker.longName).toBe("string");
        expect(typeof broker.logo === "string" || broker.logo == null).toBe(
          true
        );

        expect(Array.isArray(broker.supportedAssetClasses)).toBe(true);
        expect(broker.supportedAssetClasses).toEqual([AssetClass.Equity]);
      }
    });

    test("getBrokers without assetClass parameter", async () => {
      const response = await brokerClient.getBrokers(Region.Tr, 10, 0);

      expect(response).toBeDefined();
      expect(typeof response.recordCount).toBe("number");
      expect(response.recordCount).toBeGreaterThanOrEqual(0);
      expect(Array.isArray(response.items)).toBe(true);

      if (response.items.length > 0) {
        const broker = response.items[0];

        expect(typeof broker.id).toBe("number");
        expect(typeof broker.symbol).toBe("string");
        expect(typeof broker.name).toBe("string");
        expect(typeof broker.longName).toBe("string");
        expect(typeof broker.logo === "string" || broker.logo == null).toBe(
          true
        );
      }
    });
  });

  describe("Mock Tests", () => {
    const region = Region.Tr;
    const fromDate = "2025-06-01";
    const toDate = "2025-06-30";
    const page = 0;
    const size = 5;
  
    let brokerClient: BrokerClient;
    let cli: { request: jest.Mock };
  
    beforeEach(() => {
      cli = {
        request: jest.fn(),
      };
  
      const config = (global as any).testSuite.config as LaplaceConfiguration;
      const logger: Logger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      } as unknown as Logger;
  
      // IMPORTANT: Client ctor artık cli kabul ediyor
      brokerClient = new BrokerClient(config, logger, cli as any);
    });
  
    describe("getMarketBrokers", () => {
      test("should call correct endpoint/params and read values", async () => {
        cli.request.mockResolvedValueOnce({ data: fxGetMarketBrokers });
  
        const res = await brokerClient.getMarketBrokers(
          region,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          size,
          page
        );
  
        // request shape
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/brokers/market");
        expect(call.params).toEqual({
          region,
          sortBy: BrokerSort.TotalVolume,
          sortDirection: SortDirection.Desc,
          fromDate,
          toDate,
          page,
          size,
        });
  
        // response values
        expect(res.recordCount).toBe(2);
        expect(res.items).toHaveLength(1);
  
        expect(res.totalStats.netAmount).toBe(4000000.0);
        expect(res.totalStats.totalAmount).toBe(17500000.0);
        expect(res.totalStats.totalVolume).toBe(350000);
        expect(res.totalStats.totalBuyAmount).toBe(10750000.0);
        expect(res.totalStats.totalBuyVolume).toBe(175000);
        expect(res.totalStats.totalSellAmount).toBe(6750000.0);
        expect(res.totalStats.totalSellVolume).toBe(175000);
  
        const item = res.items[0];
        expect(item.broker?.id).toBe(1);
        expect(item.broker?.symbol).toBe("BIDZY");
        expect(item.broker?.name).toBe("DENIZ YATIRIM");
        expect(item.broker?.longName).toBe("DENIZ YATIRIM MENKUL KIYMETLER A.S.");
        expect(item.broker?.logo).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/brokers/BIDZY.svg"
        );
  
        expect(item.netAmount).toBe(2500000.0);
        expect(item.totalAmount).toBe(10000000.0);
        expect(item.totalVolume).toBe(200000);
        expect(item.totalBuyAmount).toBe(6250000.0);
        expect(item.totalBuyVolume).toBe(100000);
        expect(item.totalSellAmount).toBe(3750000.0);
        expect(item.totalSellVolume).toBe(100000);
      });
    });
  
    describe("getMarketStocks", () => {
      test("should call correct endpoint/params and read values", async () => {
        cli.request.mockResolvedValueOnce({ data: fxGetMarketStocks });
  
        const res = await brokerClient.getMarketStocks(
          region,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          size,
          page
        );
  
        // request shape
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/brokers/market/stock");
        expect(call.params).toEqual({
          region,
          sortBy: BrokerSort.TotalVolume,
          sortDirection: SortDirection.Desc,
          fromDate,
          toDate,
          page,
          size,
        });
  
        // response values
        expect(res.recordCount).toBe(2);
        expect(res.items).toHaveLength(1);
  
        expect(res.totalStats.averageCost).toBe(2.91);
        expect(res.totalStats.netAmount).toBe(1750000.0);
        expect(res.totalStats.totalAmount).toBe(8750000.0);
        expect(res.totalStats.totalVolume).toBe(175000);
        expect(res.totalStats.totalBuyAmount).toBe(5250000.0);
        expect(res.totalStats.totalBuyVolume).toBe(87500);
        expect(res.totalStats.totalSellAmount).toBe(3500000.0);
        expect(res.totalStats.totalSellVolume).toBe(87500);
  
        const item = res.items[0];
        expect(item.stock?.id).toBe("61dd0d670ec2114146342fa5");
        expect(item.stock?.name).toBe("SASA Polyester");
        expect(item.stock?.symbol).toBe("SASA");
        expect(item.stock?.assetType).toBe(AssetType.Stock);
        expect(item.stock?.assetClass).toBe(AssetClass.Equity);
  
        expect(item.averageCost).toBe(2.91);
        expect(item.netAmount).toBe(1000000.0);
        expect(item.totalAmount).toBe(5000000.0);
        expect(item.totalVolume).toBe(100000);
        expect(item.totalBuyAmount).toBe(3000000.0);
        expect(item.totalBuyVolume).toBe(50000);
        expect(item.totalSellAmount).toBe(2000000.0);
        expect(item.totalSellVolume).toBe(50000);
      });
    });
  
    describe("getBrokersByStock", () => {
      test("should call correct endpoint/params and read values", async () => {
        cli.request.mockResolvedValueOnce({ data: fxGetBrokersByStock });
  
        const res = await brokerClient.getBrokersByStock(
          "SASA",
          region,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          size,
          page
        );
  
        // request shape
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/brokers/SASA");
        expect(call.params).toEqual({
          region,
          sortBy: BrokerSort.TotalVolume,
          sortDirection: SortDirection.Desc,
          fromDate,
          toDate,
          page,
          size,
        });
  
        // response values
        expect(res.recordCount).toBe(2);
        expect(res.items).toHaveLength(1);
  
        expect(res.totalStats.averageCost).toBe(2.91);
        expect(res.totalStats.netAmount).toBe(800000.0);
        expect(res.totalStats.totalAmount).toBe(3500000.0);
        expect(res.totalStats.totalVolume).toBe(70000);
        expect(res.totalStats.totalBuyAmount).toBe(2150000.0);
        expect(res.totalStats.totalBuyVolume).toBe(35000);
        expect(res.totalStats.totalSellAmount).toBe(1350000.0);
        expect(res.totalStats.totalSellVolume).toBe(35000);
  
        const item = res.items[0];
        expect(item.broker?.id).toBe(1);
        expect(item.broker?.symbol).toBe("BIMLB");
        expect(item.broker?.name).toBe("BIMLB");
        expect(item.broker?.longName).toBe("BIM Yatırım Menkul Değerler A.Ş.");
        expect(item.broker?.logo).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/broker-logos/bimlb.png"
        );
  
        expect(item.averageCost).toBe(2.91);
        expect(item.netAmount).toBe(500000.0);
        expect(item.totalAmount).toBe(2000000.0);
        expect(item.totalVolume).toBe(40000);
        expect(item.totalBuyAmount).toBe(1250000.0);
        expect(item.totalBuyVolume).toBe(20000);
        expect(item.totalSellAmount).toBe(750000.0);
        expect(item.totalSellVolume).toBe(20000);
      });
  
      test("should bubble up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid stock symbol"));
  
        await expect(
          brokerClient.getBrokersByStock(
            "INVALID",
            region,
            BrokerSort.TotalVolume,
            SortDirection.Desc,
            fromDate,
            toDate,
            size,
            page
          )
        ).rejects.toThrow("Invalid stock symbol");
      });
    });
  
    describe("getStocksByBroker", () => {
      test("should call correct endpoint/params and read values", async () => {
        cli.request.mockResolvedValueOnce({ data: fxGetStocksByBroker });
  
        const res = await brokerClient.getStocksByBroker(
          "BIMLB",
          region,
          BrokerSort.TotalVolume,
          SortDirection.Desc,
          fromDate,
          toDate,
          size,
          page
        );
  
        // request shape
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/brokers/stock/BIMLB");
        expect(call.params).toEqual({
          region,
          sortBy: BrokerSort.TotalVolume,
          sortDirection: SortDirection.Desc,
          fromDate,
          toDate,
          page,
          size,
        });
  
        // response values
        expect(res.recordCount).toBe(2);
        expect(res.items).toHaveLength(1);
  
        expect(res.totalStats.netAmount).toBe(800000.0);
        expect(res.totalStats.totalAmount).toBe(3500000.0);
        expect(res.totalStats.totalVolume).toBe(70000);
        expect(res.totalStats.totalBuyAmount).toBe(2150000.0);
        expect(res.totalStats.totalBuyVolume).toBe(35000);
        expect(res.totalStats.totalSellAmount).toBe(1350000.0);
        expect(res.totalStats.totalSellVolume).toBe(35000);
  
        const item = res.items[0];
        expect(item.stock?.id).toBe("61dd0d670ec2114146342fa5");
        expect(item.stock?.name).toBe("SASA Polyester");
        expect(item.stock?.symbol).toBe("SASA");
        expect(item.stock?.assetType).toBe(AssetType.Stock);
        expect(item.stock?.assetClass).toBe(AssetClass.Equity);
  
        expect(item.netAmount).toBe(500000.0);
        expect(item.totalAmount).toBe(2000000.0);
        expect(item.totalVolume).toBe(40000);
        expect(item.totalBuyAmount).toBe(1250000.0);
        expect(item.totalBuyVolume).toBe(20000);
        expect(item.totalSellAmount).toBe(750000.0);
        expect(item.totalSellVolume).toBe(20000);
      });
  
      test("should bubble up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid broker symbol"));
  
        await expect(
          brokerClient.getStocksByBroker(
            "INVALID",
            region,
            BrokerSort.TotalVolume,
            SortDirection.Desc,
            fromDate,
            toDate,
            size,
            page
          )
        ).rejects.toThrow("Invalid broker symbol");
      });
    });
  
    describe("getBrokers", () => {
      test("should call correct endpoint/params and read values", async () => {
        cli.request.mockResolvedValueOnce({ data: fxGetBrokers });
  
        const res = await brokerClient.getBrokers(region, 10, 0);

        // request shape
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/brokers");
        expect(call.params).toEqual({
          region,
          size: 10,
          page: 0,
        });
  
        // response values
        expect(res.recordCount).toBe(239);
        expect(res.items).toHaveLength(1);
  
        const broker = res.items[0];
        expect(broker.id).toBe(1);
        expect(broker.symbol).toBe("BIDZY");
        expect(broker.name).toBe("DENIZ YATIRIM");
        expect(broker.longName).toBe("DENIZ YATIRIM MENKUL KIYMETLER A.S.");
        expect(broker.logo).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/brokers/BIDZY.svg"
        );
        expect(broker.supportedAssetClasses).toEqual([AssetClass.Equity]);
      });
  
      test("should include assetClass when provided", async () => {
        cli.request.mockResolvedValueOnce({ data: fxGetBrokers });
  
        await brokerClient.getBrokers(region, 10, 0, AssetClass.Equity);

        const call = cli.request.mock.calls[0][0];
        expect(call.params).toEqual({
          region,
          size: 10,
          page: 0,
          assetClass: AssetClass.Equity,
        });
      });
    });
  });
});
