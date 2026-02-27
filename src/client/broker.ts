import { PaginatedResponse } from "./capital_increase";
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

export enum SortDirection {
  Desc = "desc",
  Asc = "asc",
}

export interface Broker {
  id: number;
  symbol: string;
  name: string;
  longName: string;
  logo: string;
  supportedAssetClasses?: AssetClass[]
}

export interface BrokerStock {
  symbol: string;
  name: string;
  id: string;
  assetType: AssetType;
  assetClass: AssetClass;
  logoUrl?: string;
  exchange?: string;
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

export interface BrokerItem extends BrokerStats {
  broker?: Broker;
  stock?: BrokerStock;
}

export interface BrokerList extends PaginatedResponse<BrokerItem> {
  totalStats: BrokerStats;
}

export class BrokerClient extends Client {

  async getBrokers(
    region: Region,
    size: number,
    page?: number,
    assetClass?: AssetClass
  ): Promise<PaginatedResponse<Broker>> {
    return this.sendRequest<PaginatedResponse<Broker>>({
      method: "GET",
      url: "/api/v1/brokers",
      params: {
        region,
        size,
        ...(page != null && { page }),
        ...(assetClass != null && { assetClass }),
      },
    });
  }

  async getMarketStocks(
    region: Region,
    sortBy: BrokerSort,
    sortDirection: SortDirection,
    fromDate: string,
    toDate: string,
    size: number,
    page?: number,
  ): Promise<BrokerList> {
    return this.sendRequest<BrokerList>({
      method: "GET",
      url: "/api/v1/brokers/market/stock",
      params: {
        region,
        sortBy,
        sortDirection,
        fromDate,
        toDate,
        size,
        ...(page != null && { page }),
      },
    });
  }

  async getMarketBrokers(
    region: Region,
    sortBy: BrokerSort,
    sortDirection: SortDirection,
    fromDate: string,
    toDate: string,
    size: number,
    page?: number,
  ): Promise<BrokerList> {
    return this.sendRequest<BrokerList>({
      method: "GET",
      url: "/api/v1/brokers/market",
      params: {
        region,
        sortBy,
        sortDirection,
        fromDate,
        toDate,
        size,
        ...(page != null && { page }),
      },
    });
  }

  async getBrokersByStock(
    symbol: string,
    region: Region,
    sortBy: BrokerSort,
    sortDirection: SortDirection,
    fromDate: string,
    toDate: string,
    size: number,
    page?: number,
  ): Promise<BrokerList> {
    return this.sendRequest<BrokerList>({
      method: "GET",
      url: `/api/v1/brokers/${symbol}`,
      params: {
        region,
        sortBy,
        sortDirection,
        fromDate,
        toDate,
        size,
        ...(page != null && { page }),
      },
    });
  }

  async getStocksByBroker(
    symbol: string,
    region: Region,
    sortBy: BrokerSort,
    sortDirection: SortDirection,
    fromDate: string,
    toDate: string,
    size: number,
    page?: number,
  ): Promise<BrokerList> {
    return this.sendRequest<BrokerList>({
      method: "GET",
      url: `/api/v1/brokers/stock/${symbol}`,
      params: {
        region,
        sortBy,
        sortDirection,
        fromDate,
        toDate,
        size,
        ...(page != null && { page }),
      },
    });
  }
}
