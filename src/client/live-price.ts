import { Client } from "./client";
import { Region } from "./collections";
import { v4 as uuidv4 } from 'uuid';
import { LivePriceFeed } from "./live-price-web-socket";

interface WebSocketUrlResponse {
  url: string;
}

interface WebSocketUrlParams {
  externalUserId: string;
  feeds: LivePriceFeed[];
}

export interface BISTStockLiveData {
  s: string;  // Symbol
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
  updated?: string; // Symbol
  deleted?: number; // Price
  symbol: number; // Date
}

export enum AccessorType {
  User = "user"
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

function getSSELivePrice<T>(
  client: Client,
  symbols: string[],
  region: Region,
  streamId: string = uuidv4(),
): {
  events: AsyncIterable<T>,
  cancel: () => void
} {
  const url = `${client["baseUrl"]}/api/v2/stock/price/live?filter=${symbols.join(',')}&region=${region}&stream=${streamId}`;

  return client.sendSSERequest<T>(url);
}

function getSSEDelayedPrice<T>(
  client: Client,
  symbols: string[],
  region: Region,
  streamId: string = uuidv4(),
): {
  events: AsyncIterable<T>,
  cancel: () => void
} {
  const url = `${client["baseUrl"]}/api/v1/stock/price/delayed?filter=${symbols.join(',')}&region=${region}&stream=${streamId}`;

  return client.sendSSERequest<T>(url);
}

function getSSEOrderbookLivePrice<T>(
  client: Client,
  symbols: string[],
  region: Region,
  streamId: string = uuidv4(),
): {
  events: AsyncIterable<T>,
  cancel: () => void
} {
  const url = `${client["baseUrl"]}/api/v1/stock/orderbook/live?filter=${symbols.join(',')}&region=${region}&stream=${streamId}`;

  return client.sendSSERequest<T>(url);
}

export class LivePriceClient extends Client {
  async getWebSocketUrl(
    externalUserId: string,
    feeds: LivePriceFeed[]
  ): Promise<string> {
    const params: WebSocketUrlParams = {
      externalUserId,
      feeds
    };

    const response = await this.sendRequest<WebSocketUrlResponse>({
      method: "POST",
      url: "/api/v2/ws/url",
      data: params,
    });

    return response.url;
  }

  async updateUserDetails(params: UpdateUserDetailsParams): Promise<void> {
    await this.sendRequest<void>({
      method: "PUT",
      url: "/api/v1/ws/user",
      data: params,
    });
  }

  getLivePriceForBIST(
    symbols: string[], 
    region: Region,
    streamId?: string,
  ): {
    events: AsyncIterable<BISTStockLiveData>,
    cancel: () => void
  } {
    return getSSELivePrice<BISTStockLiveData>(this, symbols, region, streamId);
  }

  getLivePriceForUS(
    symbols: string[], 
    region: Region,
    streamId?: string,
  ): {
    events: AsyncIterable<USStockLiveData>,
    cancel: () => void
  } {
    return getSSELivePrice<USStockLiveData>(this, symbols, region, streamId);
  }

  getDelayedPriceForBIST(
    symbols: string[], 
    region: Region,
    streamId?: string,
  ): {
    events: AsyncIterable<BISTStockLiveData>,
    cancel: () => void
  } {
    return getSSEDelayedPrice<BISTStockLiveData>(this, symbols, region, streamId);
  }

  getDelayedPriceForUS(
    symbols: string[], 
    region: Region,
    streamId?: string,
  ): {
    events: AsyncIterable<USStockLiveData>,
    cancel: () => void
  } {
    return getSSEDelayedPrice<USStockLiveData>(this, symbols, region, streamId);
  }

  getLiveOrderbook(
    symbols: string[], 
    region: Region,
    streamId?: string,
  ): {
    events: AsyncIterable<OrderbookLiveData>,
    cancel: () => void
  } {
    return getSSEOrderbookLivePrice<OrderbookLiveData>(this, symbols, region, streamId);
  }
}
