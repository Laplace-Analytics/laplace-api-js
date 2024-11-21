import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  LivePriceClient,
  BISTStockLiveData,
  LivePriceWebSocketService,
} from "../client/live-price";
import { Region } from "../client/collections";
import "./client_test_suite";

describe("LivePrice", () => {
  let livePriceClient: LivePriceClient;
  let url: string;
  let ws: LivePriceWebSocketService;

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

    livePriceClient = new LivePriceClient(config, logger);
    url = await livePriceClient.getWebSocketUrl("2459", Region.Tr);

    ws = new LivePriceWebSocketService({
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
    const newSymbols = ["AKBNK", "KCHOL"];

    it(
      "should receive data for initial and updated symbols",
      async () => {
        const receivedData: BISTStockLiveData[] = [];

        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Test timeout: No data received"));
          }, TEST_CONSTANTS.MAIN_TIMEOUT).unref();

          let unsubscribeNewSymbols: (() => void) | null = null;

          const initialHandler = (data: BISTStockLiveData) => {
            receivedData.push(data);

            if (symbols.includes(data.symbol)) {
              const unsubscribeInitial = ws.subscribe(symbols, initialHandler);
              unsubscribeInitial();

              unsubscribeNewSymbols = ws.subscribe(newSymbols, (data) => {
                receivedData.push(data);

                if (newSymbols.includes(data.symbol)) {
                  clearTimeout(timeoutId);
                  if (unsubscribeNewSymbols) unsubscribeNewSymbols();
                  resolve();
                }
              });
            }
          };

          ws.subscribe(symbols, initialHandler);
        });

        const newSymbolData = receivedData.filter((data) =>
          newSymbols.includes(data.symbol)
        );
        const oldSymbolData = receivedData.filter((data) =>
          symbols.includes(data.symbol)
        );

        expect(oldSymbolData.length).toBeGreaterThan(0);
        expect(newSymbolData.length).toBeGreaterThan(0);

        newSymbolData.forEach((data) => {
          expect(newSymbols).toContain(data.symbol);
          expect(typeof data.symbol).toBe("string");
          expect(typeof data.c).toBe("number");
          expect(typeof data.cl).toBe("number");
        });

        const lastNewSymbolIndex = receivedData.findIndex((data) =>
          newSymbols.includes(data.symbol)
        );
        const dataAfterUpdate = receivedData.slice(lastNewSymbolIndex);
        const oldSymbolDataAfterUpdate = dataAfterUpdate.filter((data) =>
          symbols.includes(data.symbol)
        );

        expect(oldSymbolDataAfterUpdate.length).toBe(0);
      },
      TEST_CONSTANTS.JEST_TIMEOUT
    );

    it(
      "should handle multiple subscriptions for the same symbol",
      async () => {
        const symbol = "GARAN";
        const receivedData1: BISTStockLiveData[] = [];
        const receivedData2: BISTStockLiveData[] = [];

        await new Promise<void>((resolve, reject) => {
          const timeoutId = setTimeout(() => {
            reject(new Error("Test timeout: No data received"));
          }, TEST_CONSTANTS.MAIN_TIMEOUT).unref();

          const unsubscribe1 = ws.subscribe([symbol], (data) => {
            receivedData1.push(data);
          });

          const unsubscribe2 = ws.subscribe([symbol], (data) => {
            receivedData2.push(data);
            if (receivedData2.length >= 2) {
              clearTimeout(timeoutId);
              unsubscribe1();
              unsubscribe2();
              resolve();
            }
          });
        });

        expect(receivedData1.length).toBeGreaterThan(0);
        expect(receivedData2.length).toBeGreaterThan(0);
        expect(receivedData1).toEqual(receivedData2);
      },
      TEST_CONSTANTS.JEST_TIMEOUT
    );
  });
});