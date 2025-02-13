export interface BISTStockLiveData {
  symbol: string;
  cl: number; // Close
  c: number; // PercentChange
}

export enum LogLevel {
  Dev = "dev",
  Test = "test",
  Prod = "prod",
}

interface WebSocketOptions {
  enableLogging?: boolean;
  logLevel?: LogLevel;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
}

type WebSocketMessageType = "heartbeat" | "error" | "warning" | "price_update";

interface WebSocketMessage<T> {
  type: WebSocketMessageType;
  message?: T;
}

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
      handler: (data: BISTStockLiveData) => void;
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
      logLevel: LogLevel.Prod,
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

    if (logLevel === LogLevel.Prod && level !== "error") {
      return;
    }

    if (logLevel === LogLevel.Test && level === "info") {
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

      await this.connectPromise

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
          switch (rawData.type) {
            case "price_update":
              const priceData = rawData as WebSocketMessage<BISTStockLiveData>;
              const data = priceData.message;
              if (!data) {
                throw new WebSocketError(
                  "Price update message is empty",
                  WebSocketErrorType.MESSAGE_PARSE_ERROR
                );
              }
              if (data.symbol) {
                const handlers = this.getHandlersForSymbol(data.symbol);
                handlers.forEach((handler) => handler(data));
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

  private getActiveSymbols(): string[] {
    const allSymbols = Array.from(this.subscriptions.values()).flatMap(
      (sub) => sub.symbols
    );

    return [...new Set(allSymbols)];
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
        
        this.isClosed = false

        const activeSymbols = this.getActiveSymbols();
        this.addSymbols(activeSymbols);

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

  subscribe(
    symbols: string[],
    handler: (data: BISTStockLiveData) => void
  ): () => void {
    const subscriptionId = this.subscriptionCounter++;
    let symbolsToAdd: string[] = [];

    this.subscriptions.set(subscriptionId, { symbols, handler });

    for (const symbol of symbols) {
      if (this.getHandlersForSymbol(symbol).length === 1) {
        symbolsToAdd.push(symbol);
      }
    }
    this.addSymbols(symbolsToAdd);

    return () => {
      this.subscriptions.delete(subscriptionId);
      const symbolsForRemove = symbols.filter(
        (s) => this.getHandlersForSymbol(s).length === 0
      );
      this.removeSymbols(symbolsForRemove);
    };
  }

  private getHandlersForSymbol(
    symbol: string
  ): ((data: BISTStockLiveData) => void)[] {
    return Array.from(this.subscriptions.values())
      .filter((s) => s.symbols.includes(symbol))
      .map((s) => s.handler);
  }

  private async removeSymbols(symbols: string[]) {
    if (symbols.length === 0) return;

    if (!this.ws) {
      throw new WebSocketError(
        "WebSocket is not initialized",
        WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
      );
    }

    if (this.connectPromise) {
      await this.connectPromise
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
      })
    );
  }

  private async addSymbols(symbols: string[]) {
    if (symbols.length === 0) return;

    if (!this.ws) {
      throw new WebSocketError(
        "WebSocket is not initialized",
        WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
      );
    }

    if (this.connectPromise) {
      await this.connectPromise
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
