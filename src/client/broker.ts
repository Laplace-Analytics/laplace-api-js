import { Client } from "./client";
import { Region } from "./collections";
import { AssetClass, AssetType } from "./stocks";

export enum BrokerSort {
  NetAmount = "netAmount",
  TotalAmount = "totalAmount",
  TotalVolume = "totalVolume",
  TotalBuyAmount = "totalBuyAmount",
  TotalBuyVolume = "totalBuyVolume",
  TotalSellAmount = "totalSellAmount",
  TotalSellVolume = "totalSellVolume",
}

export enum BrokerSortDirection {
  Desc = "desc",
  Asc = "asc",
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
}

export interface BrokerStats {
  totalBuyAmount: number;
  totalSellAmount: number;
  netAmount: number;
  totalBuyVolume: number;
  totalSellVolume: number;
  totalVolume: number;
  totalAmount: number;
  averageCost?: number;
}

export interface BrokerResponseItem extends BrokerStats {
  broker?: Broker;
  stock?: BrokerStock;
}

export interface BrokerListResponse {
  recordCount: number;
  totalStats: BrokerStats;
  items: BrokerResponseItem[];
}

export interface BrokerSimpleListResponse {
  recordCount: number;
  items: Broker[];
}

export class BrokerClient extends Client {
  private static readonly BASE = "/api/v1/brokers";

  async getBrokers(
    region: Region,
    page: number,
    size: number
  ): Promise<BrokerSimpleListResponse> {
    return this.sendRequest<BrokerSimpleListResponse>({
      method: "GET",
      url: BrokerClient.BASE,
      params: {
        region,
        page,
        size,
      },
    });
  }

  async getMarketStocks(
    region: Region,
    sortBy: BrokerSort,
    sortDirection: BrokerSortDirection,
    fromDate: string,
    toDate: string,
    page: number,
    size: number
  ): Promise<BrokerListResponse> {
    return this.sendRequest<BrokerListResponse>({
      method: "GET",
      url: BrokerClient.BASE + "/market/stock",
      params: {
        region,
        sortBy,
        sortDirection,
        fromDate,
        toDate,
        page,
        size,
      },
    });
  }

  async getMarketBrokers(
    region: Region,
    sortBy: BrokerSort,
    sortDirection: BrokerSortDirection,
    fromDate: string,
    toDate: string,
    page: number,
    size: number
  ): Promise<BrokerListResponse> {
    return this.sendRequest<BrokerListResponse>({
      method: "GET",
      url: BrokerClient.BASE + "/market",
      params: {
        region,
        sortBy,
        sortDirection,
        fromDate,
        toDate,
        page,
        size,
      },
    });
  }

  async getBrokersByStock(
    symbol: string,
    region: Region,
    sortBy: BrokerSort,
    sortDirection: BrokerSortDirection,
    fromDate: string,
    toDate: string,
    page: number,
    size: number
  ): Promise<BrokerListResponse> {
    return this.sendRequest<BrokerListResponse>({
      method: "GET",
      url: BrokerClient.BASE + "/" + symbol,
      params: {
        symbol,
        region,
        sortBy,
        sortDirection,
        fromDate,
        toDate,
        page,
        size,
      },
    });
  }

  async getStocksByBroker(
    symbol: string,
    region: Region,
    sortBy: BrokerSort,
    sortDirection: BrokerSortDirection,
    fromDate: string,
    toDate: string,
    page: number,
    size: number
  ): Promise<BrokerListResponse> {
    return this.sendRequest<BrokerListResponse>({
      method: "GET",
      url: BrokerClient.BASE + "/stock/" + symbol,
      params: {
        symbol,
        region,
        sortBy,
        sortDirection,
        fromDate,
        toDate,
        page,
        size,
      },
    });
  }
}
