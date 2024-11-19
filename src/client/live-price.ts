import { Client } from "./client";
import { Region } from "./collections";
import WebSocket from "ws";

interface WebSocketOptions {
  enableLogging?: boolean;
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

export class LivePriceWebSocketService {
  private ws: WebSocket | null = null;
  private activeSymbols: Set<string> = new Set();
  private subscriptionCounter = 0;
  private subscriptions = new Map<
    number,
    {
      symbol: string;
      handler: (data: BISTStockLiveData) => void;
    }
  >();
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isClosed: boolean = false;
  private closedReason: WebSocketCloseReason | null = null;
  private wsUrl: string | null = null;
  private readonly options: Required<WebSocketOptions>;

  constructor(options: WebSocketOptions = {}) {
    this.options = {
      enableLogging: true,
      reconnectAttempts: 5,
      reconnectDelay: 1000,
      maxReconnectDelay: 30000,
      ...options,
    };
  }

  private log(message: string, level: "info" | "error" | "warn" = "info") {
    if (!this.options.enableLogging) return;

    const prefix = `[LivePriceWebSocket][${level.toUpperCase()}]`;

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
      await this.setupWebSocket();
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
                if (!this.activeSymbols.has(data.symbol)) {
                  this.activeSymbols.add(data.symbol);
                }
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
        if (this.activeSymbols.size > 0) {
          this.updateSymbols(Array.from(this.activeSymbols));
        }
        if (this.reconnectTimeout) {
          clearTimeout(this.reconnectTimeout);
          this.reconnectTimeout = null;
        }
        this.reconnectAttempts = 0;
      } catch (error) {
        this.attemptReconnect();
      }
    }, delay).unref();
  }

  subscribe(
    symbols: string[],
    handler: (data: BISTStockLiveData) => void
  ): () => void {
    const subscriptionId = this.subscriptionCounter++;
    let symbolsToAdd: string[] = [];

    for (const symbol of symbols) {
      this.subscriptions.set(subscriptionId, { symbol, handler });

      if (this.getHandlersForSymbol(symbol).length === 1) {
        symbolsToAdd.push(symbol);
      }
    }
    if (symbolsToAdd.length > 0) {
      this.updateSymbols(symbolsToAdd);
    }

    return () => {
      const subscription = this.subscriptions.get(subscriptionId);
      if (!subscription) return;

      this.subscriptions.delete(subscriptionId);

      if (this.getHandlersForSymbol(subscription.symbol).length === 0) {
        this.updateSymbols([subscription.symbol]);
      }
    };
  }

  private getHandlersForSymbol(
    symbol: string
  ): ((data: BISTStockLiveData) => void)[] {
    return Array.from(this.subscriptions.values())
      .filter((s) => s.symbol === symbol)
      .map((s) => s.handler);
  }

  private async updateSymbols(symbols: string[]) {
    if (!this.ws) {
      throw new WebSocketError(
        "WebSocket is not initialized",
        WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
      );
    }

    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketError(
        "WebSocket is not connected",
        WebSocketErrorType.WEBSOCKET_NOT_CONNECTED
      );
    }
    const symbolsToAdd = symbols.filter((s) => !this.activeSymbols.has(s));
    const symbolsToRemove = symbols.filter(
      (s) => this.activeSymbols.has(s) && !this.getHandlersForSymbol(s).length
    );

    if (symbolsToRemove.length > 0) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          symbols: symbolsToRemove,
        })
      );
      this.activeSymbols = new Set(
        Array.from(this.activeSymbols).filter(
          (s) => !symbolsToRemove.includes(s)
        )
      );
    }

    if (symbolsToAdd.length > 0) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          symbols: symbolsToAdd,
        })
      );
    }
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
      this.activeSymbols.clear();
    }
  }

  isConnectionClosed(): boolean {
    return this.isClosed;
  }

  getCloseReason(): WebSocketCloseReason | null {
    return this.closedReason;
  }
}

export interface BISTStockLiveData {
  symbol: string;
  cl: number; // Close
  c: number; // PercentChange
}

interface WebSocketUrlResponse {
  url: string;
}

export class LivePriceClient extends Client {
  async getWebSocketUrl(
    externalUserId: string,
    region: Region
  ): Promise<string> {
    const url = new URL(`${this["baseUrl"]}/api/v1/ws/url`);
    url.searchParams.append("region", region);
    url.searchParams.append("accessLevel", "KRMD1");

    const response = await this.sendRequest<WebSocketUrlResponse>({
      method: "POST",
      url: url.toString(),
      data: {
        externalUserId: externalUserId,
      },
    });

    return response.url;
  }
}
