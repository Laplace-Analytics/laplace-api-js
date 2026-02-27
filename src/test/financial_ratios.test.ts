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
  HistoricalRatiosFormat,
} from "../client/financial_ratios";
import "./client_test_suite";
import { equal } from "assert";
import { Locale, Region } from "../client/collections";

const mockRatioComparisonResponse = [
  {
    "metricName": "pricing",
    "normalizedValue": 57.1272139065688,
    "data": [
      {
        "slug": "F/K",
        "value": 14.9584698641742,
        "average": -26.1316853855662
      }
    ]
  }
];

const mockHistoricalRatiosResponse = [
  {
    "items": [
      {
        "period": "2025-4",
        "value": 0.080499759559051,
        "sectorMean": 0.080499759559051
      }
    ],
    "finalValue": 0.080499759559051,
    "threeYearGrowth": -0.922611834325054,
    "yearGrowth": -0.527234781985081,
    "finalSectorValue": 0.080499759559051,
    "slug": "roe",
    "currency": "TRY",
    "format": "percentage",
    "name": "ROE"
  }
];

const mockRatiosDescriptionsResponse = [
  {
    "id": 112,
    "format": "percentage",
    "currency": "TRY",
    "slug": "gross-margin",
    "createdAt": "2025-04-16T07:50:52.245181Z",
    "updatedAt": "2025-04-16T07:50:52.245181Z",
    "name": "Brüt Kâr Marjı",
    "description": "Satışların maliyetinin gelirden çıkarılmasıyla brüt kâr bulunur. Brüt kârın satışlara oranı brüt kâr marjı olarak isimlendirilir.",
    "locale": "tr",
    "isRealtime": false
  }
];

const mockFinancialSheetsResponse = {
  sheets: [
    {
      period: "2024-1",
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
        expect(typeof firstRatio.slug).toBe("string");

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

  describe("Mock Tests (Broker-style)", () => {
    let client: FinancialClient;
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
  
      client = new FinancialClient(config, logger, cli as any);
    });
  
    describe("getFinancialRatioComparison", () => {
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockRatioComparisonResponse });

        const resp = await client.getFinancialRatioComparison(
          "TUPRS",
          Region.Tr,
          RatioComparisonPeerType.Sector
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v2/stock/financial-ratio-comparison");
        expect(call.params).toEqual({ symbol: "TUPRS", region: Region.Tr, peerType: RatioComparisonPeerType.Sector });
  
        expect(resp).toHaveLength(1);
  
        const item = resp[0];
        expect(item.metricName).toBe("pricing");
        expect(item.normalizedValue).toBe(57.1272139065688);
  
        expect(item.data).toHaveLength(1);
        expect(item.data[0].slug).toBe("F/K");
        expect(item.data[0].value).toBe(14.9584698641742);
        expect(item.data[0].average).toBe(-26.1316853855662);
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Bad request"));
  
        await expect(
          client.getFinancialRatioComparison("TUPRS", Region.Tr, RatioComparisonPeerType.Sector)
        ).rejects.toThrow("Bad request");
      });
    });
  
    describe("getHistoricalRatios", () => {
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockHistoricalRatiosResponse });

        const resp = await client.getHistoricalRatios(
          "TUPRS",
          [HistoricalRatiosKey.ReturnOnEquity],
          Region.Tr,
          Locale.Tr
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v2/stock/historical-ratios");
        expect(call.params).toEqual({ symbol: "TUPRS", region: Region.Tr, slugs: "roe", locale: Locale.Tr });
  
        expect(resp).toHaveLength(1);
  
        const r = resp[0];
        expect(r.slug).toBe("roe");
        expect(r.finalValue).toBe(0.080499759559051);
        expect(r.threeYearGrowth).toBe(-0.922611834325054);
        expect(r.yearGrowth).toBe(-0.527234781985081);
        expect(r.finalSectorValue).toBe(0.080499759559051);
        expect(r.currency).toBe("TRY");
        expect(r.format).toBe("percentage");
        expect(r.name).toBe("ROE");
  
        expect(r.items).toHaveLength(1);
        expect(r.items[0].period).toBe("2025-4");
        expect(r.items[0].value).toBe(0.080499759559051);
        expect(r.items[0].sectorMean).toBe(0.080499759559051);
      });
  
      test("omits locale param when locale is not provided", async () => {
        cli.request.mockResolvedValueOnce({ data: mockHistoricalRatiosResponse });

        await client.getHistoricalRatios("TUPRS", [HistoricalRatiosKey.ReturnOnEquity], Region.Tr);

        const call = cli.request.mock.calls[0][0];
        expect(call.url).toBe("/api/v2/stock/historical-ratios");
        expect(call.params).toEqual({ symbol: "TUPRS", region: Region.Tr, slugs: "roe" });
        expect(call.params.locale).toBeUndefined();
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid slugs"));
  
        await expect(
          client.getHistoricalRatios("TUPRS", [HistoricalRatiosKey.ReturnOnEquity], Region.Tr, Locale.Tr)
        ).rejects.toThrow("Invalid slugs");
      });
    });
  
    describe("getHistoricalRatiosDescriptions", () => {
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockRatiosDescriptionsResponse });

        const resp = await client.getHistoricalRatiosDescriptions(Locale.Tr, Region.Tr);

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v2/stock/historical-ratios/descriptions");
        expect(call.params).toEqual({ locale: Locale.Tr, region: Region.Tr });
  
        expect(resp).toHaveLength(1);
  
        const d = resp[0];
        expect(d.id).toBe(112);
        expect(d.format).toBe("percentage");
        expect(d.currency).toBe("TRY");
        expect(d.slug).toBe("gross-margin");
        expect(d.createdAt).toBe("2025-04-16T07:50:52.245181Z");
        expect(d.updatedAt).toBe("2025-04-16T07:50:52.245181Z");
        expect(d.name).toBe("Brüt Kâr Marjı");
        expect(d.description).toBe(
          "Satışların maliyetinin gelirden çıkarılmasıyla brüt kâr bulunur. Brüt kârın satışlara oranı brüt kâr marjı olarak isimlendirilir."
        );
        expect(d.locale).toBe("tr");
        expect(d.isRealtime).toBe(false);
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Not found"));
  
        await expect(
          client.getHistoricalRatiosDescriptions(Locale.Tr, Region.Tr)
        ).rejects.toThrow("Not found");
      });
    });
  
    describe("getHistoricalFinancialSheets", () => {
      test("throws error locally for balance sheet when period != cumulative (no request)", async () => {
        await expect(
          client.getHistoricalFinancialSheets(
            "TUPRS",
            { year: 2022, month: 1, day: 1 },
            { year: 2025, month: 1, day: 1 },
            FinancialSheetType.BalanceSheet,
            FinancialSheetPeriod.Annual,
            Currency.TRY,
            Region.Tr
          )
        ).rejects.toThrow("balance sheet is only available for cumulative period");
  
        expect(cli.request).not.toHaveBeenCalled();
      });
  
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockFinancialSheetsResponse });

        const resp = await client.getHistoricalFinancialSheets(
          "TUPRS",
          { year: 2024, month: 1, day: 1 },
          { year: 2024, month: 3, day: 31 },
          FinancialSheetType.CashFlow,
          FinancialSheetPeriod.Quarterly,
          Currency.TRY,
          Region.Tr
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v3/stock/historical-financial-sheets");
        expect(call.params).toEqual({
          symbol: "TUPRS",
          from: "2024-01-01",
          to: "2024-03-31",
          sheetType: FinancialSheetType.CashFlow,
          periodType: FinancialSheetPeriod.Quarterly,
          currency: Currency.TRY,
          region: Region.Tr,
        });
  
        expect(resp.sheets).toHaveLength(1);
        expect(resp.sheets[0].period).toBe("2024-1");
  
        expect(resp.sheets[0].items).toHaveLength(2);
  
        const row0 = resp.sheets[0].items[0];
        expect(row0.description).toBe("Satış Gelirleri");
        expect(row0.value).toBe(50000000000);
        expect(row0.lineCodeId).toBe(1);
        expect(row0.indentLevel).toBe(0);
  
        const row1 = resp.sheets[0].items[1];
        expect(row1.description).toBe("Satışların Maliyeti");
        expect(row1.value).toBe(-40000000000);
        expect(row1.lineCodeId).toBe(2);
        expect(row1.indentLevel).toBe(0);
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid parameters"));
  
        await expect(
          client.getHistoricalFinancialSheets(
            "TUPRS",
            { year: 2024, month: 1, day: 1 },
            { year: 2024, month: 3, day: 31 },
            FinancialSheetType.CashFlow,
            FinancialSheetPeriod.Quarterly,
            Currency.TRY,
            Region.Tr
          )
        ).rejects.toThrow("Invalid parameters");
      });
    });
  });  
});
