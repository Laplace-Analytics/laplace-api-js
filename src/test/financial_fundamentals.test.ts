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
      StockStatsKey.YtdReturn,
      StockStatsKey.YearlyReturn,
      StockStatsKey.MarketCap,
      StockStatsKey.FK,
      StockStatsKey.PDDD,
      StockStatsKey.YearLow,
      StockStatsKey.YearHigh,
      StockStatsKey.ThreeYearReturn,
      StockStatsKey.FiveYearReturn,
      StockStatsKey.LatestPrice,
    ]
    const resp = await stockClient.getStockStats(['TUPRS'], statKeys, Region.Tr);
    expect(resp).not.toBeEmpty();
    expect(resp.length).toBe(1);
    expect(resp[0].symbol).toBe('TUPRS');
    expect(resp[0].previousClose).toBeGreaterThan(0);
    expect(resp[0].ytdReturn).not.toEqual(0);
    expect(resp[0].yearlyReturn).not.toEqual(0);
    expect(resp[0].marketCap).toBeGreaterThan(0);
    expect(resp[0].peRatio).not.toEqual(0);
    expect(resp[0].pbRatio).not.toEqual(0);
    expect(resp[0].yearLow).toBeGreaterThan(0);
    expect(resp[0].yearHigh).toBeGreaterThan(0);
    expect(resp[0]['3Year']).not.toEqual(0);
    expect(resp[0]['5Year']).not.toEqual(0);
  });

  test('GetTopMovers', async () => {
    const resp = await stockClient.getTopMovers(Region.Tr);
    expect(resp).not.toBeEmpty();
  });
});