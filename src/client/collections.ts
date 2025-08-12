import { Client } from './client';
import { Stock } from './stocks';

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

export class CollectionClient extends Client {
  async getAllSectors(region: Region, locale: Locale): Promise<Collection[]> {
    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/${CollectionType.Sector}`,
      params: { region, locale },
    });
  }
 
  async getAllIndustries(region: Region, locale: Locale): Promise<Collection[]> {
    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/${CollectionType.Industry}`,
      params: { region, locale },
    });
  }
 
  async getAllThemes(region: Region, locale: Locale): Promise<Collection[]> {
    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/${CollectionType.Theme}`,
      params: { region, locale },
    });
  }
 
  async getAllCollections(region: Region, locale: Locale): Promise<Collection[]> {
    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/${CollectionType.Collection}`,
      params: { region, locale },
    });
  }
 
  async getSectorDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/${CollectionType.Sector}/${id}`,
      params: { region, locale },
    });
  }
 
  async getIndustryDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/${CollectionType.Industry}/${id}`,
      params: { region, locale },
    });
  }
 
  async getThemeDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/${CollectionType.Theme}/${id}`,
      params: { region, locale },
    });
  }
 
  async getCollectionDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/${CollectionType.Collection}/${id}`,
      params: { region, locale },
    });
  }
 }