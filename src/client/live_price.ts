import { Client } from './client';
import { Region } from './collections';
import { v4 as uuidv4 } from 'uuid';

async function* getLivePrice<T>(
  client: Client,
  symbols: string[],
  region: Region
): AsyncGenerator<T, void, undefined> {
  const streamId = uuidv4();
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

export class LivePriceClient {
  constructor(private client: Client) {}

  getLivePriceForBIST(symbols: string[], region: Region): AsyncGenerator<BISTStockLiveData, void, undefined> {
    return getLivePrice<BISTStockLiveData>(this.client, symbols, region);
  }

  getLivePriceForUS(symbols: string[], region: Region): AsyncGenerator<USStockLiveData, void, undefined> {
    return getLivePrice<USStockLiveData>(this.client, symbols, region);
  }
}