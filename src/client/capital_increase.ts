import { Client } from './client';
import { Region } from './collections';

// type PaginatedResponse[T any] struct {
// 	RecordCount int `json:"recordCount"`
// 	Items       []T `json:"items"`
// }

export interface PaginatedResponse<T> {
  recordCount: number;
  items: T[];
}

export interface CapitalIncrease {
  id: number;
  boardDecisionDate: string;
  registeredCapitalCeiling: string;
  currentCapital: string;
  targetCapital: string;
  types: string[];
  spkApplicationResult: string | null;
  spkApplicationDate: string | null;
  spkApprovalDate: string | null;
  paymentDate: string | null;
  registrationDate: string | null;
  specifiedCurrency: string;
  symbol: string;
  relatedDisclosureIds: number[];
  rightsRate: string;
  rightsPrice: string;
  rightsTotalAmount: string;
  rightsStartDate: string | null;
  rightsEndDate: string | null;
  rightsLastSellDate: string | null;
  bonusRate: string;
  bonusTotalAmount: string;
  bonusStartDate: string | null;
  bonusDividendRate: string;
  bonusDividendTotalAmount: string;
  externalCapitalIncreaseAmount: string;
  externalCapitalIncreaseRate: string;
}

export class CapitalIncreaseClient extends Client {
  async getAllCapitalIncreases(
    page: number,
    size: number,
    region: Region
  ): Promise<PaginatedResponse<CapitalIncrease>> {
    return this.sendRequest<PaginatedResponse<CapitalIncrease>>({
      method: 'GET',
      url: '/api/v1/capital-increase/all',
      params: { region, page, size },
    });
  }

  async getCapitalIncreasesForInstrument(
    symbol: string,
    page: number,
    size: number,
    region: Region,
  ): Promise<PaginatedResponse<CapitalIncrease>> {
    return this.sendRequest<PaginatedResponse<CapitalIncrease>>({
      method: 'GET',
      url: '/api/v1/capital-increase/' + symbol,
      params: { region, page, size },
    });
  }

  async getActiveRightsForInstrument(
    symbol: string,
    date: string,
    region: Region
  ): Promise<CapitalIncrease[]> {
    return this.sendRequest<CapitalIncrease[]>({
      method: 'GET',
      url: '/api/v1/rights/active/' + symbol,
      params: { date, region },
    });
  }
}
