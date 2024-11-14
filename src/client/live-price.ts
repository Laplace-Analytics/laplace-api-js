import { Client } from "./client";
import { Region } from "./collections";
import WebSocket from "ws";

interface WebSocketOptions {
  enableLogging?: boolean;
  reconnectAttempts?: number;
  reconnectDelay?: number;
  maxReconnectDelay?: number;
}

type WebSocketMessage<T> = {
  type: string;
  message: T;
};

export enum WebSocketErrorType {
  MAX_RECONNECT_EXCEEDED = "MAX_RECONNECT_EXCEEDED",
  CONNECTION_ERROR = "CONNECTION_ERROR",
  WEBSOCKET_NOT_INITIALIZED = "WEBSOCKET_NOT_INITIALIZED",
  MESSAGE_PARSE_ERROR = "MESSAGE_PARSE_ERROR",
  WEBSOCKET_NOT_CONNECTED = "WEBSOCKET_NOT_CONNECTED",
  WEBSOCKET_ERROR = "WEBSOCKET_ERROR",
  UNKNOWN_ERROR = "UNKNOWN_ERROR",
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
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private isIntentionalClose = false;
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

  private log(message: string, level: "info" | "error" = "info") {
    if (!this.options.enableLogging) return;

    const prefix = `[LivePriceWebSocket][${level.toUpperCase()}]`;
    if (level === "error") {
      console.error(`${prefix} ${message}`);
    } else {
      console.info(`${prefix} ${message}`);
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
      if (!this.ws)
        return reject(
          new WebSocketError(
            "WebSocket not initialized",
            WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
          )
        );

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
        this.log("WebSocket closed");
        if (!this.isIntentionalClose) {
          this.attemptReconnect();
        }
      };
    });
  }

  private async attemptReconnect() {
    if (
      this.isIntentionalClose ||
      this.reconnectAttempts >= this.options.reconnectAttempts
    ) {
      if (this.reconnectAttempts >= this.options.reconnectAttempts) {
        throw new WebSocketError(
          `Maximum reconnection attempts (${this.options.reconnectAttempts}) reached`,
          WebSocketErrorType.MAX_RECONNECT_EXCEEDED
        );
      }
      return;
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
    }

    this.reconnectTimeout = setTimeout(async () => {
      try {
        await this.connect(this.wsUrl!);
        if (this.activeSymbols.size > 0) {
          this.updateSymbols(Array.from(this.activeSymbols));
        }
        this.reconnectAttempts = 0;
      } catch (error) {
        this.attemptReconnect();
      }
    }, delay).unref();
  }

  getLivePrice(
    symbols: string[],
    onMessage: (data: BISTStockLiveData) => void,
    onError: (error: Error) => void
  ) {
    if (!this.ws) {
      throw new WebSocketError(
        "WebSocket not initialized",
        WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
      );
    }

    this.updateSymbols(symbols);
    this.setupMessageHandlers(onMessage, onError);

    return {
      cleanup: () => this.cleanup(),
      update: (newSymbols: string[]) => this.updateSymbols(newSymbols),
    };
  }

  private setupMessageHandlers(
    onMessage: (data: BISTStockLiveData) => void,
    onError: (error: Error) => void
  ) {
    if (!this.ws) return;

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(
          event.data.toString()
        ) as WebSocketMessage<BISTStockLiveData>;
        onMessage(data.message);
      } catch (error) {
        onError(
          new WebSocketError(
            "Failed to parse WebSocket message",
            WebSocketErrorType.MESSAGE_PARSE_ERROR
          )
        );
      }
    };

    this.ws.onerror = (event) => {
      onError(
        new WebSocketError(
          `WebSocket error: ${event.error}`,
          WebSocketErrorType.WEBSOCKET_ERROR
        )
      );
    };
  }

  private async cleanup() {
    if (this.ws) {
      this.ws.onmessage = null;
      this.ws.onerror = null;
      
      if (this.ws.readyState === WebSocket.OPEN) {
        await this.updateSymbols([]);
      }
    }
    
    await this.close();
  }

  async close(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.isIntentionalClose = true;

      if (this.activeSymbols.size > 0) {
        this.ws.send(
          JSON.stringify({
            type: "unsubscribe",
            symbols: Array.from(this.activeSymbols),
          })
        );
      }

      await new Promise<void>((resolve) => {
        if (!this.ws) {
          resolve();
          return;
        }

        this.ws.onclose = () => {
          resolve();
        };

        this.ws.close();
      });
    }

    this.ws = null;
    this.activeSymbols.clear();

    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }

  private async updateSymbols(newSymbols: string[]) {
    if (!this.ws) {
      return;
    }
    if (this.ws.readyState !== WebSocket.OPEN) {
      return;
    }

    const symbolsToAdd = newSymbols.filter((s) => !this.activeSymbols.has(s));
    const symbolsToRemove = Array.from(this.activeSymbols).filter(
      (s) => !newSymbols.includes(s)
    );

    if (symbolsToRemove.length > 0) {
      this.ws.send(
        JSON.stringify({
          type: "unsubscribe",
          symbols: symbolsToRemove,
        })
      );
      symbolsToRemove.forEach((s) => this.activeSymbols.delete(s));
    }

    if (symbolsToAdd.length > 0) {
      this.ws.send(
        JSON.stringify({
          type: "subscribe",
          symbols: symbolsToAdd,
        })
      );
      symbolsToAdd.forEach((s) => this.activeSymbols.add(s));
    }
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
    const url = new URL(
      "http://pricesocket-alb-1393137587.eu-central-1.elb.amazonaws.com/api/v1/ws/url"
    );
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
