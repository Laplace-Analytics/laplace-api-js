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

    client = createClient(config, logger);
    stockClient = new FinancialFundamentalsClient(client);
  });

  test('GetStockDividends', async () => {
    const resp = await stockClient.getStockDividends('TUPRS', Region.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('GetStockStats', async () => {
    const resp = await stockClient.getStockStats(['TUPRS'], [
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
    ], Region.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('GetTopMovers', async () => {
    const resp = await stockClient.getTopMovers(Region.Tr);
    expect(resp).not.toBeEmpty();
  });
});