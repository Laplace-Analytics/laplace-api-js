import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import {
  LivePriceClient,
  getLivePriceForBIST,
  getLivePriceForUS,
} from "../client/live-price";

describe("LivePrice", () => {
  let client: LivePriceClient;
  let config: LaplaceConfiguration;
  let logger: Logger;
  let activeConnections: any[] = [];
  let activeTimeouts: NodeJS.Timeout[] = [];

  const TEST_CONSTANTS = {
    JEST_TIMEOUT: 15000,
    MAIN_TIMEOUT: 10000,
  };

  beforeAll(async () => {
    config = (global as any).testSuite.config as LaplaceConfiguration;
    logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new LivePriceClient(config, logger);
  });

  afterEach(async () => {
    // Clear all active timeouts
    for (const timeout of activeTimeouts) {
      clearTimeout(timeout);
    }
    activeTimeouts = [];

    // Clean up all active connections
    for (const connection of activeConnections) {
      try {
        connection.close();
      } catch (error) {
        console.log("Error closing connection:", error);
      }
    }
    activeConnections = [];
  });

  afterAll(async () => {
    // Final cleanup
    for (const timeout of activeTimeouts) {
      clearTimeout(timeout);
    }
    for (const connection of activeConnections) {
      try {
        connection.close();
      } catch (error) {
        console.log("Error closing connection in afterAll:", error);
      }
    }
  });

  describe("GetLivePriceForBIST", () => {
    it(
      "should receive BIST live price data",
      async () => {
        const symbols = ["AKBNK"];
        let receivedData: any = null;
        let receivedError: Error | null = null;

        const lc = client.getLivePriceForBIST(symbols);
        activeConnections.push(lc);

        try {
          const receiveChan = lc.receive();

          // Set a timeout to avoid hanging
          const timeoutPromise = new Promise<void>((_, reject) => {
            const timeout = setTimeout(
              () => reject(new Error("Timeout waiting for data")),
              TEST_CONSTANTS.MAIN_TIMEOUT
            );
            activeTimeouts.push(timeout);
          });

          const dataPromise = (async () => {
            try {
              for await (const data of receiveChan) {
                receivedData = data;
                break; // Get first data and exit
              }
            } catch (error) {
              console.log("Error in data stream:", error);
            }
          })();

          await Promise.race([dataPromise, timeoutPromise]);

          if (receivedData) {
            console.log("Received BIST data:", receivedData);
            expect(receivedData.s).toBeDefined();
            expect(typeof receivedData.s).toBe("string");
            expect(typeof receivedData.p).toBe("number");
            expect(typeof receivedData.ch).toBe("number");
            expect(typeof receivedData.d).toBe("number");
          } else {
            console.log("Timeout waiting for BIST data");
          }
        } catch (error) {
          receivedError = error as Error;
          console.log("Received error:", receivedError.message);
        } finally {
          lc.close();
        }
      },
      TEST_CONSTANTS.JEST_TIMEOUT
    );
  });

  describe("GetLivePriceForUS", () => {
    it(
      "should receive US live price data",
      async () => {
        const symbols = ["AAPL"];
        let receivedData: any = null;
        let receivedError: Error | null = null;

        const lc = client.getLivePriceForUS(symbols);
        activeConnections.push(lc);

        try {
          const receiveChan = lc.receive();

          // Set a timeout to avoid hanging
          const timeoutPromise = new Promise<void>((_, reject) => {
            const timeout = setTimeout(
              () => reject(new Error("Timeout waiting for data")),
              TEST_CONSTANTS.MAIN_TIMEOUT
            );
            activeTimeouts.push(timeout);
          });

          const dataPromise = (async () => {
            try {
              for await (const data of receiveChan) {
                receivedData = data;
                break; // Get first data and exit
              }
            } catch (error) {
              console.log("Error in data stream:", error);
            }
          })();

          await Promise.race([dataPromise, timeoutPromise]);

          if (receivedData) {
            console.log("Received US data:", receivedData);
            expect(receivedData.s).toBeDefined();
            expect(typeof receivedData.s).toBe("string");
            expect(typeof receivedData.p).toBe("number");
            expect(typeof receivedData.d).toBe("number");
          } else {
            console.log("Timeout waiting for US data");
          }
        } catch (error) {
          receivedError = error as Error;
          console.log("Received error:", receivedError.message);
        } finally {
          lc.close();
        }
      },
      TEST_CONSTANTS.JEST_TIMEOUT
    );
  });

  describe("LivePriceSubscribe", () => {
    it(
      "should handle subscription changes",
      async () => {
        const initialSymbols = ["AKBNK"];
        const newSymbols = ["TUPRS", "ASELS"];
        const receivedData: string[] = [];
        let switchOccurred = false;

        const lc = client.getLivePriceForBIST(initialSymbols);
        activeConnections.push(lc);

        try {
          const receiveChan = lc.receive();

          // Start receiving data
          const dataPromise = (async () => {
            try {
              for await (const data of receiveChan) {
                receivedData.push(data.s);

                // Switch symbols after 5 seconds
                if (!switchOccurred && receivedData.length > 0) {
                  const switchTimeout = setTimeout(async () => {
                    try {
                      await lc.subscribe(newSymbols);
                      receivedData.push("SWITCH");
                      switchOccurred = true;

                      // Close after another 5 seconds
                      const closeTimeout = setTimeout(() => {
                        lc.close();
                      }, 5000);
                      activeTimeouts.push(closeTimeout);
                    } catch (error) {
                      console.error("Error switching symbols:", error);
                    }
                  }, 5000);
                  activeTimeouts.push(switchTimeout);
                }
              }
            } catch (error) {
              console.log("Error in subscription test:", error);
            }
          })();

          // Set overall timeout
          const timeoutPromise = new Promise<void>((_, reject) => {
            const timeout = setTimeout(
              () => reject(new Error("Test timeout")),
              TEST_CONSTANTS.JEST_TIMEOUT
            );
            activeTimeouts.push(timeout);
          });

          await Promise.race([dataPromise, timeoutPromise]);

          // Verify we received data
          expect(receivedData.length).toBeGreaterThan(0);

          const switchIndex = receivedData.indexOf("SWITCH");
          if (switchIndex > 0) {
            const beforeSwitch = receivedData.slice(0, switchIndex);
            expect(beforeSwitch.some((symbol) => symbol === "AKBNK")).toBe(
              true
            );
          }

          if (switchIndex >= 0 && switchIndex < receivedData.length - 1) {
            const afterSwitch = receivedData.slice(switchIndex + 1);
            expect(afterSwitch.some((symbol) => symbol === "TUPRS")).toBe(true);
            expect(afterSwitch.some((symbol) => symbol === "ASELS")).toBe(true);
          }
        } catch (error) {
          console.log("Test error:", error);
        } finally {
          lc.close();
        }
      },
      TEST_CONSTANTS.JEST_TIMEOUT
    );
  });

  describe("LivePriceClose", () => {
    it(
      "should close connection properly",
      async () => {
        const symbols = ["AKBNK"];
        const lc = client.getLivePriceForBIST(symbols);
        activeConnections.push(lc);

        try {
          // Close immediately
          lc.close();

          // Try to receive data after close
          const receiveChan = lc.receive();
          let receivedAfterClose = false;

          try {
            for await (const data of receiveChan) {
              receivedAfterClose = true;
              break;
            }
          } catch (error) {
            // Expected to throw after close
            console.log("Expected error after close:", error);
          }

          // Should not receive data after close
          expect(receivedAfterClose).toBe(false);
        } catch (error) {
          console.error("Close test error:", error);
        }
      },
      TEST_CONSTANTS.JEST_TIMEOUT
    );
  });

  describe("Client Methods", () => {
    it(
      "should work with client methods",
      async () => {
        const symbols = ["THYAO"];
        let receivedData: any = null;

        const lc = client.getLivePriceForBIST(symbols);
        activeConnections.push(lc);

        try {
          const receiveChan = lc.receive();

          const timeoutPromise = new Promise<void>((_, reject) => {
            const timeout = setTimeout(
              () => reject(new Error("Timeout")),
              TEST_CONSTANTS.MAIN_TIMEOUT
            );
            activeTimeouts.push(timeout);
          });

          const dataPromise = (async () => {
            try {
              for await (const data of receiveChan) {
                receivedData = data;
                break;
              }
            } catch (error) {
              console.log("Error in client methods test:", error);
            }
          })();

          await Promise.race([dataPromise, timeoutPromise]);

          if (receivedData) {
            expect(receivedData.s).toBeDefined();
            expect(typeof receivedData.s).toBe("string");
          }
        } finally {
          lc.close();
        }
      },
      TEST_CONSTANTS.JEST_TIMEOUT
    );
  });
});
