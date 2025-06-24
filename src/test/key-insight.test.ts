import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import { KeyInsightClient } from "../client/key-insights";
import { Region } from "../client/collections";

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
