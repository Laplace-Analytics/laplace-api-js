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
  private async getAllCollectionsPrivate(collectionType: CollectionType, region: Region, locale: Locale): Promise<Collection[]> {
    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/${collectionType}`,
      params: { region, locale },
    });
  }

  private async getCollectionDetailPrivate(id: string, collectionType: CollectionType, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/${collectionType}/${id}`,
      params: { region, locale },
    });
  }

  async getAllSectors(region: Region, locale: Locale): Promise<Collection[]> {
    return this.getAllCollectionsPrivate(CollectionType.Sector, region, locale);
  }

  async getAllIndustries(region: Region, locale: Locale): Promise<Collection[]> {
    return this.getAllCollectionsPrivate(CollectionType.Industry, region, locale);
  }

  async getAllThemes(region: Region, locale: Locale): Promise<Collection[]> {
    return this.getAllCollectionsPrivate(CollectionType.Theme, region, locale);
  }

  async getAllCustomThemes(region: Region, locale: Locale): Promise<Collection[]> {
    return this.getAllCollectionsPrivate(CollectionType.CustomTheme, region, locale);
  }

  async getAllCollections(region: Region, locale: Locale): Promise<Collection[]> {
    return this.getAllCollectionsPrivate(CollectionType.Collection, region, locale);
  }

  async getSectorDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.getCollectionDetailPrivate(id, CollectionType.Sector, region, locale);
  }

  async getIndustryDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.getCollectionDetailPrivate(id, CollectionType.Industry, region, locale);
  }

  async getThemeDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.getCollectionDetailPrivate(id, CollectionType.Theme, region, locale);
  }

  async getCustomThemeDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.getCollectionDetailPrivate(id, CollectionType.CustomTheme, region, locale);
  }

  async getCollectionDetail(id: string, region: Region, locale: Locale): Promise<CollectionDetail> {
    return this.getCollectionDetailPrivate(id, CollectionType.Collection, region, locale);
  }
}