import { Client } from "./client";
import { Region } from "./collections";
import { v4 as uuidv4 } from "uuid";

export interface BISTStockLiveData {
  s: string; // Symbol
  ch: number; // DailyPercentChange
  p: number;  // ClosePrice
  d: number; // Date
}

export interface USStockLiveData {
  s: string; // Symbol
  p: number; // Price
  d: number; // Date
}

export enum OrderbookLevelSide {
  Bid = "bid",
  Ask = "ask"
}

export interface OrderbookLevel {
	level: number;
	vol: number;
	orders: number;
	p: number;
	side: OrderbookLevelSide;
}

export interface OrderbookDeletedLevel {
	level: number;
	side: OrderbookLevelSide;
}

export interface OrderbookLiveData {
  updated?: OrderbookLevel[];
  deleted?: OrderbookDeletedLevel[];
  symbol: string;
}

export enum PriceDataType {
  Live = "live",
  Delayed = "delayed",
  Orderbook = "orderbook",
}

export interface ILivePriceClient<T> {
  close(): void;
  receive(): AsyncIterable<T>;
  subscribe(symbols: string[]): Promise<void>;
}

class LivePriceClientImpl<T> implements ILivePriceClient<T> {
  private client: Client;
  private region: Region;
  private dataType: PriceDataType;
  private symbols: string[] = [];
  private closed = false;
  private currentStream: AsyncIterable<T> | null = null;
  private cancelFn: (() => void) | null = null;

  constructor(client: Client, region: Region, dataType: PriceDataType) {
    this.client = client;
    this.region = region;
    this.dataType = dataType;
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
    let url: string;

    switch (this.dataType) {
      case PriceDataType.Live:
        url = `${
          this.client["baseUrl"]
        }/api/v2/stock/price/live?filter=${symbols.join(",")}&region=${
          this.region
        }&stream=${streamId}`;
        break;
      case PriceDataType.Delayed:
        url = `${
          this.client["baseUrl"]
        }/api/v1/stock/price/delayed?filter=${symbols.join(",")}&region=${
          this.region
        }&stream=${streamId}`;
        break;
      case PriceDataType.Orderbook:
        url = `${
          this.client["baseUrl"]
        }/api/v1/stock/orderbook/live?filter=${symbols.join(",")}&region=${
          this.region
        }&stream=${streamId}`;
        break;
    }

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

  const livePriceClient = new LivePriceClientImpl<T>(client, region, PriceDataType.Live);
  livePriceClient.subscribe(symbols).catch((error) => {
    console.error("Failed to initialize live price client", error);
  });

  return livePriceClient;
}

export function getDelayedPrice<T>(
  client: Client,
  symbols: string[],
  region: Region,
): ILivePriceClient<T> {
  if (!client) {
    throw new Error("Client cannot be null");
  }

  const livePriceClient = new LivePriceClientImpl<T>(client, region, PriceDataType.Delayed);
  livePriceClient.subscribe(symbols).catch((error) => {
    console.error("Failed to initialize live price client", error);
  });

  return livePriceClient;
}

function getOrderbook<T>(
  client: Client,
  symbols: string[],
  region: Region,
): ILivePriceClient<T> {
  if (!client) {
    throw new Error("Client cannot be null");
  }

  const orderbookClient = new LivePriceClientImpl<T>(client, region, PriceDataType.Orderbook);
  orderbookClient.subscribe(symbols).catch((error) => {
    console.error("Failed to initialize orderbook client", error);
  });

  return orderbookClient;
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

export function getDelayedPriceForBIST(
  client: Client,
  symbols: string[]
): ILivePriceClient<BISTStockLiveData> {
  return getDelayedPrice<BISTStockLiveData>(client, symbols, Region.Tr);
}

export function getOrderbookForBIST(
  client: Client,
  symbols: string[]
): ILivePriceClient<OrderbookLiveData> {
  return getOrderbook<OrderbookLiveData>(client, symbols, Region.Tr);
}

export class LivePriceClient extends Client {
  getLivePriceForBIST(symbols: string[]): ILivePriceClient<BISTStockLiveData> {
    return getLivePriceForBIST(this, symbols);
  }

  getLivePriceForUS(symbols: string[]): ILivePriceClient<USStockLiveData> {
    return getLivePriceForUS(this, symbols);
  }

  getDelayedPriceForBIST(
    symbols: string[],
  ): ILivePriceClient<BISTStockLiveData> {
    return getDelayedPriceForBIST(this, symbols);
  }

  getOrderbookForBIST(symbols: string[]): ILivePriceClient<OrderbookLiveData> {
    return getOrderbookForBIST(this, symbols);
  }
}
