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

    ws = new LivePriceWebSocketService({ enableLogging: true });

    await ws.connect(url);
  });

  describe("BIST Live Price Tests", () => {
    const symbols = ["TUPRS", "SASA", "THYAO", "GARAN", "YKBN"];
    const newSymbols = ["AKBNK", "KCHOL"];

    afterAll(() => {
      ws.close();
    });

    it(
      "should receive data for updated symbols",
      async () => {
        const receivedData: BISTStockLiveData[] = [];

        await new Promise<void>((resolve, reject) => {
          const { cleanup, update } = ws.getLivePrice(
            symbols,
            (data) => {
              if (!data) return;
              receivedData.push(data);

              if (symbols.includes(data.symbol)) {
                update(newSymbols);
              }

              if (newSymbols.includes(data.symbol)) {
                cleanup();
                resolve();
              }
            },
            (error) => {
              console.error("BIST Error:", error);
              cleanup();
              reject(error);
            }
          );

          setTimeout(() => {
            cleanup();
            if (
              !receivedData.some((data) => newSymbols.includes(data.symbol))
            ) {
              reject(
                new Error("Test timeout: No data received for new symbols")
              );
            } else {
              resolve();
            }
          }, TEST_CONSTANTS.MAIN_TIMEOUT).unref();
        });

        const newSymbolData = receivedData.filter((data) =>
          newSymbols.includes(data.symbol)
        );
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
  });
});
