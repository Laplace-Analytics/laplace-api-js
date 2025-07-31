import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import {
  FundsClient,
  FundType,
  HistoricalFundPricePeriod,
  Fund,
  FundStats,
  FundDistribution,
  FundAssetCategory,
  FundHistoricalPrice,
  FundContentType
} from "../client/funds";
import { Region } from "../client/collections";
import { AssetType } from "../client/stocks";

const mockFundsResponse: Fund[] = [
  {
    assetType: AssetType.Stock,
    name: "Ak Portföy BIST 30 Endeksi Hisse Senedi Fonu",
    symbol: "SPP",
    active: true,
    managementFee: 0.003,
    riskLevel: 6,
    fundType: FundType.STOCK_UMBRELLA_FUND,
    ownerSymbol: "AKP"
  },
  {
    assetType: AssetType.Stock,
    name: "İş Portföy BIST 30 Endeksi Hisse Senedi Fonu",
    symbol: "TI3",
    active: true,
    managementFee: 0.0035,
    riskLevel: 6,
    fundType: FundType.STOCK_UMBRELLA_FUND,
    ownerSymbol: "IYP"
  }
];

const mockFundStatsResponse: FundStats = {
  yearBeta: 0.95,
  yearStdev: 0.12,
  ytdReturn: 0.15,
  yearMomentum: 0.08,
  yearlyReturn: 0.25,
  monthlyReturn: 0.03,
  fiveYearReturn: 1.85,
  sixMonthReturn: 0.18,
  threeYearReturn: 0.95,
  threeMonthReturn: 0.09
};

const mockFundDistributionResponse: FundDistribution = {
  categories: [
    {
      category: FundAssetCategory.EQUITY,
      percentage: 95.5,
      assets: [
        {
          type: FundContentType.BIST_STOCK,
          symbol: "GARAN",
          wholePercentage: 9.8,
          categoryPercentage: 10.26
        }
      ]
    },
    {
      category: FundAssetCategory.LIQUID_DEPOSIT,
      percentage: 4.5
    }
  ]
};

const mockHistoricalPricesResponse: FundHistoricalPrice[] = [
  {
    price: 15.25,
    aum: 1250000000,
    date: "2024-03-14T10:00:00Z",
    shareCount: 82000000,
    investorCount: 25000
  },
  {
    price: 15.15,
    aum: 1245000000,
    date: "2024-03-13T10:00:00Z",
    shareCount: 82180000,
    investorCount: 24950
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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getFunds", () => {
      test("should return funds list with mock data", async () => {
        jest.spyOn(client, 'getFunds').mockResolvedValue(mockFundsResponse);

        const resp = await client.getFunds(Region.Tr, 1, 10);

        expect(resp).toHaveLength(2);
        
        const firstFund = resp[0];
        expect(firstFund.symbol).toBe("SPP");
        expect(firstFund.name).toBe("Ak Portföy BIST 30 Endeksi Hisse Senedi Fonu");
        expect(firstFund.assetType).toBe(AssetType.Stock);
        expect(firstFund.managementFee).toBe(0.003);
        expect(firstFund.riskLevel).toBe(6);
        expect(firstFund.fundType).toBe(FundType.STOCK_UMBRELLA_FUND);
        expect(firstFund.ownerSymbol).toBe("AKP");

        expect(client.getFunds).toHaveBeenCalledWith(Region.Tr, 1, 10);
      });

      test("should handle pagination with mock data", async () => {
        jest.spyOn(client, 'getFunds').mockResolvedValue([mockFundsResponse[0]]);

        const resp = await client.getFunds(Region.Tr, 1, 1);

        expect(resp).toHaveLength(1);
        expect(resp[0].symbol).toBe("SPP");

        expect(client.getFunds).toHaveBeenCalledWith(Region.Tr, 1, 1);
      });
    });

    describe("getFundStats", () => {
      test("should return fund statistics with mock data", async () => {
        jest.spyOn(client, 'getFundStats').mockResolvedValue(mockFundStatsResponse);

        const resp = await client.getFundStats("SPP", Region.Tr);

        expect(resp.yearBeta).toBe(0.95);
        expect(resp.yearStdev).toBe(0.12);
        expect(resp.ytdReturn).toBe(0.15);
        expect(resp.yearMomentum).toBe(0.08);
        expect(resp.yearlyReturn).toBe(0.25);
        expect(resp.monthlyReturn).toBe(0.03);
        expect(resp.fiveYearReturn).toBe(1.85);
        expect(resp.sixMonthReturn).toBe(0.18);
        expect(resp.threeYearReturn).toBe(0.95);
        expect(resp.threeMonthReturn).toBe(0.09);

        expect(client.getFundStats).toHaveBeenCalledWith("SPP", Region.Tr);
      });

      test("should handle invalid fund symbol error", async () => {
        jest.spyOn(client, 'getFundStats').mockRejectedValue(new Error("Fund not found"));

        await expect(client.getFundStats("INVALID_FUND", Region.Tr))
          .rejects.toThrow("Fund not found");
      });
    });

    describe("getFundDistribution", () => {
      test("should return fund distribution with mock data", async () => {
        jest.spyOn(client, 'getFundDistribution').mockResolvedValue(mockFundDistributionResponse);

        const resp = await client.getFundDistribution("SPP", Region.Tr);

        expect(resp.categories).toHaveLength(2);
        
        const equityCategory = resp.categories[0];
        expect(equityCategory.category).toBe(FundAssetCategory.EQUITY);
        expect(equityCategory.percentage).toBe(95.5);
        expect(equityCategory.assets).toBeDefined();
        expect(equityCategory.assets![0].symbol).toBe("GARAN");

        const liquidCategory = resp.categories[1];
        expect(liquidCategory.category).toBe(FundAssetCategory.LIQUID_DEPOSIT);
        expect(liquidCategory.percentage).toBe(4.5);

        expect(client.getFundDistribution).toHaveBeenCalledWith("SPP", Region.Tr);
      });
    });

    describe("getHistoricalFundPrices", () => {
      test("should return historical prices with mock data", async () => {
        jest.spyOn(client, 'getHistoricalFundPrices').mockResolvedValue(mockHistoricalPricesResponse);

        const resp = await client.getHistoricalFundPrices(
          "SPP",
          Region.Tr,
          HistoricalFundPricePeriod.OneMonth
        );

        expect(resp).toHaveLength(2);
        
        const firstPrice = resp[0];
        expect(firstPrice.price).toBe(15.25);
        expect(firstPrice.aum).toBe(1250000000);
        expect(firstPrice.date).toBe("2024-03-14T10:00:00Z");
        expect(firstPrice.shareCount).toBe(82000000);
        expect(firstPrice.investorCount).toBe(25000);

        expect(client.getHistoricalFundPrices).toHaveBeenCalledWith(
          "SPP",
          Region.Tr,
          HistoricalFundPricePeriod.OneMonth
        );
      });

      test("should handle invalid period error", async () => {
        jest.spyOn(client, 'getHistoricalFundPrices').mockRejectedValue(new Error("Invalid period"));

        await expect(client.getHistoricalFundPrices(
          "SPP",
          Region.Tr,
          "INVALID_PERIOD" as HistoricalFundPricePeriod
        )).rejects.toThrow("Invalid period");
      });
    });
  });
});
