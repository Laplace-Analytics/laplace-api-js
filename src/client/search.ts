import { Client } from './client';
import { Region, Locale } from './collections';

export enum SearchType {
  Stock = 'stock',
  Collection = 'collection',
  Sector = 'sector',
  Industry = 'industry',
}

export interface SearchResponseStock {
  id: string;
  name: string;
  title: string;
  region: string;
  assetType: string;
  type: string;
}

export interface SearchResponseCollection {
  id: string;
  title: string;
  region: string[];
  assetClass: string;
  imageUrl: string;
  avatarUrl: string;
}

export interface SearchResponse {
  stocks: SearchResponseStock[];
  collections: SearchResponseCollection[];
  sectors: SearchResponseCollection[];
  industries: SearchResponseCollection[];
}

export class SearchClient extends Client {
  async search(query: string, types: SearchType[], region: Region, locale: Locale): Promise<SearchResponse> {
    const typesStr = types.join(',');

    return this.sendRequest<SearchResponse>({
      method: 'GET',
      url: '/api/v1/search',
      params: {
        filter: query,
        types: typesStr,
        region,
        locale,
      },
    });
  }
}