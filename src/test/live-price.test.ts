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

const mockWebSocketUrl = "wss://mock-websocket-server.com/ws";

const mockBISTLiveData: BISTStockLiveData = {
  id: 1,
  symbol: "TUPRS",
  closePrice: 425.5,
  tipId: "tip123",
  percentChange: 2.5,
  timestamp: new Date().getTime()
};

const mockUSLiveData: USStockLiveData = {
  symbol: "AAPL",
  closePrice: 172.45,
  timestamp: new Date().getTime()
};

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

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("WebSocket URL Tests", () => {
      test("should get WebSocket URL successfully", async () => {
        jest.spyOn(livePriceUrlClient, 'getWebSocketUrl').mockResolvedValue(mockWebSocketUrl);

        const url = await livePriceUrlClient.getWebSocketUrl("2459", [LivePriceFeed.LiveBist]);

        expect(url).toBe(mockWebSocketUrl);
        expect(livePriceUrlClient.getWebSocketUrl).toHaveBeenCalledWith("2459", [LivePriceFeed.LiveBist]);
      });

      test("should handle errors when getting WebSocket URL", async () => {
        jest.spyOn(livePriceUrlClient, 'getWebSocketUrl').mockRejectedValue(new Error("Failed to get WebSocket URL"));

        await expect(livePriceUrlClient.getWebSocketUrl("2459", [LivePriceFeed.LiveBist]))
          .rejects.toThrow("Failed to get WebSocket URL");
      });
    });

    describe("WebSocket Connection Tests", () => {
      let mockWs: LivePriceWebSocketClient;

      beforeEach(() => {
        mockWs = new LivePriceWebSocketClient({ enableLogging: false });
        jest.spyOn(mockWs, 'connect').mockImplementation(async () => {
          return new WebSocket(mockWebSocketUrl);
        });
        jest.spyOn(mockWs, 'close').mockResolvedValue(undefined);
      });

      test("should connect to WebSocket successfully", async () => {
        await mockWs.connect(mockWebSocketUrl);
        expect(mockWs.connect).toHaveBeenCalledWith(mockWebSocketUrl);
      });

      test("should close WebSocket connection successfully", async () => {
        await mockWs.close();
        expect(mockWs.close).toHaveBeenCalled();
      });
    });

    describe("BIST Live Price Mock Tests", () => {
      let mockWs: LivePriceWebSocketClient;

      beforeEach(() => {
        mockWs = new LivePriceWebSocketClient({ enableLogging: false });
        jest.spyOn(mockWs, 'connect').mockImplementation(async () => {
          return new WebSocket(mockWebSocketUrl);
        });
      });

      test("should handle BIST stock data subscription", async () => {
        const symbols = ["TUPRS"];
        const receivedData: BISTStockLiveData[] = [];

        jest.spyOn(mockWs, 'subscribe').mockImplementation((symbols, feed, callback) => {
          setTimeout(() => {
            callback(mockBISTLiveData);
          }, 100);

          return () => {};
        });

        const unsubscribe = mockWs.subscribe<LivePriceFeed.LiveBist>(
          symbols,
          LivePriceFeed.LiveBist,
          (data) => receivedData.push(data)
        );

        await new Promise((resolve) => setTimeout(resolve, 200));

        expect(receivedData).toHaveLength(1);
        expect(receivedData[0].symbol).toBe("TUPRS");
        expect(receivedData[0].closePrice).toBe(425.5);
        expect(receivedData[0].percentChange).toBe(2.5);
        expect(receivedData[0].tipId).toBe("tip123");

        unsubscribe();
      });
    });

    describe("US Live Price Mock Tests", () => {
      let mockWs: LivePriceWebSocketClient;

      beforeEach(() => {
        mockWs = new LivePriceWebSocketClient({ enableLogging: false });
        jest.spyOn(mockWs, 'connect').mockImplementation(async () => {
          return new WebSocket(mockWebSocketUrl);
        });
      });

      test("should handle US stock data subscription", async () => {
        const symbols = ["AAPL"];
        const receivedData: USStockLiveData[] = [];

        jest.spyOn(mockWs, 'subscribe').mockImplementation((symbols, feed, callback) => {
          setTimeout(() => {
            callback(mockUSLiveData);
          }, 100);

          return () => {};
        });

        const unsubscribe = mockWs.subscribe<LivePriceFeed.LiveUs>(
          symbols,
          LivePriceFeed.LiveUs,
          (data) => receivedData.push(data)
        );

        await new Promise((resolve) => setTimeout(resolve, 200));

        expect(receivedData).toHaveLength(1);
        expect(receivedData[0].symbol).toBe("AAPL");
        expect(receivedData[0].closePrice).toBe(172.45);
        expect(typeof receivedData[0].timestamp).toBe("number");

        unsubscribe();
      });
    });
  });
});
