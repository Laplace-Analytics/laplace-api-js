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
  region: Region;
  assetType: string;
  type: string;
}

export interface SearchResponseCollection {
  id: string;
  title: string;
  region: Region[];
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
  async search(query: string, types: SearchType[], locale: Locale, region?: Region, page?: number, size?: number): Promise<SearchResponse> {
    const typesStr = types.join(',');

    const params = {
      filter: query,
      types: typesStr,
      locale,
      ...(region != null && { region }),
      ...(page != null && { page }),
      ...(size != null && { size })
    }

    return this.sendRequest<SearchResponse>({
      method: 'GET',
      url: '/api/v1/search',
      params: params,
    });
  }
}