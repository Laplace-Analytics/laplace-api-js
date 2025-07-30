import { Client } from "./client";
import { Region } from "./collections";
import { v4 as uuidv4 } from "uuid";

export interface BISTStockLiveData {
  s: string; // Symbol
  ch: number; // DailyPercentChange
  p: number; // ClosePrice
  d: number; // Date
}

export interface USStockLiveData {
  s: string; // Symbol
  p: number; // Price
  d: number; // Date
}

export interface ILivePriceClient<T> {
  close(): void;
  receive(): AsyncIterable<T>;
  subscribe(symbols: string[]): Promise<void>;
}

class LivePriceClientImpl<T> implements ILivePriceClient<T> {
  private client: Client;
  private region: Region;
  private symbols: string[] = [];
  private closed = false;
  private currentStream: AsyncIterable<T> | null = null;
  private cancelFn: (() => void) | null = null;

  constructor(client: Client, region: Region) {
    this.client = client;
    this.region = region;
  }

  close(): void {
    if (this.closed) return;

    this.closed = true;
    if (this.cancelFn) {
      this.cancelFn();
    }
  }

  receive(): AsyncIterable<T> {
    if (!this.currentStream) {
      throw new Error("Not subscribed. Call subscribe() first.");
    }
    return this.currentStream;
  }

  async subscribe(symbols: string[]): Promise<void> {
    // Cancel existing connection
    if (this.cancelFn) {
      this.cancelFn();
    }

    const streamId = uuidv4();
    const url = `${
      this.client["baseUrl"]
    }/api/v1/stock/price/live?filter=${symbols.join(",")}&region=${
      this.region
    }&stream=${streamId}`;

    const { events, cancel } = this.client.sendSSERequest<T>(url);

    this.currentStream = events;
    this.cancelFn = cancel;
    this.symbols = symbols;
    this.closed = false;
  }
}

export function getLivePrice<T>(
  client: Client,
  symbols: string[],
  region: Region
): ILivePriceClient<T> {
  if (!client) {
    throw new Error("Client cannot be null");
  }

  const livePriceClient = new LivePriceClientImpl<T>(client, region);
  livePriceClient.subscribe(symbols).catch((error) => {
    console.error("Failed to initialize live price client", error);
  });

  return livePriceClient;
}

export function getLivePriceForBIST(
  client: Client,
  symbols: string[]
): ILivePriceClient<BISTStockLiveData> {
  return getLivePrice<BISTStockLiveData>(client, symbols, Region.Tr);
}

export function getLivePriceForUS(
  client: Client,
  symbols: string[]
): ILivePriceClient<USStockLiveData> {
  return getLivePrice<USStockLiveData>(client, symbols, Region.Us);
}

export class LivePriceClient extends Client {
  getLivePriceForBIST(symbols: string[]): ILivePriceClient<BISTStockLiveData> {
    return getLivePriceForBIST(this, symbols);
  }

  getLivePriceForUS(symbols: string[]): ILivePriceClient<USStockLiveData> {
    return getLivePriceForUS(this, symbols);
  }
}
