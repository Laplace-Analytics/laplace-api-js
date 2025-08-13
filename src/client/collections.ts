import { Client } from './client';
import { HistoricalPricePeriod, PriceDataPoint, Stock } from './stocks';

export enum CollectionType {
  Sector = 'sector',
  Industry = 'industry',
  Theme = 'theme',
  CustomTheme = 'custom-theme',
  Collection = 'collection',
}

export enum Region {
  Tr = 'tr',
  Us = 'us',
}

export enum Locale {
  Tr = 'tr',
  En = 'en',
}

export enum SortBy {
  PriceChange = "price_change"
}

export interface Collection {
  id: string;
  title: string;
  description?: string;
  region?: Region[];
  assetClass?: string;
  imageUrl: string;
  avatarUrl: string;
  numStocks: number;
  image?: string;
  order?: number;
  status?: string;
  metaData?: Record<string, any>;
}

export interface CollectionDetail extends Collection {
  stocks: Stock[];
}

export interface CollectionPriceGraph {
	previous_close: number;
	graph: PriceDataPoint[];
}

export class CollectionClient extends Client {
  async getAllSectors(region: Region, locale: Locale): Promise<Collection[]> {
    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/sector`,
      params: { region, locale },
    });
  }
 
  async getAllIndustries(region: Region, locale: Locale): Promise<Collection[]> {
    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/industry`,
      params: { region, locale },
    });
  }
 
  async getAllThemes(region: Region, locale: Locale): Promise<Collection[]> {
    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/theme`,
      params: { region, locale },
    });
  }
 
  async getAllCollections(region: Region, locale: Locale): Promise<Collection[]> {
    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/collection`,
      params: { region, locale },
    });
  }
 
  async getSectorDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/sector/${id}`,
      params: { region, locale },
    });
  }
 
  async getIndustryDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/industry/${id}`,
      params: { region, locale },
    });
  }
 
  async getThemeDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/theme/${id}`,
      params: { region, locale },
    });
  }
 
  async getCollectionDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/collection/${id}`,
      params: { region, locale },
    });
  }

  async getAggregateGraph(period: HistoricalPricePeriod, sectorId: string, industryId: string, collectionId: string, region: Region): Promise<CollectionPriceGraph> {
    return this.sendRequest<CollectionPriceGraph>({
      method: 'GET',
      url: `/api/v1/aggregate/graph`,
      params: { period, sectorId, industryId, collectionId, region },
    });
  }
 }