import { Client } from './client';
import { Region } from './collections';
import { v4 as uuidv4 } from 'uuid';

function getLivePrice<T>(
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

export class LivePriceClient extends Client {
  getLivePriceForBIST(
    symbols: string[], 
    region: Region,
    streamId?: string,
  ): {
    events: AsyncIterable<BISTStockLiveData>,
    cancel: () => void
  } {
    return getLivePrice<BISTStockLiveData>(this, symbols, region, streamId);
  }

  getLivePriceForUS(
    symbols: string[], 
    region: Region,
    streamId?: string,
  ): {
    events: AsyncIterable<USStockLiveData>,
    cancel: () => void
  } {
    return getLivePrice<USStockLiveData>(this, symbols, region, streamId);
  }
}