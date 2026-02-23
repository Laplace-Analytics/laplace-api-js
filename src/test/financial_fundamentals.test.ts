import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { 
  FinancialFundamentalsClient, 
  TopMoverDirection
} from '../client/financial_fundamentals';
import './client_test_suite';
import { Region } from '../client/collections';
import { AssetType, AssetClass } from '../client/stocks';

const mockDividendsResponse = [
  {
    "date": "2019-12-18T06:16:00Z",
    "currency": "TRY",
    "netAmount": 0.00007635,
    "netRatio": 0.000396200399251687,
    "grossAmount": 0.000509,
    "grossRatio": 0.00264133599501125,
    "priceThen": 19.399,
    "stoppageRatio": 0.85,
    "stoppageAmount": 0.00043265
  }
];

const mockStockStatsResponse = [
  {
    "previousClose": 307,
    "ytdReturn": 0.339439655172414,
    "yearlyReturn": 2.6855575955102,
    "marketCap": 1425000000000,
    "peRatio": 60.2794409292471,
    "pbRatio": 7.32754994352451,
    "yearLow": 80.56935,
    "yearHigh": 339.25,
    "3YearReturn": 4.65564820832651,
    "5YearReturn": 17.2118318670087,
    "3MonthReturn": 0.682320503304819,
    "monthlyReturn": -0.0792592592592593,
    "weeklyReturn": 0.0375626043405676,
    "symbol": "ASELS",
    "latestPrice": 310.75,
    "dailyChange": 0.012214983713355,
    "dayHigh": 314.75,
    "dayLow": 306,
    "lowerPriceLimit": 276.5,
    "upperPriceLimit": 337.5,
    "dayOpen": 307.25,
    "eps": 4.89223038095817
  }
];

const mockTopMoversResponse = [
  {
    "symbol": "ISKPL",
    "assetClass": "equity",
    "assetType": "stock",
    "change": 10
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

      expect(typeof firstDividend.currency).toBe("string");
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
        const result = await stockClient.getTopMovers(region, pageSize, direction, page, AssetType.Stock, AssetClass.Equity);
        
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
    let client: FinancialFundamentalsClient;
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
  
      client = new FinancialFundamentalsClient(config, logger, cli as any);
    });
  
    describe("getStockDividends", () => {
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockDividendsResponse });
  
        const resp = await client.getStockDividends("TUPRS", Region.Tr);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v2/stock/dividends");
        expect(call.params).toEqual({ symbol: "TUPRS", region: Region.Tr });
  
        expect(resp).toHaveLength(1);
        const d = resp[0];
  
        expect(d.date).toBe("2019-12-18T06:16:00Z");
        expect(d.currency).toBe("TRY");
        expect(d.netAmount).toBe(0.00007635);
        expect(d.netRatio).toBe(0.000396200399251687);
        expect(d.grossAmount).toBe(0.000509);
        expect(d.grossRatio).toBe(0.00264133599501125);
        expect(d.priceThen).toBe(19.399);
        expect(d.stoppageRatio).toBe(0.85);
        expect(d.stoppageAmount).toBe(0.00043265);
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid symbol"));
  
        await expect(client.getStockDividends("INVALID", Region.Tr)).rejects.toThrow(
          "Invalid symbol"
        );
      });
    });
  
    describe("getStockStats", () => {
      test("calls correct endpoint (URLSearchParams) and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockStockStatsResponse });
  
        const resp = await client.getStockStats(["ASELS"], Region.Tr);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(typeof call.url).toBe("string");
        expect(call.url).toContain("/api/v2/stock/stats");
        expect(call.url).toContain("symbols=ASELS");
        expect(call.url).toContain("region=tr");
  
        expect(resp).toHaveLength(1);
        const s = resp[0];
  
        expect(s.symbol).toBe("ASELS");
  
        expect(s.previousClose).toBe(307);
        expect(s.ytdReturn).toBe(0.339439655172414);
        expect(s.yearlyReturn).toBe(2.6855575955102);
  
        expect(s.marketCap).toBe(1425000000000);
        expect(s.peRatio).toBe(60.2794409292471);
        expect(s.pbRatio).toBe(7.32754994352451);
  
        expect(s.yearLow).toBe(80.56935);
        expect(s.yearHigh).toBe(339.25);
  
        expect(s["3YearReturn"]).toBe(4.65564820832651);
        expect(s["5YearReturn"]).toBe(17.2118318670087);
        expect(s["3MonthReturn"]).toBe(0.682320503304819);
  
        expect(s.monthlyReturn).toBe(-0.0792592592592593);
        expect(s.weeklyReturn).toBe(0.0375626043405676);
  
        expect(s.latestPrice).toBe(310.75);
        expect(s.dailyChange).toBe(0.012214983713355);
  
        expect(s.dayHigh).toBe(314.75);
        expect(s.dayLow).toBe(306);
        expect(s.dayOpen).toBe(307.25);
  
        expect(s.lowerPriceLimit).toBe(276.5);
        expect(s.upperPriceLimit).toBe(337.5);
  
        expect(s.eps).toBe(4.89223038095817);
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid symbols"));
  
        await expect(client.getStockStats([""], Region.Tr)).rejects.toThrow("Invalid symbols");
      });
    });
  
    describe("getTopMovers", () => {
      test("calls correct endpoint (URLSearchParams) and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockTopMoversResponse });
  
        const resp = await client.getTopMovers(
          Region.Tr,
          10,
          TopMoverDirection.Gainers,
          0,
          AssetType.Stock,
          AssetClass.Equity
        );
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(typeof call.url).toBe("string");
        expect(call.url).toContain("/api/v2/stock/top-movers");
        expect(call.url).toContain("region=tr");
        expect(call.url).toContain("pageSize=10");
        expect(call.url).toContain("direction=gainers");
        expect(call.url).toContain("assetType=stock");
        expect(call.url).toContain("assetClass=equity");
        expect(call.url).toContain("page=0");
  
        expect(resp).toHaveLength(1);
        const m = resp[0];
  
        expect(m.symbol).toBe("ISKPL");
        expect(m.change).toBe(10);
        expect(m.assetType).toBe("stock");
        expect(m.assetClass).toBe("equity");
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Bad request"));
  
        await expect(
          client.getTopMovers(Region.Tr, 10, TopMoverDirection.Gainers)
        ).rejects.toThrow("Bad request");
      });
    });
  });
  
});