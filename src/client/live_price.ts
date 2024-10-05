import { Client } from './client';
import { Region } from './collections';
import { v4 as uuidv4 } from 'uuid';

async function* getLivePrice<T>(
  client: Client,
  symbols: string[],
  region: Region,
  streamId: string = uuidv4(),
): AsyncGenerator<T, void, undefined> {
  const url = `${client["baseUrl"]}/api/v1/stock/price/live?filter=${symbols.join(',')}&region=${region}&stream=${streamId}`;

  const { events, cancel } = client.sendSSERequest<T>(url);

  try {
    yield* events;
  } finally {
    cancel();
  }
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
  ): AsyncGenerator<BISTStockLiveData, void, undefined> {
    return getLivePrice<BISTStockLiveData>(this, symbols, region, streamId);
  }

  getLivePriceForUS(
    symbols: string[], 
    region: Region,
    streamId?: string,
  ): AsyncGenerator<USStockLiveData, void, undefined> {
    return getLivePrice<USStockLiveData>(this, symbols, region, streamId);
  }
}