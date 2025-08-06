import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import { LivePriceClient } from "../client/live-price";
import {
  BISTStockLiveData,
  LivePriceFeed,
  LivePriceWebSocketClient,
  USStockLiveData,
} from "../client/live-price-web-socket";

describe("LivePrice", () => {
  let livePriceUrlClient: LivePriceClient;
  let url: string;
  let ws: LivePriceWebSocketClient;

  const TEST_CONSTANTS = {
    JEST_TIMEOUT: 15000,
    MAIN_TIMEOUT: 10000,
  };

  beforeAll(async () => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    livePriceUrlClient = new LivePriceClient(config, logger);
  });

  describe("Integration Tests", () => {
    beforeAll(async () => {
      url = await livePriceUrlClient.getWebSocketUrl("2459", [
        LivePriceFeed.LiveBist,
      ]);

      ws = new LivePriceWebSocketClient({
        enableLogging: true,
      });

      await ws.connect(url);
    });

    afterAll(async () => {
      try {
        await ws.close();
      } catch (error) {
        console.error("Error closing websocket connection", error);
      }
    });

    describe("BIST Live Price Tests", () => {
      const symbols = ["TUPRS", "SASA", "THYAO", "GARAN", "YKBNK"];

      it(
        "should receive data for initial and updated symbols",
        async () => {
          const receivedData: BISTStockLiveData[] = [];

          let unsubscribe: (() => void) | null =
            ws.subscribe<LivePriceFeed.LiveBist>(
              symbols,
              LivePriceFeed.LiveBist,
              (data) => {
                console.log("RECEIVED DATA", data);
                receivedData.push(data);
              }
            );

          await new Promise((resolve) => setTimeout(resolve, TEST_CONSTANTS.MAIN_TIMEOUT));

          for (const symbol of symbols) {
            const symbolData = receivedData.filter(
              (data) => data.symbol === symbol
            );
            expect(symbolData.length).toBeGreaterThan(0);
          }

          unsubscribe();
        },
        TEST_CONSTANTS.JEST_TIMEOUT
      );
    });

    describe("US Live Price Tests", () => {
      const symbols = ["AAPL"];

      it(
        "should receive data for initial and updated symbols for us",
        async () => {
          const receivedData: USStockLiveData[] = [];

          let unsubscribe: (() => void) | null =
            ws.subscribe<LivePriceFeed.LiveUs>(
              symbols,
              LivePriceFeed.LiveUs,
              (data) => {
                console.log("RECEIVED DATA FOR US", data);
                receivedData.push(data);
              }
            );

          await new Promise((resolve) => setTimeout(resolve, TEST_CONSTANTS.MAIN_TIMEOUT));

          for (const symbol of symbols) {
            const symbolData = receivedData.filter(
              (data) => data.symbol === symbol
            );
            expect(symbolData.length).toBeGreaterThan(0);
          }

          unsubscribe();
        },
        TEST_CONSTANTS.JEST_TIMEOUT
      );
    });
  });
});
