import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import { KeyInsightClient } from "../client/key-insights";
import { Region } from "../client/collections";

const mockTRKeyInsightResponse = {
  symbol: "TOASO",
  insight: "Tofaş'ın net kârı, güçlü operasyonel performans ve yüksek ihracat gelirleri sayesinde geçen yılın aynı dönemine göre %85 artış gösterdi."
};

const mockUSKeyInsightResponse = {
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
    let client: KeyInsightClient;
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
  
      client = new KeyInsightClient(config, logger, cli as any);
    });
  
    describe("getKeyInsights", () => {
      test("TR: calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockTRKeyInsightResponse });
  
        const resp = await client.getKeyInsights("TOASO", Region.Tr);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/key-insights");
        expect(call.params).toEqual({
          symbol: "TOASO",
          region: Region.Tr,
        });
  
        expect(resp.symbol).toBe("TOASO");
        expect(resp.insight).toBe(mockTRKeyInsightResponse.insight);
      });
  
      test("US: calls correct endpoint/params and matches raw response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockUSKeyInsightResponse });
  
        const resp = await client.getKeyInsights("AAPL", Region.Us);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/key-insights");
        expect(call.params).toEqual({
          symbol: "AAPL",
          region: Region.Us,
        });
  
        expect(resp.symbol).toBe("AAPL");
        expect(resp.insight).toBe(mockUSKeyInsightResponse.insight);
      });
  
      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Symbol not found"));
  
        await expect(client.getKeyInsights("INVALID_SYMBOL", Region.Tr)).rejects.toThrow(
          "Symbol not found"
        );
  
        expect(cli.request).toHaveBeenCalledTimes(1);
      });
  
      test("empty symbol: bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Symbol cannot be empty"));
  
        await expect(client.getKeyInsights("", Region.Tr)).rejects.toThrow(
          "Symbol cannot be empty"
        );
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/key-insights");
        expect(call.params).toEqual({ symbol: "", region: Region.Tr });
      });
    });
  });
  
});
