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
  StockPeerFinancialRatioComparison,
  StockHistoricalRatios,
  HistoricalRatiosFormat,
  StockHistoricalRatiosDescription,
  HistoricalFinancialSheets
} from "../client/financial_ratios";
import "./client_test_suite";
import { equal } from "assert";
import { Locale, Region } from "../client/collections";

const mockRatioComparisonResponse: StockPeerFinancialRatioComparison[] = [
  {
    metricName: "Net Kar Marjı",
    normalizedValue: 0.85,
    data: [
      {
        slug: "TUPRS",
        value: 12.5,
        average: 8.2
      },
      {
        slug: "SECTOR_AVERAGE",
        value: 7.8,
        average: 8.2
      }
    ]
  }
];

const mockHistoricalRatiosResponse: StockHistoricalRatios[] = [
  {
    slug: HistoricalRatiosKey.NetMargin,
    finalValue: 12.5,
    threeYearGrowth: 15.2,
    yearGrowth: 5.8,
    finalSectorValue: 7.8,
    currency: Currency.TRY,
    format: HistoricalRatiosFormat.PERCENTAGE,
    name: "Net Kar Marjı",
    items: [
      {
        period: "2024-Q1",
        value: 12.5,
        sectorMean: 7.8
      },
      {
        period: "2023-Q4",
        value: 11.8,
        sectorMean: 7.5
      }
    ]
  }
];

const mockRatiosDescriptionsResponse: StockHistoricalRatiosDescription[] = [
  {
    id: 1,
    format: HistoricalRatiosFormat.PERCENTAGE,
    currency: Currency.TRY,
    slug: HistoricalRatiosKey.NetMargin,
    createdAt: "2024-03-14T10:00:00Z",
    updatedAt: "2024-03-14T10:00:00Z",
    name: "Net Kar Marjı",
    description: "Net karın satışlara oranı",
    locale: Locale.Tr,
    isRealtime: false
  }
];

const mockFinancialSheetsResponse: HistoricalFinancialSheets = {
  sheets: [
    {
      period: "2024-Q1",
      items: [
        {
          description: "Satış Gelirleri",
          value: 50000000000,
          lineCodeId: 1,
          indentLevel: 0
        },
        {
          description: "Satışların Maliyeti",
          value: -40000000000,
          lineCodeId: 2,
          indentLevel: 0
        }
      ]
    }
  ]
};

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

  describe("Integration Tests", () => {
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
      try {
        await financialClient.getHistoricalFinancialSheets(
          "TUPRS",
          { year: 2022, month: 1, day: 1 },
          { year: 2025, month: 1, day: 1 },
          FinancialSheetType.BalanceSheet,
          FinancialSheetPeriod.Annual,
          Currency.TRY,
          Region.Tr
        );
      } catch (error) {
        expect((error as Error).message).toContain(
          "balance sheet is only available for cumulative period"
        );
      }

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

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getFinancialRatioComparison", () => {
      test("should return ratio comparison with mock data", async () => {
        jest.spyOn(financialClient, 'getFinancialRatioComparison').mockResolvedValue(mockRatioComparisonResponse);

        const resp = await financialClient.getFinancialRatioComparison(
          "TUPRS",
          Region.Tr,
          RatioComparisonPeerType.Sector
        );

        expect(resp).toHaveLength(1);
        
        const comparison = resp[0];
        expect(comparison.metricName).toBe("Net Kar Marjı");
        expect(comparison.normalizedValue).toBe(0.85);
        expect(comparison.data).toHaveLength(2);

        const companyData = comparison.data[0];
        expect(companyData.slug).toBe("TUPRS");
        expect(companyData.value).toBe(12.5);
        expect(companyData.average).toBe(8.2);

        const sectorData = comparison.data[1];
        expect(sectorData.slug).toBe("SECTOR_AVERAGE");
        expect(sectorData.value).toBe(7.8);
        expect(sectorData.average).toBe(8.2);

        expect(financialClient.getFinancialRatioComparison).toHaveBeenCalledWith(
          "TUPRS",
          Region.Tr,
          RatioComparisonPeerType.Sector
        );
      });
    });

    describe("getHistoricalRatios", () => {
      test("should return historical ratios with mock data", async () => {
        jest.spyOn(financialClient, 'getHistoricalRatios').mockResolvedValue(mockHistoricalRatiosResponse);

        const resp = await financialClient.getHistoricalRatios(
          "TUPRS",
          [HistoricalRatiosKey.NetMargin],
          Region.Tr,
          Locale.Tr
        );

        expect(resp).toHaveLength(1);
        
        const ratio = resp[0];
        expect(ratio.slug).toBe(HistoricalRatiosKey.NetMargin);
        expect(ratio.finalValue).toBe(12.5);
        expect(ratio.threeYearGrowth).toBe(15.2);
        expect(ratio.yearGrowth).toBe(5.8);
        expect(ratio.finalSectorValue).toBe(7.8);
        expect(ratio.currency).toBe(Currency.TRY);
        expect(ratio.format).toBe(HistoricalRatiosFormat.PERCENTAGE);
        expect(ratio.name).toBe("Net Kar Marjı");

        expect(ratio.items).toHaveLength(2);
        const firstItem = ratio.items[0];
        expect(firstItem.period).toBe("2024-Q1");
        expect(firstItem.value).toBe(12.5);
        expect(firstItem.sectorMean).toBe(7.8);

        expect(financialClient.getHistoricalRatios).toHaveBeenCalledWith(
          "TUPRS",
          [HistoricalRatiosKey.NetMargin],
          Region.Tr,
          Locale.Tr
        );
      });
    });

    describe("getHistoricalRatiosDescriptions", () => {
      test("should return ratio descriptions with mock data", async () => {
        jest.spyOn(financialClient, 'getHistoricalRatiosDescriptions').mockResolvedValue(mockRatiosDescriptionsResponse);

        const resp = await financialClient.getHistoricalRatiosDescriptions(
          Locale.Tr,
          Region.Tr
        );

        expect(resp).toHaveLength(1);
        
        const description = resp[0];
        expect(description.id).toBe(1);
        expect(description.format).toBe(HistoricalRatiosFormat.PERCENTAGE);
        expect(description.currency).toBe(Currency.TRY);
        expect(description.slug).toBe(HistoricalRatiosKey.NetMargin);
        expect(description.name).toBe("Net Kar Marjı");
        expect(description.description).toBe("Net karın satışlara oranı");
        expect(description.locale).toBe(Locale.Tr);
        expect(description.isRealtime).toBe(false);

        expect(financialClient.getHistoricalRatiosDescriptions).toHaveBeenCalledWith(
          Locale.Tr,
          Region.Tr
        );
      });
    });

    describe("getHistoricalFinancialSheets", () => {
      test("should return financial sheets with mock data", async () => {
        jest.spyOn(financialClient, 'getHistoricalFinancialSheets').mockResolvedValue(mockFinancialSheetsResponse);

        const resp = await financialClient.getHistoricalFinancialSheets(
          "TUPRS",
          { year: 2024, month: 1, day: 1 },
          { year: 2024, month: 3, day: 31 },
          FinancialSheetType.CashFlow,
          FinancialSheetPeriod.Quarterly,
          Currency.TRY,
          Region.Tr
        );

        expect(resp.sheets).toHaveLength(1);
        
        const sheet = resp.sheets[0];
        expect(sheet.period).toBe("2024-Q1");
        expect(sheet.items).toHaveLength(2);

        const revenue = sheet.items[0];
        expect(revenue.description).toBe("Satış Gelirleri");
        expect(revenue.value).toBe(50000000000);
        expect(revenue.lineCodeId).toBe(1);
        expect(revenue.indentLevel).toBe(0);

        const cogs = sheet.items[1];
        expect(cogs.description).toBe("Satışların Maliyeti");
        expect(cogs.value).toBe(-40000000000);
        expect(cogs.lineCodeId).toBe(2);
        expect(cogs.indentLevel).toBe(0);

        expect(financialClient.getHistoricalFinancialSheets).toHaveBeenCalledWith(
          "TUPRS",
          { year: 2024, month: 1, day: 1 },
          { year: 2024, month: 3, day: 31 },
          FinancialSheetType.CashFlow,
          FinancialSheetPeriod.Quarterly,
          Currency.TRY,
          Region.Tr
        );
      });

      test("should handle balance sheet period error", async () => {
        jest.spyOn(financialClient, 'getHistoricalFinancialSheets').mockRejectedValue(
          new Error("Balance sheet is only available for cumulative period")
        );

        await expect(financialClient.getHistoricalFinancialSheets(
          "TUPRS",
          { year: 2024, month: 1, day: 1 },
          { year: 2024, month: 3, day: 31 },
          FinancialSheetType.BalanceSheet,
          FinancialSheetPeriod.Quarterly,
          Currency.TRY,
          Region.Tr
        )).rejects.toThrow("Balance sheet is only available for cumulative period");
      });
    });
  });
});
