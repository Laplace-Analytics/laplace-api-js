import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import { KeyInsightClient, KeyInsight } from "../client/key-insights";
import { Region } from "../client/collections";

const mockTRKeyInsightResponse: KeyInsight = {
  symbol: "TOASO",
  insight: "Tofaş'ın net kârı, güçlü operasyonel performans ve yüksek ihracat gelirleri sayesinde geçen yılın aynı dönemine göre %85 artış gösterdi."
};

const mockUSKeyInsightResponse: KeyInsight = {
  symbol: "AAPL",
  insight: "Apple's revenue growth was driven by strong iPhone sales and continued expansion in services, with significant market share gains in emerging markets."
};

describe("Key Insight", () => {
  let client: KeyInsightClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new KeyInsightClient(config, logger);
  });

  describe("Integration Tests", () => {
    describe("getKeyInsights", () => {
      test("should return key insights for valid symbol", async () => {
        const resp = await client.getKeyInsights("TOASO", Region.Tr);

        expect(resp).toBeDefined();
        expect(resp.insight).toBeDefined();
        expect(resp.insight.length).toBeGreaterThan(0);
        expect(resp.symbol).toBe("TOASO");
      });

      test("should handle invalid symbol gracefully", async () => {
        await expect(
          client.getKeyInsights("INVALID_SYMBOL", Region.Tr)
        ).rejects.toThrow();
      });

      test("should work with US region", async () => {
        const resp = await client.getKeyInsights("AAPL", Region.Us);
        expect(resp).toBeDefined();
        expect(resp.symbol).toBe("AAPL");
      });

      test("should handle empty symbol", async () => {
        await expect(client.getKeyInsights("", Region.Tr)).rejects.toThrow();
      });
    });
  });

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getKeyInsights", () => {
      test("should return TR key insights with mock data", async () => {
        jest.spyOn(client, 'getKeyInsights').mockResolvedValue(mockTRKeyInsightResponse);

        const resp = await client.getKeyInsights("TOASO", Region.Tr);

        expect(resp).toBeDefined();
        expect(resp.symbol).toBe("TOASO");
        expect(resp.insight).toBe(mockTRKeyInsightResponse.insight);

        expect(client.getKeyInsights).toHaveBeenCalledWith("TOASO", Region.Tr);
      });

      test("should return US key insights with mock data", async () => {
        jest.spyOn(client, 'getKeyInsights').mockResolvedValue(mockUSKeyInsightResponse);

        const resp = await client.getKeyInsights("AAPL", Region.Us);

        expect(resp).toBeDefined();
        expect(resp.symbol).toBe("AAPL");
        expect(resp.insight).toBe(mockUSKeyInsightResponse.insight);

        expect(client.getKeyInsights).toHaveBeenCalledWith("AAPL", Region.Us);
      });

      test("should handle invalid symbol error", async () => {
        jest.spyOn(client, 'getKeyInsights').mockRejectedValue(new Error("Symbol not found"));

        await expect(client.getKeyInsights("INVALID_SYMBOL", Region.Tr))
          .rejects.toThrow("Symbol not found");

        expect(client.getKeyInsights).toHaveBeenCalledWith("INVALID_SYMBOL", Region.Tr);
      });

      test("should handle empty symbol error", async () => {
        jest.spyOn(client, 'getKeyInsights').mockRejectedValue(new Error("Symbol cannot be empty"));

        await expect(client.getKeyInsights("", Region.Tr))
          .rejects.toThrow("Symbol cannot be empty");

        expect(client.getKeyInsights).toHaveBeenCalledWith("", Region.Tr);
      });
    });
  });
});
