import { Client } from "./client";
import { Region } from "./collections";

export interface KeyInsight {
  symbol: string;
  insight: string;
}

export class KeyInsightClient extends Client {
  async getKeyInsights(symbol: string, region: Region) {
    return this.sendRequest<KeyInsight>({
      method: "GET",
      url: "/api/v1/key-insight",
      params: { symbol, region },
    });
  }
}
