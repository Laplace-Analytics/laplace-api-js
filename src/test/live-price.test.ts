import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import { Region } from "../client/collections";
import "./client_test_suite";
import { LivePriceClient } from "../client/live-price";
import {
  BISTStockLiveData,
  LivePriceFeed,
  LivePriceWebSocketClient,
} from "../client/live-price-web-socket";

describe("LivePrice", () => {
  let livePriceUrlClient: LivePriceClient;
  let url: string;
  let ws: LivePriceWebSocketClient;

  const TEST_CONSTANTS = {
    JEST_TIMEOUT: 30000,
    MAIN_TIMEOUT: 25000,
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
    url = await livePriceUrlClient.getWebSocketUrl("2459", Region.Tr, [
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

        await new Promise((resolve) => setTimeout(resolve, 20000));

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
