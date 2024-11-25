import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { Client, createClient } from '../client/client';
import { FinancialClient, HistoricalRatiosKey, FinancialSheetType, FinancialSheetPeriod, Currency } from '../client/financial_ratios';
import { Region, Locale } from '../client/collections';
import './client_test_suite';

describe('FinancialRatios', () => {
  let financialClient: FinancialClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    financialClient = new FinancialClient(config, logger);
  });

  test('GetFinancialRatioComparison', async () => {
    const resp = await financialClient.getFinancialRatioComparison('TUPRS', Region.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('GetHistoricalRatios', async () => {
    const resp = await financialClient.getHistoricalRatios('TUPRS', [HistoricalRatiosKey.PriceToEarningsRatio], Region.Tr);
    expect(resp).not.toBeEmpty();
    for (const [_, format] of Object.entries(resp.formatting)) {
      expect(format.name).not.toBeEmpty();
    }
  });

  test('GetHistoricalRatiosDescriptions', async () => {
    const resp = await financialClient.getHistoricalRatiosDescriptions(Locale.Tr, Region.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('GetHistoricalFinancialSheets', async () => {
    const resp = await financialClient.getHistoricalFinancialSheets(
      'TUPRS',
      { year: 2022, month: 1, day: 1 },
      { year: 2023, month: 1, day: 1 },
      FinancialSheetType.BalanceSheet,
      FinancialSheetPeriod.Annual,
      Currency.EUR,
      Region.Tr
    );
    expect(resp).not.toBeEmpty();
  });
});