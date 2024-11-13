import { Client } from "./client";
import { Region } from "./collections";
import WebSocket from "ws";

type WebSocketMessage<T> = {
  type: string;
  message: T;
};

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
        console.error(
          `Maximum reconnection attempts (${this.MAX_RECONNECT_ATTEMPTS}) reached`
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
        console.error("Reconnection failed:", error);
        this.attemptReconnect();
      }
    }, delay);
  }

  static async connect(url: string) {
    this.wsUrl = url;
    if (!this.ws || this.ws.readyState === WebSocket.CLOSED) {
      this.ws = new WebSocket(url);
      await new Promise<void>((resolve, reject) => {
        if (!this.ws) return reject("No WebSocket instance");

        this.ws.onopen = () => {
          this.reconnectAttempts = 0;
          console.log("WebSocket connected");
          resolve();
        };
        this.ws.onerror = (error) => {
          reject(error);
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
    onError: (error: Error) => void = console.error
  ) {
    if (!this.ws) throw new Error("WebSocket not initialized");

    this.updateSymbols(symbols);

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(
          event.data.toString()
        ) as WebSocketMessage<BISTStockLiveData>;
        onMessage(data.message);
      } catch (error) {
        onError(error as Error);
      }
    };

    this.ws.onerror = (event) => {
      onError(new Error(`WebSocket error: ${event.error}`));
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
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

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