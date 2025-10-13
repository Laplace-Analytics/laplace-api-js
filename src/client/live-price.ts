import { Client } from "./client";
import { Region } from "./collections";
import { v4 as uuidv4 } from "uuid";
import { LivePriceFeed } from "./live-price-web-socket";

export type MessageType = "pr" | "state_change" | "heartbeat" | "ob";

// Stream Message Wrapper - v2 formatter wraps all messages in this structure
export interface StreamMessage<T> {
  t: MessageType;
  d: T; 
}

export interface BISTStockPriceData {
  s: string; // Symbol
  ch: number; // DailyPercentChange
  p: number;  // ClosePrice
  d: number; // Date
}

export interface USStockPriceData {
  s: string; // Symbol
  p: number; // Price
  d: number; // Date
}

export type BISTStockStreamData = StreamMessage<BISTStockPriceData>;
export type USStockStreamData = StreamMessage<USStockPriceData>;
export type BISTBidAskStreamData = StreamMessage<BISTBidAskData>;

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

export interface BISTBidAskData {
  d: string;
  s: string;
  ask: number;
  bid: number;
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
  Bids = "bids",
}

interface WebSocketUrlResponse {
  url: string;
}

interface WebSocketUsageResponse {
  externalUserID: string;
  firstConnectionTime: Date;
  uniqueDeviceCount: number;
}

interface WebSocketUrlParams {
  externalUserId: string;
  feeds: LivePriceFeed[];
}

export enum AccessorType {
  User = "user",
}

interface UpdateUserDetailsParams {
  externalUserID: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  city?: string;
  countryCode?: string;
  accessorType?: AccessorType;
  active: boolean;
}

export interface SendWebsocketEventRequest {
  externalUserID?: string;
  event: Record<string, any>;
  transient?: boolean;
  broadCastToAll?: boolean;
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
      case PriceDataType.Bids:
        url = `${
          this.client["baseUrl"]
        }/api/v1/stock/price/bids?filter=${symbols.join(",")}&region=${
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

function getBidAsk<T>(
  client: Client,
  symbols: string[],
  region: Region
): ILivePriceClient<T> {
  if (!client) {
    throw new Error("Client cannot be null");
  }

  const bidAskClient = new LivePriceClientImpl<T>(
    client,
    region,
    PriceDataType.Bids
  );
  bidAskClient.subscribe(symbols).catch((error) => {
    console.error("Failed to initialize bist bid ask client", error);
  });

  return bidAskClient;
}

export function getLivePriceForBIST(
  client: Client,
  symbols: string[]
): ILivePriceClient<BISTStockStreamData> {
  return getLivePrice<BISTStockStreamData>(client, symbols, Region.Tr);
}

export function getLivePriceForUS(
  client: Client,
  symbols: string[]
): ILivePriceClient<USStockStreamData> {
  return getLivePrice<USStockStreamData>(client, symbols, Region.Us);
}

export function getDelayedPriceForBIST(
  client: Client,
  symbols: string[]
): ILivePriceClient<BISTStockStreamData> {
  return getDelayedPrice<BISTStockStreamData>(client, symbols, Region.Tr);
}

export function getOrderbookForBIST(
  client: Client,
  symbols: string[]
): ILivePriceClient<OrderbookLiveData> {
  return getOrderbook<OrderbookLiveData>(client, symbols, Region.Tr);
}

export function getBidAskForBIST(
  client: Client,
  symbols: string[]
): ILivePriceClient<BISTBidAskStreamData> {
  return getBidAsk<BISTBidAskStreamData>(client, symbols, Region.Tr);
}

export class LivePriceClient extends Client {
  getLivePriceForBIST(symbols: string[]): ILivePriceClient<BISTStockStreamData> {
    return getLivePriceForBIST(this, symbols);
  }

  getLivePriceForUS(symbols: string[]): ILivePriceClient<USStockStreamData> {
    return getLivePriceForUS(this, symbols);
  }

  getDelayedPriceForBIST(
    symbols: string[],
  ): ILivePriceClient<BISTStockStreamData> {
    return getDelayedPriceForBIST(this, symbols);
  }

  getOrderbookForBIST(symbols: string[]): ILivePriceClient<OrderbookLiveData> {
    return getOrderbookForBIST(this, symbols);
  }

  getBidAskForBIST(symbols: string[]): ILivePriceClient<BISTBidAskStreamData> {
    return getBidAskForBIST(this, symbols);
  }

  async getClientWebsocketUrl(
    externalUserId: string,
    feeds: LivePriceFeed[]
  ): Promise<string> {
    const url = new URL(`${this["baseUrl"]}/api/v2/ws/url`);

    const params: WebSocketUrlParams = {
      externalUserId,
      feeds
    };

    const response = await this.sendRequest<WebSocketUrlResponse>({
      method: "POST",
      url: url.toString(),
      data: params,
    });

    return response.url;
  }

  async getWebsocketUsageForMonth(
    month: string,
    year: string,
    feedType: LivePriceFeed,
  ): Promise<WebSocketUsageResponse[]> {
    const url = new URL(`${this["baseUrl"]}/api/v1/ws/report`);
    url.searchParams.append("month", month);
    url.searchParams.append("year", year);
    url.searchParams.append("feedType", feedType);

    const response = await this.sendRequest<WebSocketUsageResponse[]>({
      method: "GET",
      url: url.toString(),
    });

    return response;
  }

  async sendWebsocketEvent(
    request: SendWebsocketEventRequest
  ): Promise<void> {
    const url = new URL(`${this["baseUrl"]}/api/v1/ws/event`);

    await this.sendRequest<void>({
      method: "POST",
      url: url.toString(),
      data: request,
    });
  }
}
