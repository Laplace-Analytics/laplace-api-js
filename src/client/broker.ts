import { Client } from "./client";
import { Region } from "./collections";
import { AssetClass, AssetType } from "./stocks";

export enum BrokerSort {
  NetBuy = "netBuy",
  NetSell = "netSell",
  Volume = "volume",
}

export interface Broker {
  id: number;
  symbol: string;
  name: string;
  longName: string;
  logo: string;
}

export interface BrokerStock {
  symbol: string;
  name: string;
  id: string;
  assetType: AssetType;
  assetClass: AssetClass;
  region: Region;
}

export interface BaseBrokerStats {
  totalBuyAmount: number;
  totalSellAmount: number;
  netAmount: number;
  totalBuyVolume: number;
  totalSellVolume: number;
  totalVolume: number;
  totalAmount: number;
}

export interface BrokerStats extends BaseBrokerStats {
  broker: Broker;
}

export interface MarketBrokersResponse {
  recordCount: number;
  totalStats: BaseBrokerStats;
  items: BrokerStats[];
}

export interface TopBrokersResponse {
  topStats: BaseBrokerStats;
  restStats: BaseBrokerStats;
  topItems: BrokerStats[];
}

export interface StockBrokerStats extends BaseBrokerStats {
  averageCost: number;
  broker: Broker;
}

export interface StockOverallStats extends BaseBrokerStats {
  averageCost: number;
}

export interface StockBrokersResponse {
  recordCount: number;
  totalStats: StockOverallStats;
  items: StockBrokerStats[];
}

export interface TopStockBrokersResponse {
  topStats: StockOverallStats;
  restStats: StockOverallStats;
  topItems: StockBrokerStats[];
}

export interface BrokerStockStats extends BaseBrokerStats {
  stock: BrokerStock;
}

export interface TopStocksForBrokerResponse {
  topStats: BaseBrokerStats;
  restStats: BaseBrokerStats;
  topItems: BrokerStockStats[];
}

export class BrokerClient extends Client {
  private static readonly BASE = "/api/v1/brokers";

  async getMarketBrokers(
    region: Region,
    fromDate: string,
    toDate: string,
    sortBy: BrokerSort,
    page: number = 0,
    size: number = 10
  ): Promise<MarketBrokersResponse> {
    return this.sendRequest<MarketBrokersResponse>({
      method: "GET",
      url: BrokerClient.BASE + "/market",
      params: {
        region,
        fromDate,
        toDate,
        sortBy,
        page,
        size,
      },
    });
  }

  async getTopMarketBrokers(
    region: Region,
    fromDate: string,
    toDate: string,
    sortBy: BrokerSort,
    top: number = 5
  ): Promise<TopBrokersResponse> {
    return this.sendRequest<TopBrokersResponse>({
      method: "GET",
      url: BrokerClient.BASE + "/market/top",
      params: {
        region,
        fromDate,
        toDate,
        sortBy,
        top,
      },
    });
  }

  async getStockBrokers(
    region: Region,
    fromDate: string,
    toDate: string,
    sortBy: BrokerSort,
    symbol: string,
    page: number = 0,
    size: number = 10
  ): Promise<StockBrokersResponse> {
    return this.sendRequest<StockBrokersResponse>({
      method: "GET",
      url: BrokerClient.BASE + "/stock",
      params: {
        region,
        fromDate,
        toDate,
        sortBy,
        page,
        size,
        symbol,
      },
    });
  }

  async getTopStockBrokers(
    region: Region,
    fromDate: string,
    toDate: string,
    sortBy: BrokerSort,
    symbol: string,
    top: number = 5
  ): Promise<TopStockBrokersResponse> {
    return this.sendRequest<TopStockBrokersResponse>({
      method: "GET",
      url: BrokerClient.BASE + "/stock/top",
      params: {
        region,
        fromDate,
        toDate,
        sortBy,
        top,
        symbol,
      },
    });
  }

  async getTopStocksForBroker(
    region: Region,
    fromDate: string,
    toDate: string,
    sortBy: BrokerSort,
    brokerSymbol: string,
    top: number = 5
  ): Promise<TopStocksForBrokerResponse> {
    return this.sendRequest<TopStocksForBrokerResponse>({
      method: "GET",
      url: BrokerClient.BASE + "/top",
      params: {
        region,
        fromDate,
        toDate,
        sortBy,
        top,
        brokerSymbol,
      },
    });
  }
}
