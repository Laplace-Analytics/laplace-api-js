import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  FinancialClient,
  HistoricalRatiosKey,
  FinancialSheetType,
  FinancialSheetPeriod,
  Currency,
  HistoricalFinancialSheetRow,
  RatioComparisonPeerType,
} from "../client/financial_ratios";
import "./client_test_suite";
import { equal } from "assert";
import { Locale, Region } from "../client/collections";

describe("FinancialRatios", () => {
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

  test("GetFinancialRatioComparison", async () => {
    const resp = await financialClient.getFinancialRatioComparison(
      "TUPRS",
      Region.Tr,
      RatioComparisonPeerType.Sector
    );
    expect(resp).not.toBeEmpty();

    const comparison = resp[0];
    expect(typeof comparison.metricName).toBe("string");
    expect(typeof comparison.normalizedValue).toBe("number");

    const comparisonData = comparison.data;
    expect(Array.isArray(comparisonData)).toBe(true);
    expect(comparisonData).not.toBeEmpty();
    expect(typeof comparisonData[0].slug).toBe("string");
    expect(typeof comparisonData[0].value).toBe("number");
    expect(typeof comparisonData[0].average).toBe("number");
  });

  describe("GetHistoricalRatios", () => {
    test("GetHistoricalRatios", async () => {
      const resp = await financialClient.getHistoricalRatios(
        "TUPRS",
        Object.values(HistoricalRatiosKey).flat(),
        Region.Tr,
        Locale.Tr
      );
      expect(resp).not.toBeEmpty();

      const firstRatio = resp[0];
      expect(typeof firstRatio.finalValue).toBe("number");
      expect(typeof firstRatio.threeYearGrowth).toBe("number");
      expect(typeof firstRatio.yearGrowth).toBe("number");
      expect(typeof firstRatio.finalSectorValue).toBe("number");
      expect(equal(firstRatio.currency, Currency.TRY));
      expect(typeof firstRatio.format).toBe("string");
      expect(typeof firstRatio.name).toBe("string");

      expect(firstRatio.items).not.toBeEmpty();
      const firstItem = firstRatio.items[0];
      expect(typeof firstItem.period).toBe("string");
      expect(typeof firstItem.sectorMean).toBe("number");
      expect(typeof firstItem.value).toBe("number");
    });
  });

  describe("GetHistoricalRatiosDescriptions", () => {
    test("GetHistoricalRatiosDescriptions", async () => {
      const resp = await financialClient.getHistoricalRatiosDescriptions(
        Locale.Tr,
        Region.Tr
      );
      expect(resp).not.toBeEmpty();

      const firstDescription = resp[0];
      expect(typeof firstDescription.id).toBe("number");
      expect(typeof firstDescription.format).toBe("string");
      expect(typeof firstDescription.currency).toBe("string");
      expect(typeof firstDescription.slug).toBe("string");
      expect(typeof firstDescription.createdAt).toBe("string");
      expect(typeof firstDescription.updatedAt).toBe("string");
      expect(typeof firstDescription.name).toBe("string");
      expect(typeof firstDescription.description).toBe("string");
      expect(typeof firstDescription.locale).toBe("string");
      expect(typeof firstDescription.isRealtime).toBe("boolean");
    });
  });

  test("GetHistoricalFinancialSheets", async () => {
    const resp = await financialClient.getHistoricalFinancialSheets(
      "TUPRS",
      { year: 2022, month: 1, day: 1 },
      { year: 2025, month: 1, day: 1 },
      FinancialSheetType.CashFlow,
      FinancialSheetPeriod.Quarterly,
      Currency.TRY,
      Region.Tr
    );

    expect(resp).toBeDefined();
    expect(resp).not.toBeNull();
    expect(resp).not.toBeEmpty();

    expect(resp.sheets).toBeDefined();
    expect(Array.isArray(resp.sheets)).toBe(true);
    expect(resp.sheets.length).toBeGreaterThan(0);

    const firstSheet = resp.sheets[0];
    expect(firstSheet).toBeDefined();

    expect(firstSheet.period).toBeDefined();
    expect(typeof firstSheet.period).toBe("string");

    expect(firstSheet.items).toBeDefined();
    expect(Array.isArray(firstSheet.items)).toBe(true);
    expect(firstSheet.items.length).toBeGreaterThan(0);

    const firstRow = firstSheet.items[0];
    expect(firstRow).toBeDefined();

    expect(firstRow).toMatchObject<HistoricalFinancialSheetRow>({
      description: expect.any(String),
      value: expect.any(Number),
      lineCodeId: expect.any(Number),
      indentLevel: expect.any(Number),
    });
  });
});
