import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { 
  FinancialFundamentalsClient, 
  TopMoverDirection,
  StockDividend,
  StockStats,
  TopMover
} from '../client/financial_fundamentals';
import './client_test_suite';
import { Region } from '../client/collections';
import { AssetType, AssetClass } from '../client/stocks';

const mockDividendsResponse: StockDividend[] = [
  {
    date: "2024-03-14T10:00:00Z",
    netAmount: 8.75,
    netRatio: 0.0875,
    grossAmount: 10.0,
    grossRatio: 0.10,
    priceThen: 425.5,
    stoppageRatio: 0.15,
    stoppageAmount: 1.25
  },
  {
    date: "2023-03-15T10:00:00Z",
    netAmount: 7.0,
    netRatio: 0.07,
    grossAmount: 8.0,
    grossRatio: 0.08,
    priceThen: 380.0,
    stoppageRatio: 0.15,
    stoppageAmount: 1.0
  }
];

const mockStockStatsResponse: StockStats[] = [
  {
    symbol: "TUPRS",
    previousClose: 425.5,
    marketCap: 106375000000,
    peRatio: 5.8,
    pbRatio: 2.1,
    yearLow: 320.5,
    yearHigh: 450.2,
    weeklyReturn: 0.025,
    monthlyReturn: 0.058,
    "3MonthReturn": 0.125,
    ytdReturn: 0.15,
    yearlyReturn: 0.45,
    "3YearReturn": 1.25,
    "5YearReturn": 2.85,
    latestPrice: 428.5,
    dailyChange: 0.007,
    dayLow: 424.0,
    dayHigh: 429.5,
    upperPriceLimit: 468.05,
    lowerPriceLimit: 382.95,
    dayOpen: 426.0,
    eps: 73.45
  }
];

const mockTopMoversResponse: TopMover[] = [
  {
    symbol: "TUPRS",
    change: 5.8,
    assetClass: AssetClass.Equity,
    assetType: AssetType.Stock
  },
  {
    symbol: "SASA",
    change: 4.2,
    assetClass: AssetClass.Equity,
    assetType: AssetType.Stock
  }
];

describe('FinancialFundamentals', () => {
  let stockClient: FinancialFundamentalsClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    stockClient = new FinancialFundamentalsClient(config, logger);
  });

  describe("Integration Tests", () => {
    test("GetStockDividend", async () => {
      const resp = await stockClient.getStockDividends("TUPRS", Region.Tr);
      expect(resp).not.toBeEmpty();
    
      const firstDividend = resp[0];
      expect(typeof firstDividend.date).toBe("string");
      expect(() => new Date(firstDividend.date)).not.toThrow();
      expect(new Date(firstDividend.date).getTime()).not.toBeNaN();
      
      expect(typeof firstDividend.netAmount).toBe("number");
      expect(typeof firstDividend.netRatio).toBe("number");
      expect(typeof firstDividend.grossAmount).toBe("number");
      expect(typeof firstDividend.grossRatio).toBe("number");
      expect(typeof firstDividend.priceThen).toBe("number");
      expect(typeof firstDividend.stoppageRatio).toBe("number");
      expect(typeof firstDividend.stoppageAmount).toBe("number");
    });

    test('GetStockStats', async () => {
      const resp = await stockClient.getStockStats(['TUPRS'], Region.Tr);
      expect(resp).not.toBeEmpty();
      expect(resp.length).toBe(1);

      var currentStockStats = resp[0];
      expect(currentStockStats).not.toBeEmpty();
      expect(currentStockStats.symbol).toBe('TUPRS');
      expect(currentStockStats.previousClose).toBeGreaterThan(0.0);
      expect(currentStockStats.marketCap).toBeGreaterThan(0.0);
      expect(currentStockStats.peRatio).not.toBe(0.0);
      expect(currentStockStats.pbRatio).not.toBe(0.0);
      expect(currentStockStats.yearLow).toBeGreaterThan(0.0);
      expect(currentStockStats.yearHigh).toBeGreaterThan(0.0);
      expect(typeof currentStockStats.weeklyReturn).toBe('number');
      expect(typeof currentStockStats.monthlyReturn).toBe('number');
      expect(typeof currentStockStats['3MonthReturn']).toBe('number');
      expect(typeof currentStockStats.ytdReturn).toBe('number');
      expect(typeof currentStockStats.yearlyReturn).toBe('number');
      expect(typeof currentStockStats['3YearReturn']).toBe('number');
      expect(typeof currentStockStats['5YearReturn']).toBe('number');
      expect(currentStockStats.latestPrice).toBeGreaterThan(0.0);
      expect(typeof currentStockStats.dailyChange).toBe('number');
      expect(currentStockStats.dayLow).toBeGreaterThan(0.0);
      expect(currentStockStats.dayHigh).toBeGreaterThan(0.0);
      expect(currentStockStats.upperPriceLimit).toBeGreaterThan(0.0);
      expect(currentStockStats.lowerPriceLimit).toBeGreaterThan(0.0);
      expect(currentStockStats.dayOpen).toBeGreaterThan(0.0);
      expect(typeof currentStockStats.eps).toBe('number');
    });

    describe('GetTopMovers', () => {
      const region = Region.Tr;
      const page = 0;
      const pageSize = 20;
      
      async function testTopMovers(direction: TopMoverDirection, shouldBePositive: boolean) {
        const result = await stockClient.getTopMovers(region, page, pageSize, direction, AssetType.Stock, AssetClass.Equity);
        
        expect(Array.isArray(result)).toBe(true);
        expect(result.length).toBeGreaterThan(0);
        
        result.forEach(mover => {
          expect(mover).toHaveProperty('symbol');
          expect(mover).toHaveProperty('change');
          expect(typeof mover.symbol).toBe('string');
          expect(typeof mover.change).toBe('number');
        });
        
        const directionCheck = result.every(mover => 
          shouldBePositive ? mover.change > 0 : mover.change < 0
        );
        expect(directionCheck).toBe(true);

        const assetTypeCheck = result.every(mover => mover.assetType === AssetType.Stock)
        expect(assetTypeCheck).toBe(true);

        const assetClassCheck = result.every(mover => mover.assetClass === AssetClass.Equity)
        expect(assetClassCheck).toBe(true);
        
        expect(result.length).toBeLessThanOrEqual(pageSize);
      }
      
      test('should return gainers data', async () => {
        await testTopMovers(TopMoverDirection.Gainers, true);
      });
      
      test('should return losers data', async () => {
        await testTopMovers(TopMoverDirection.Losers, false);
      });
    });
  });

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getStockDividends", () => {
      test("should return dividends with mock data", async () => {
        jest.spyOn(stockClient, 'getStockDividends').mockResolvedValue(mockDividendsResponse);

        const resp = await stockClient.getStockDividends("TUPRS", Region.Tr);

        expect(resp).toHaveLength(2);
        
        const firstDividend = resp[0];
        expect(firstDividend.date).toBe("2024-03-14T10:00:00Z");
        expect(firstDividend.netAmount).toBe(8.75);
        expect(firstDividend.netRatio).toBe(0.0875);
        expect(firstDividend.grossAmount).toBe(10.0);
        expect(firstDividend.grossRatio).toBe(0.10);
        expect(firstDividend.priceThen).toBe(425.5);
        expect(firstDividend.stoppageRatio).toBe(0.15);
        expect(firstDividend.stoppageAmount).toBe(1.25);

        expect(stockClient.getStockDividends).toHaveBeenCalledWith("TUPRS", Region.Tr);
      });

      test("should handle empty dividends", async () => {
        jest.spyOn(stockClient, 'getStockDividends').mockResolvedValue([]);

        const resp = await stockClient.getStockDividends("NO_DIVIDEND_STOCK", Region.Tr);
        expect(resp).toHaveLength(0);
      });
    });

    describe("getStockStats", () => {
      test("should return stock stats with mock data", async () => {
        jest.spyOn(stockClient, 'getStockStats').mockResolvedValue(mockStockStatsResponse);

        const resp = await stockClient.getStockStats(["TUPRS"], Region.Tr);

        expect(resp).toHaveLength(1);
        
        const stats = resp[0];
        expect(stats.symbol).toBe("TUPRS");
        expect(stats.previousClose).toBe(425.5);
        expect(stats.marketCap).toBe(106375000000);
        expect(stats.peRatio).toBe(5.8);
        expect(stats.pbRatio).toBe(2.1);
        expect(stats.yearLow).toBe(320.5);
        expect(stats.yearHigh).toBe(450.2);
        expect(stats.weeklyReturn).toBe(0.025);
        expect(stats.monthlyReturn).toBe(0.058);
        expect(stats["3MonthReturn"]).toBe(0.125);
        expect(stats.ytdReturn).toBe(0.15);
        expect(stats.yearlyReturn).toBe(0.45);
        expect(stats["3YearReturn"]).toBe(1.25);
        expect(stats["5YearReturn"]).toBe(2.85);
        expect(stats.latestPrice).toBe(428.5);
        expect(stats.dailyChange).toBe(0.007);
        expect(stats.dayLow).toBe(424.0);
        expect(stats.dayHigh).toBe(429.5);
        expect(stats.upperPriceLimit).toBe(468.05);
        expect(stats.lowerPriceLimit).toBe(382.95);
        expect(stats.dayOpen).toBe(426.0);
        expect(stats.eps).toBe(73.45);

        expect(stockClient.getStockStats).toHaveBeenCalledWith(["TUPRS"], Region.Tr);
      });

      test("should handle multiple symbols", async () => {
        const multipleStatsResponse = [
          mockStockStatsResponse[0],
          { ...mockStockStatsResponse[0], symbol: "SASA", marketCap: 52000000000 }
        ];
        jest.spyOn(stockClient, 'getStockStats').mockResolvedValue(multipleStatsResponse);

        const resp = await stockClient.getStockStats(["TUPRS", "SASA"], Region.Tr);
        expect(resp).toHaveLength(2);
        expect(resp[0].symbol).toBe("TUPRS");
        expect(resp[1].symbol).toBe("SASA");
      });
    });

    describe("getTopMovers", () => {
      test("should return gainers with mock data", async () => {
        jest.spyOn(stockClient, 'getTopMovers').mockResolvedValue(mockTopMoversResponse);

        const resp = await stockClient.getTopMovers(
          Region.Tr,
          0,
          10,
          TopMoverDirection.Gainers,
          AssetType.Stock,
          AssetClass.Equity
        );

        expect(resp).toHaveLength(2);
        
        const firstMover = resp[0];
        expect(firstMover.symbol).toBe("TUPRS");
        expect(firstMover.change).toBe(5.8);
        expect(firstMover.assetClass).toBe(AssetClass.Equity);
        expect(firstMover.assetType).toBe(AssetType.Stock);

        expect(resp.every(mover => mover.change > 0)).toBe(true);

        expect(stockClient.getTopMovers).toHaveBeenCalledWith(
          Region.Tr,
          0,
          10,
          TopMoverDirection.Gainers,
          AssetType.Stock,
          AssetClass.Equity
        );
      });

      test("should return losers with mock data", async () => {
        const losersResponse = mockTopMoversResponse.map(mover => ({
          ...mover,
          change: -Math.abs(mover.change)
        }));
        jest.spyOn(stockClient, 'getTopMovers').mockResolvedValue(losersResponse);

        const resp = await stockClient.getTopMovers(
          Region.Tr,
          0,
          10,
          TopMoverDirection.Losers,
          AssetType.Stock,
          AssetClass.Equity
        );

        expect(resp.every(mover => mover.change < 0)).toBe(true);

        expect(stockClient.getTopMovers).toHaveBeenCalledWith(
          Region.Tr,
          0,
          10,
          TopMoverDirection.Losers,
          AssetType.Stock,
          AssetClass.Equity
        );
      });

      test("should handle pagination", async () => {
        jest.spyOn(stockClient, 'getTopMovers').mockResolvedValue([mockTopMoversResponse[0]]);

        const resp = await stockClient.getTopMovers(
          Region.Tr,
          1,
          1,
          TopMoverDirection.Gainers,
          AssetType.Stock,
          AssetClass.Equity
        );

        expect(resp).toHaveLength(1);
        expect(resp[0].symbol).toBe("TUPRS");

        expect(stockClient.getTopMovers).toHaveBeenCalledWith(
          Region.Tr,
          1,
          1,
          TopMoverDirection.Gainers,
          AssetType.Stock,
          AssetClass.Equity
        );
      });
    });
  });
});