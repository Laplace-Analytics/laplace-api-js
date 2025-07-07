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
}

export interface USStockLiveData {
  s: string;  // Symbol
  bp: number; // BidPrice
  ap: number; // AskPrice
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
  const url = `${client["baseUrl"]}/api/v1/stock/price/live?filter=${symbols.join(',')}&region=${region}&stream=${streamId}`;

  return client.sendSSERequest<T>(url);
}

export class LivePriceClient extends Client {
  async getWebSocketUrl(
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

  async updateUserDetails(params: UpdateUserDetailsParams): Promise<void> {
    const url = new URL(`${this["baseUrl"]}/api/v1/ws/user`);

    await this.sendRequest<void>({
      method: "PUT",
      url: url.toString(),
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
}
