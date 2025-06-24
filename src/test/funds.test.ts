import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import {
  FundsClient,
  FundType,
  HistoricalFundPricePeriod,
} from "../client/funds";
import { Region } from "../client/collections";

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
      expect(Array.isArray(resp)).toBe(true);

      if (resp.length > 0) {
        const distribution = resp[0];
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
