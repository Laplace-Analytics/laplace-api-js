import { WebSocket } from "ws";

interface RawBISTStockLiveData {
  _id: number;
  symbol: string;
  cl: number;
  _i: string;
  c: number;
  d: number;
}

interface RawUSStockLiveData {
  s: string;
  p: number;
  t: number;
}

export interface BISTStockLiveData {
  id: number;
  symbol: string;
  closePrice: number;
  tipId: string;
  percentChange: number;
  timestamp: number;
}

export interface USStockLiveData {
  symbol: string;
  closePrice: number;
  timestamp: number;
}

export enum LivePriceFeed {
  LiveBist = "live_price_tr",
  LiveUs = "live_price_us",
  DelayedBist = "delayed_price_tr",
  DelayedUs = "delayed_price_us",
  // DepthBist = "depth_tr",
}

type StockLiveDataType<T extends LivePriceFeed> = T extends
  | LivePriceFeed.LiveBist
  | LivePriceFeed.DelayedBist
  ? // | LivePriceFeed.DepthBist
    BISTStockLiveData
  : USStockLiveData;

export enum LogLevel {
  Info = "info",
  Warn = "warn",
  Error = "error",
}

interface WebSocketOptions {
  enableLogging?: boolean;
  logLevel?: LogLevel;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
}

type WebSocketMessageType = "heartbeat" | "error" | "warning" | "data";

export enum WebSocketErrorType {
  MAX_RECONNECT_EXCEEDED = "MAX_RECONNECT_EXCEEDED",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  CLOSE_ERROR = "CLOSE_ERROR",
  WEBSOCKET_NOT_INITIALIZED = "WEBSOCKET_NOT_INITIALIZED",
  MESSAGE_PARSE_ERROR = "MESSAGE_PARSE_ERROR",
  WEBSOCKET_NOT_CONNECTED = "WEBSOCKET_NOT_CONNECTED",
  WEBSOCKET_ERROR = "WEBSOCKET_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
}

export enum WebSocketCloseReason {
  NORMAL_CLOSURE = "NORMAL_CLOSURE",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  MAX_RECONNECT_EXCEEDED = "MAX_RECONNECT_EXCEEDED",
  UNKNOWN = "UNKNOWN",
}

export class WebSocketError extends Error {
  constructor(
    message: string,
    public readonly code: WebSocketErrorType = WebSocketErrorType.UNKNOWN_ERROR
  ) {
    super(message);
    this.name = "WebSocketError";
  }
}

export class LivePriceWebSocketClient {
  private ws: WebSocket | null = null;
  private subscriptionCounter = 0;
  private subscriptions = new Map<
    number,
    {
      symbols: string[];
      handler: (data: BISTStockLiveData | USStockLiveData) => void;
      feed: LivePriceFeed;
    }
  >();
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isClosed: boolean = false;
  private closedReason: WebSocketCloseReason | null = null;
  private wsUrl: string | null = null;
  private readonly options: Required<WebSocketOptions>;
  private connectPromise: Promise<void> | null = null;

  constructor(options: WebSocketOptions = {}) {
    this.options = {
      enableLogging: true,
      logLevel: LogLevel.Error,
      reconnectAttempts: 5,
      reconnectDelay: 5000,
      maxReconnectDelay: 30000,
      ...options,
    };
  }

  private log(message: string, level: "info" | "error" | "warn" = "info") {
    if (!this.options.enableLogging) return;

    const prefix = `[LivePriceWebSocket][${level.toUpperCase()}]`;
    const logLevel = this.options.logLevel;

    if (logLevel === LogLevel.Error && level !== "error") {
      return;
    }

    if (logLevel === LogLevel.Warn && level === "info") {
      return;
    }

    switch (level) {
      case "error":
        console.error(`${prefix} ${message}`);
        break;
      case "warn":
        console.warn(`${prefix} ${message}`);
        break;
      default:
        console.info(`${prefix} ${message}`);
        break;
    }
  }

  async connect(url: string): Promise<WebSocket> {
    this.log("Connecting to WebSocket...");
    this.wsUrl = url;

    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new WebSocket(url);
      this.connectPromise = this.setupWebSocket();

      await this.connectPromise;

      this.connectPromise = null;
    }

    return this.ws;
  }

  private async setupWebSocket(): Promise<void> {
    if (!this.ws) {
      throw new WebSocketError(
        "WebSocket not initialized",
        WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
      );
    }

    return new Promise((resolve, reject) => {
      if (!this.ws) {
        return reject(
          new WebSocketError(
            "WebSocket not initialized",
            WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
          )
        );
      }

      this.ws.onopen = () => {
        this.reconnectAttempts = 0;
        this.log("WebSocket connected");
        resolve();
      };

      this.ws.onerror = (error) => {
        reject(
          new WebSocketError(
            `WebSocket connection error: ${error}`,
            WebSocketErrorType.CONNECTION_ERROR
          )
        );
      };

      this.ws.onclose = () => {
        this.isClosed = true;
        this.log("WebSocket closed");
        if (this.closedReason !== WebSocketCloseReason.NORMAL_CLOSURE) {
          try {
            this.attemptReconnect();
          } catch (error) {
            if (error instanceof WebSocketError) {
              switch (error.code) {
                case WebSocketErrorType.MAX_RECONNECT_EXCEEDED:
                  this.closedReason =
                    WebSocketCloseReason.MAX_RECONNECT_EXCEEDED;
                  break;
                case WebSocketErrorType.CONNECTION_ERROR:
                case WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED:
                  this.closedReason = WebSocketCloseReason.CONNECTION_ERROR;
                  break;
                default:
                  this.closedReason = WebSocketCloseReason.UNKNOWN;
                  break;
              }
            } else {
              this.closedReason = WebSocketCloseReason.UNKNOWN;
            }
            this.log(`Failed to reconnect: ${error}`, "error");
          }
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const rawData = JSON.parse(event.data.toString());

          const feed = rawData.feed as LivePriceFeed;
          switch (rawData.type) {
            case "data":
              const messageData = rawData.message;
              if (!messageData) {
                throw new WebSocketError(
                  "Price update message is empty",
                  WebSocketErrorType.MESSAGE_PARSE_ERROR
                );
              }
              let priceData: BISTStockLiveData | USStockLiveData;

              if (
                feed === LivePriceFeed.DelayedBist ||
                feed === LivePriceFeed.LiveBist
                //  ||
                // feed === LivePriceFeed.DepthBist
              ) {
                const message = messageData as RawBISTStockLiveData;
                priceData = {
                  symbol: message?.symbol,
                  id: message?._id,
                  tipId: message?._i,
                  closePrice: message?.cl,
                  timestamp: message?.d,
                  percentChange: message?.c,
                } as BISTStockLiveData;
              } else {
                const message = messageData as RawUSStockLiveData;
                priceData = {
                  symbol: message.s,
                  closePrice: message.p,
                  timestamp: message.t,
                } as USStockLiveData;
              }
              if (priceData.symbol) {
                const handlers = this.getHandlersForSymbol(
                  priceData.symbol,
                  feed
                );
                handlers.forEach((handler) => handler(priceData));
              }
              break;
            case "heartbeat":
              this.log("Received heartbeat");
              return;
            case "error":
              this.log(`Received error: ${rawData.message}`, "error");
              return;
            case "warning":
              this.log(`Received warning: ${rawData.message}`, "warn");
              return;
            default:
              this.log(`Unknown message type: ${rawData.type}`, "error");
              return;
          }
        } catch (error) {
          this.log(`Failed to parse WebSocket message: ${error}`, "error");
        }
      };
    });
  }

  private async attemptReconnect() {
    const url = this.wsUrl;
    if (!url) {
      throw new WebSocketError(
        "WebSocket URL is not set",
        WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
      );
    }
    if (this.reconnectAttempts >= this.options.reconnectAttempts) {
      throw new WebSocketError(
        `Maximum reconnection attempts (${this.options.reconnectAttempts}) reached`,
        WebSocketErrorType.MAX_RECONNECT_EXCEEDED
      );
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.options.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1),
      this.options.maxReconnectDelay
    );

    this.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.options.reconnectAttempts}) in ${delay}ms...`
    );

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect(url);

        this.isClosed = false;

        const symbolsByFeed = new Map<LivePriceFeed, string[]>();

        this.subscriptions.forEach((subscription) => {
          const { symbols, feed } = subscription;
          if (!symbolsByFeed.has(feed)) {
            symbolsByFeed.set(feed, []);
          }
          symbols.forEach((symbol) => {
            const currentSymbols = symbolsByFeed.get(feed) || [];
            if (!currentSymbols.includes(symbol)) {
              currentSymbols.push(symbol);
              symbolsByFeed.set(feed, currentSymbols);
            }
          });
        });

        symbolsByFeed.forEach((symbols, feed) => {
          this.addSymbols(symbols, feed);
        });

        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        this.reconnectAttempts = 0;
      } catch (error) {
        this.attemptReconnect();
      }
    }, delay);

    if (typeof process !== "undefined") {
      this.reconnectTimeout.unref();
    }
  }

  subscribe<F extends LivePriceFeed>(
    symbols: string[],
    feed: F,
    handler: (data: StockLiveDataType<F>) => void
  ): () => void {
    const subscriptionId = this.subscriptionCounter++;
    let symbolsToAdd: string[] = [];

    const typedHandler = (data: BISTStockLiveData | USStockLiveData) => {
      handler(data as StockLiveDataType<F>);
    };

    this.subscriptions.set(subscriptionId, {
      symbols,
      feed,
      handler: typedHandler,
    });

    for (const symbol of symbols) {
      if (this.getHandlersForSymbol(symbol, feed).length === 1) {
        symbolsToAdd.push(symbol);
      }
    }
    this.addSymbols(symbolsToAdd, feed);

    return () => {
      this.subscriptions.delete(subscriptionId);
      const symbolsForRemove = symbols.filter(
        (s) => this.getHandlersForSymbol(s, feed).length === 0
      );
      this.removeSymbols(symbolsForRemove, feed);
    };
  }

  private getHandlersForSymbol(
    symbol: string,
    feed: LivePriceFeed
  ): ((data: BISTStockLiveData | USStockLiveData) => void)[] {
    return Array.from(this.subscriptions.values())
      .filter((s) => s.symbols.includes(symbol) && s.feed === feed)
      .map((s) => s.handler);
  }

  private async removeSymbols(symbols: string[], feed: LivePriceFeed) {
    if (symbols.length === 0) return;

    if (!this.ws) {
      throw new WebSocketError(
        "WebSocket is not initialized",
        WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
      );
    }

    if (this.connectPromise) {
      await this.connectPromise;
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketError(
        "WebSocket is not connected",
        WebSocketErrorType.WEBSOCKET_NOT_CONNECTED
      );
    }

    this.ws.send(
      JSON.stringify({
        type: "unsubscribe",
        symbols: symbols,
        feed: feed,
      })
    );
  }

  private async addSymbols(symbols: string[], feed: LivePriceFeed) {
    if (symbols.length === 0) return;

    if (!this.ws) {
      throw new WebSocketError(
        "WebSocket is not initialized",
        WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
      );
    }

    if (this.connectPromise) {
      await this.connectPromise;
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketError(
        "WebSocket is not connected",
        WebSocketErrorType.WEBSOCKET_NOT_CONNECTED
      );
    }

    this.ws.send(
      JSON.stringify({
        type: "subscribe",
        symbols: symbols,
        feed: feed,
      })
    );
  }

  async close(): Promise<void> {
    try {
      this.subscriptions.clear();
      this.closedReason = WebSocketCloseReason.NORMAL_CLOSURE;
      if (this.ws?.readyState === WebSocket.OPEN) {
        await new Promise<void>((resolve, reject) => {
          if (!this.ws) {
            resolve();
            return;
          }

          this.ws.onclose = () => {
            this.isClosed = true;
            resolve();
          };

          try {
            this.ws.close();
          } catch (closeError) {
            this.closedReason = null;
            reject(
              new WebSocketError(
                `Failed to initiate close: ${closeError}`,
                WebSocketErrorType.CLOSE_ERROR
              )
            );
          }
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof WebSocketError
          ? error.message
          : `Unexpected error during close: ${error}`;

      this.log(errorMessage, "error");
      throw error instanceof WebSocketError
        ? error
        : new WebSocketError(errorMessage, WebSocketErrorType.CLOSE_ERROR);
    } finally {
      if (this.reconnectTimeout) {
        clearTimeout(this.reconnectTimeout);
        this.reconnectTimeout = null;
      }
      this.ws = null;
      this.subscriptions.clear();
    }
  }

  isConnectionClosed(): boolean {
    return this.isClosed;
  }

  getCloseReason(): WebSocketCloseReason | null {
    return this.closedReason;
  }
}
