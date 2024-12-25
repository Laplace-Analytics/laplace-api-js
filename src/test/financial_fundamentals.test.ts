import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { Client, createClient } from '../client/client';
import { FinancialFundamentalsClient } from '../client/financial_fundamentals';
import { Region } from '../client/collections';
import { StockStatsKey } from '../client/financial_fundamentals';
import './client_test_suite';

describe('FinancialFundamentals', () => {
  let client: Client;
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

  test('GetStockDividends', async () => {
    const resp = await stockClient.getStockDividends('TUPRS', Region.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('GetStockStats', async () => {
    var statKeys = [
      StockStatsKey.PreviousClose,
      StockStatsKey.MarketCap,
      StockStatsKey.FK,
      StockStatsKey.PDDD,
      StockStatsKey.YearLow,
      StockStatsKey.YearHigh,
      StockStatsKey.WeeklyReturn,
      StockStatsKey.MonthlyReturn,
      StockStatsKey.ThreeMonthReturn,
      StockStatsKey.YtdReturn,
      StockStatsKey.YearlyReturn,
      StockStatsKey.ThreeYearReturn,
      StockStatsKey.FiveYearReturn,
      StockStatsKey.LatestPrice,
      StockStatsKey.DailyChange,
      StockStatsKey.DayLow,
      StockStatsKey.DayHigh,
    ]
    const resp = await stockClient.getStockStats(['TUPRS'], statKeys, Region.Tr);
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
      expect(currentStockStats.weeklyReturn).not.toBe(0.0);
      expect(currentStockStats.monthlyReturn).not.toBe(0.0);
      expect(currentStockStats['3MonthReturn']).not.toBe(0.0);
      expect(currentStockStats.ytdReturn).not.toBe(0.0);
      expect(currentStockStats.yearlyReturn).not.toBe(0.0);
      expect(currentStockStats['3YearReturn']).not.toBe(0.0);
      expect(currentStockStats['5YearReturn']).not.toBe(0.0);
      expect(currentStockStats.latestPrice).toBeGreaterThan(0.0);
      expect(currentStockStats.dailyChange).not.toBe(0.0);
      expect(currentStockStats.dayLow).toBeGreaterThan(0.0);
      expect(currentStockStats.dayHigh).toBeGreaterThan(0.0);
  });

  test('GetStockStatsV2', async () => {
    const resp = await stockClient.getStockStatsV2(['AKBNK'], Region.Tr);
    expect(resp).not.toBeEmpty();
    expect(resp.length).toBe(1);
  

      var currentStockStats = resp[0];
      expect(currentStockStats).not.toBeEmpty();
      expect(currentStockStats.symbol).toBe('AKBNK');
      expect(currentStockStats.previousClose).toBeGreaterThan(0.0);
      expect(currentStockStats.marketCap).toBeGreaterThan(0.0);
      expect(currentStockStats.peRatio).not.toBe(0.0);
      expect(currentStockStats.pbRatio).not.toBe(0.0);
      expect(currentStockStats.yearLow).toBeGreaterThan(0.0);
      expect(currentStockStats.yearHigh).toBeGreaterThan(0.0);
      expect(typeof currentStockStats.weeklyReturn).toBe('number');;
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
      expect(currentStockStats.upperPriceLimit).toBeGreaterThan(0.0)
      expect(currentStockStats.lowerPriceLimit).toBeGreaterThan(0.0)
  });

  test('GetTopMovers', async () => {
    const resp = await stockClient.getTopMovers(Region.Tr);
    expect(resp).not.toBeEmpty();
  });
});