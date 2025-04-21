import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import { Client, createClient } from "../client/client";
import {
  FinancialClient,
  HistoricalRatiosKey,
  FinancialSheetType,
  FinancialSheetPeriod,
  Currency,
} from "../client/financial_ratios";
import { Region, Locale } from "../client/collections";
import "./client_test_suite";
import { equal } from "assert";

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

  test("GetHistoricalRatios", async () => {
    const resp = await financialClient.getHistoricalRatios(
      "TUPRS",
      Object.values(HistoricalRatiosKey).flat(),
      Region.Tr
    );
    expect(resp).not.toBeEmpty();
    for (const ratio of resp) {
      expect(typeof ratio.finalValue).toBe("number");
      expect(typeof ratio.threeYearGrowth).toBe("number");
      expect(typeof ratio.yearGrowth).toBe("number");
      expect(typeof ratio.finalSectorValue).toBe("number");
      expect(equal(ratio.currency, Currency.TRY));
      expect(typeof ratio.format).toBe("string");
      expect(typeof ratio.name).toBe("string");
      expect(ratio.items).not.toBeEmpty();
      expect(ratio.items.at(0)).toBeTruthy();
      expect(typeof ratio.items.at(0)?.period).toBe("string");
      expect(typeof ratio.items.at(0)?.sectorMean).toBe("number");
      expect(typeof ratio.items.at(0)?.value).toBe("number");
    }
  });

  test("GetHistoricalRatiosDescriptions", async () => {
    const resp = await financialClient.getHistoricalRatiosDescriptions(
      Locale.Tr,
      Region.Tr
    );
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