import { Client } from './client';
import { Collection, CollectionDetail, CollectionType, Region, Locale, SortBy } from './collections';
import { LocaleString } from './stocks';

export enum CollectionStatus {
  Active = 'active',
  Inactive = 'inactive',
}

export interface CreateCustomThemeParams {
  title: LocaleString;
  description?: LocaleString;
  region?: Region[];
  image_url?: string;
  image?: string;
  avatar_url?: string;
  stocks: string[]; // Using string instead of ObjectID
  order?: number;
  status: CollectionStatus;
  meta_data?: Record<string, any>;
}

export interface UpdateCustomThemeParams {
  title?: LocaleString;
  description?: LocaleString;
  image_url?: string;
  image?: string;
  avatar_url?: string;
  stockIds?: string[]; // Using string instead of ObjectID
  status?: CollectionStatus;
  meta_data?: Record<string, any>;
}

export class CustomThemeClient extends Client {
  private async getAllCollectionsPrivate(collectionType: CollectionType, locale: Locale, region?: Region): Promise<Collection[]> {
    const params = {
      locale,
      ...(region != null && { region }),
    };

    return this.sendRequest<Collection[]>({
      method: 'GET',
      url: `/api/v1/${collectionType}`,
      params: params,
    });
  }

  private async getCollectionDetailPrivate(id: string, collectionType: CollectionType, locale: Locale, sortBy: SortBy | null): Promise<CollectionDetail> {
    const params = {
      locale,
      ...(sortBy != null && { sortBy }),
    };
    
    return this.sendRequest<CollectionDetail>({
      method: 'GET',
      url: `/api/v1/${collectionType}/${id}`,
      params: params,
    });
  }


  async getAllCustomThemes(locale: Locale, region?: Region): Promise<Collection[]> {
    return this.getAllCollectionsPrivate(CollectionType.CustomTheme, locale, region);
  }

  async getCustomThemeDetail(id: string, locale: Locale, sortBy: SortBy | null): Promise<CollectionDetail> {
    return this.getCollectionDetailPrivate(id, CollectionType.CustomTheme, locale, sortBy);
  }

  async createCustomTheme(params: CreateCustomThemeParams): Promise<string> {    
    const response = await this.sendRequest<{ id: string }>({
      method: 'POST',
      url: `/api/v1/custom-theme`,
      data: params,
    });

    return response.id;
  }

  async updateCustomTheme(id: string, params: UpdateCustomThemeParams): Promise<void> {
    await this.sendRequest<void>({
      method: 'PATCH',
      url: `/api/v1/custom-theme/${id}`,
      data: params,
    });
  }

  async deleteCustomTheme(id: string): Promise<void> {
    await this.sendRequest<void>({
      method: 'DELETE',
      url: `/api/v1/custom-theme/${id}`,
    });
  }
}