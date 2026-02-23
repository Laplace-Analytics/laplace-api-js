import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import {
  FundsClient,
  FundType,
  HistoricalFundPricePeriod,
} from "../client/funds";
import { Region } from "../client/collections";

const mockFundsResponse= [
  {
    "assetType": "fund",
    "name": "NEO PORTFÖY KATILIM HİSSE SENEDİ FONU (HİSSE SENEDİ YOĞUN FON)",
    "symbol": "NKM",
    "active": true,
    "managementFee": 2.8,
    "riskLevel": 0,
    "fundType": "STOCK_UMBRELLA_FUND",
    "ownerSymbol": "VVP"
  }
];

const mockFundStatsResponse = {
  "monthlyReturn": -2.3367,
  "threeMonthReturn": 3.8059,
  "sixMonthReturn": 12.3031,
  "ytdReturn": -0.8037,
  "yearlyReturn": 31.9956,
  "threeYearReturn": 281.8466,
  "fiveYearReturn": 867.6593,
  "yearMomentum": 0,
  "yearBeta": 0.000068,
  "yearStdev": 0.077
};

const mockFundDistributionResponse = {
  "categories": [
    {
      "assets": [
        {
          "type": "BIST_STOCK",
          "symbol": "ASELS",
          "wholePercentage": 30,
          "categoryPercentage": 60
        },
        {
          "type": "OTHER_STOCK",
          "symbol": "NVDA",
          "wholePercentage": 20,
          "categoryPercentage": 40
        }
      ],
      "category": "EQUITY",
      "percentage": 50
    },
    {
      "category": "GOVERNMENT_BOND",
      "percentage": 30
    },
    {
      "category": "CURRENCY",
      "percentage": 20
    }
  ]
};

const mockHistoricalPricesResponse = [
  {
    "date": "2026-02-20T00:00:00Z",
    "price": 1.004711,
    "aum": 5242278660.64,
    "investorCount": 48900,
    "shareCount": 5217695760
  }
];

describe("Funds Client", () => {
  let client: FundsClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new FundsClient(config, logger);
  });

  describe("Integration Tests", () => {
    describe("getFunds", () => {
      test("should return funds list for TR region", async () => {
        const resp = await client.getFunds(Region.Tr, 1, 10);

        expect(resp).toBeDefined();
        expect(Array.isArray(resp)).toBe(true);
        expect(resp.length).toBeGreaterThan(0);

        const fund = resp[0];
        expect(typeof fund.symbol).toBe("string");
        expect(typeof fund.name).toBe("string");
        expect(typeof fund.assetType).toBe("string");
        expect(typeof fund.managementFee).toBe("number");
        expect(typeof fund.riskLevel).toBe("number");
        expect(typeof fund.active).toBe("boolean");
        expect(typeof fund.ownerSymbol).toBe("string");
        expect(Object.values(FundType)).toContain(fund.fundType);
      });

      test("should handle pagination correctly", async () => {
        const page1 = await client.getFunds(Region.Tr, 1, 5);
        expect(page1.length).toBeLessThanOrEqual(5);
      });
    });

    describe("getFundStats", () => {
      test("should return fund statistics", async () => {
        const resp = await client.getFundStats("SPP", Region.Tr);

        expect(resp).toBeDefined();
        expect(typeof resp.yearBeta).toBe("number");
        expect(typeof resp.yearStdev).toBe("number");
        expect(typeof resp.ytdReturn).toBe("number");
        expect(typeof resp.yearMomentum).toBe("number");
        expect(typeof resp.yearlyReturn).toBe("number");
        expect(typeof resp.monthlyReturn).toBe("number");
        expect(typeof resp.fiveYearReturn).toBe("number");
        expect(typeof resp.sixMonthReturn).toBe("number");
        expect(typeof resp.threeYearReturn).toBe("number");
        expect(typeof resp.threeMonthReturn).toBe("number");
      });

      test("should handle invalid fund symbol", async () => {
        await expect(
          client.getFundStats("INVALID_FUND", Region.Tr)
        ).rejects.toThrow();
      });
    });

    describe("getFundDistribution", () => {
      test("should return fund asset distribution", async () => {
        const resp = await client.getFundDistribution("SPP", Region.Tr);

        expect(resp).toBeDefined();
        expect(Array.isArray(resp.categories)).toBe(true);

        if (resp.categories.length > 0) {
          const distribution = resp.categories[0];
          expect(distribution.category).toBeDefined();
          expect(typeof distribution.percentage).toBe("number");
        }
      });
    });

    describe("getHistoricalFundPrices", () => {
      test("should return historical prices", async () => {
        const resp = await client.getHistoricalFundPrices(
          "SPP",
          Region.Tr,
          HistoricalFundPricePeriod.OneMonth
        );

        expect(resp).toBeDefined();
        expect(Array.isArray(resp)).toBe(true);
        expect(resp.length).toBeGreaterThan(0);

        const pricePoint = resp[0];
        expect(typeof pricePoint.price).toBe("number");
        expect(typeof pricePoint.aum).toBe("number");
        expect(pricePoint.date).toBeDefined();
        expect(typeof pricePoint.shareCount).toBe("number");
        expect(typeof pricePoint.investorCount).toBe("number");
      });
    });
  });

  describe("Mock Tests", () => {
    let client: FundsClient;
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
  
      client = new FundsClient(config, logger, cli as any);
    });
  
    describe("getFunds", () => {
      test("calls correct endpoint/params (without page) and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockFundsResponse });
  
        const resp = await client.getFunds(Region.Tr, 10);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/fund");
        expect(call.params).toEqual({
          region: Region.Tr,
          pageSize: 10,
        });
  
        expect(resp).toHaveLength(1);
  
        const f = resp[0];
        expect(f.assetType).toBe("fund");
        expect(f.name).toBe(
          "NEO PORTFÖY KATILIM HİSSE SENEDİ FONU (HİSSE SENEDİ YOĞUN FON)"
        );
        expect(f.symbol).toBe("NKM");
        expect(f.active).toBe(true);
        expect(f.managementFee).toBe(2.8);
        expect(f.riskLevel).toBe(0);
        expect(f.fundType).toBe("STOCK_UMBRELLA_FUND");
        expect(f.ownerSymbol).toBe("VVP");
      });
  
      test("calls correct endpoint/params (with page) and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockFundsResponse });
  
        const resp = await client.getFunds(Region.Tr, 10, 2);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/fund");
        expect(call.params).toEqual({
          region: Region.Tr,
          pageSize: 10,
          page: 2,
        });
  
        expect(resp).toHaveLength(1);
        expect(resp[0].symbol).toBe("NKM");
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Bad request"));
  
        await expect(client.getFunds(Region.Tr, 10)).rejects.toThrow("Bad request");
      });
    });
  
    describe("getFundStats", () => {
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockFundStatsResponse });
  
        const resp = await client.getFundStats("NKM", Region.Tr);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/fund/stats");
        expect(call.params).toEqual({ symbol: "NKM", region: Region.Tr });
  
        expect(resp.monthlyReturn).toBe(-2.3367);
        expect(resp.threeMonthReturn).toBe(3.8059);
        expect(resp.sixMonthReturn).toBe(12.3031);
        expect(resp.ytdReturn).toBe(-0.8037);
        expect(resp.yearlyReturn).toBe(31.9956);
        expect(resp.threeYearReturn).toBe(281.8466);
        expect(resp.fiveYearReturn).toBe(867.6593);
        expect(resp.yearMomentum).toBe(0);
        expect(resp.yearBeta).toBe(0.000068);
        expect(resp.yearStdev).toBe(0.077);
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Fund not found"));
  
        await expect(client.getFundStats("INVALID", Region.Tr)).rejects.toThrow(
          "Fund not found"
        );
      });
    });
  
    describe("getFundDistribution", () => {
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockFundDistributionResponse });
  
        const resp = await client.getFundDistribution("NKM", Region.Tr);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/fund/distribution");
        expect(call.params).toEqual({ symbol: "NKM", region: Region.Tr });
  
        expect(resp.categories).toHaveLength(3);
  
        const c0 = resp.categories[0];
        expect(c0.category).toBe("EQUITY");
        expect(c0.percentage).toBe(50);
        expect(Array.isArray(c0.assets)).toBe(true);
        expect(c0.assets!).toHaveLength(2);
  
        expect(c0.assets![0].type).toBe("BIST_STOCK");
        expect(c0.assets![0].symbol).toBe("ASELS");
        expect(c0.assets![0].wholePercentage).toBe(30);
        expect(c0.assets![0].categoryPercentage).toBe(60);
  
        expect(c0.assets![1].type).toBe("OTHER_STOCK");
        expect(c0.assets![1].symbol).toBe("NVDA");
        expect(c0.assets![1].wholePercentage).toBe(20);
        expect(c0.assets![1].categoryPercentage).toBe(40);
  
        const c1 = resp.categories[1];
        expect(c1.category).toBe("GOVERNMENT_BOND");
        expect(c1.percentage).toBe(30);
        expect(c1.assets).toBeUndefined();
  
        const c2 = resp.categories[2];
        expect(c2.category).toBe("CURRENCY");
        expect(c2.percentage).toBe(20);
        expect(c2.assets).toBeUndefined();
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid symbol"));
  
        await expect(client.getFundDistribution("INVALID", Region.Tr)).rejects.toThrow(
          "Invalid symbol"
        );
      });
    });
  
    describe("getHistoricalFundPrices", () => {
      test("calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockHistoricalPricesResponse });
  
        const resp = await client.getHistoricalFundPrices(
          "NKM",
          Region.Tr,
          HistoricalFundPricePeriod.OneMonth
        );
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/fund/price");
        expect(call.params).toEqual({
          symbol: "NKM",
          region: Region.Tr,
          period: HistoricalFundPricePeriod.OneMonth,
        });
  
        expect(resp).toHaveLength(1);
  
        const p = resp[0];
        expect(p.date).toBe("2026-02-20T00:00:00Z");
        expect(p.price).toBe(1.004711);
        expect(p.aum).toBe(5242278660.64);
        expect(p.investorCount).toBe(48900);
        expect(p.shareCount).toBe(5217695760);
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid period"));
  
        await expect(
          client.getHistoricalFundPrices(
            "NKM",
            Region.Tr,
            "INVALID_PERIOD" as HistoricalFundPricePeriod
          )
        ).rejects.toThrow("Invalid period");
      });
    });
  });
  
});
