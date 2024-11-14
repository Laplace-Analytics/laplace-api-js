import { Client } from "./client";
import { Region } from "./collections";
import WebSocket from "ws";

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
  private static ws: WebSocket | null = null;
  private static activeSymbols: Set<string> = new Set();
  private static reconnectAttempts = 0;
  private static reconnectTimeout: NodeJS.Timeout | null = null;
  private static isIntentionalClose = false;
  private static wsUrl: string | null = null;

  private static readonly MAX_RECONNECT_ATTEMPTS = 5;
  private static readonly INITIAL_RECONNECT_DELAY = 1000;
  private static readonly MAX_RECONNECT_DELAY = 30000;

  private static async attemptReconnect() {
    if (
      this.isIntentionalClose ||
      this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS
    ) {
      if (this.reconnectAttempts >= this.MAX_RECONNECT_ATTEMPTS) {
        throw new WebSocketError(
          `Maximum reconnection attempts (${this.MAX_RECONNECT_ATTEMPTS}) reached`,
          WebSocketErrorType.MAX_RECONNECT_EXCEEDED
        );
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      this.INITIAL_RECONNECT_DELAY * Math.pow(2, this.reconnectAttempts - 1),
      this.MAX_RECONNECT_DELAY
    );

    console.log(
      `Attempting to reconnect (${this.reconnectAttempts}/${this.MAX_RECONNECT_ATTEMPTS}) in ${delay}ms...`
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
    }, delay);
  }

  static async connect(url: string) {
    this.wsUrl = url;
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new WebSocket(url);
      await new Promise<void>((resolve, reject) => {
        if (!this.ws)
          throw new WebSocketError(
            "WebSocket not initialized",
            WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED
          );

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          console.log("WebSocket connected");
          resolve();
        };
        this.ws.onerror = (error) => {
          reject(new WebSocketError(`WebSocket connection error: ${error}`, WebSocketErrorType.CONNECTION_ERROR));
        };
        this.ws.onclose = () => {
          if (!this.isIntentionalClose) {
            this.attemptReconnect();
          }
        };
      });
    }
    return this.ws;
  }

  static getLivePrice(
    symbols: string[],
    onMessage: (data: BISTStockLiveData) => void,
    onError: (error: Error) => void
  ) {
    if (!this.ws) {
      throw new WebSocketError('WebSocket not initialized', WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED);
    }
    this.updateSymbols(symbols);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(
          event.data.toString()
        ) as WebSocketMessage<BISTStockLiveData>;
        onMessage(data.message);
      } catch (error) {
        onError(new WebSocketError('Failed to parse WebSocket message', WebSocketErrorType.MESSAGE_PARSE_ERROR));
      }
    };

    this.ws.onerror = (event) => {
      onError(new WebSocketError(`WebSocket error: ${event.error}`, WebSocketErrorType.WEBSOCKET_ERROR));
    };

    const updateSymbols = (newSymbols: string[]) => {
      this.updateSymbols(newSymbols);
    };

    return {
      cleanup: () => {
        if (this.ws) {
          this.ws.onmessage = null;
          this.ws.onerror = null;
        }
        this.updateSymbols([]);
        this.close();
      },
      update: updateSymbols,
    };
  }

  static close() {
    if (this.ws) {
      if (this.ws.readyState === WebSocket.OPEN) {
        this.isIntentionalClose = true;
        if (this.activeSymbols.size > 0) {
          this.ws.send(
            JSON.stringify({
              type: "unsubscribe",
              symbols: Array.from(this.activeSymbols),
            })
          );
        }
        this.ws.close();
      }
      this.ws = null;
      this.activeSymbols.clear();
    }
  }

  private static updateSymbols(newSymbols: string[]) {
    if (!this.ws) {
      throw new WebSocketError('WebSocket not initialized', WebSocketErrorType.WEBSOCKET_NOT_INITIALIZED);
    }
    if (this.ws.readyState !== WebSocket.OPEN) {
      throw new WebSocketError('WebSocket not connected', WebSocketErrorType.WEBSOCKET_NOT_CONNECTED);
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