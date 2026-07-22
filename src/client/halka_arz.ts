import { PaginatedResponse } from "./capital_increase";
import { Client } from "./client";
import { Region } from "./collections";

export interface HalkaArz {
  id: number;
  companyName: string;
  symbol: string | null;
  instrumentId: number | null;
  priceMin: number | null;
  priceMax: number | null;
  demandStartDate: string | null;
  demandEndDate: string | null;
  firstTradingDate: string | null;
  sharesOffered: number | null;
  offeringSize: number | null;
  offeringType: string | null;
  consortiumLeader: string | null;
  saleMethod: string;
  additionalShares: number | null;
  distributionMethod: string | null;
  freeFloatRate: number | null;
  intendedMarket: string | null;
  sector: string | null;
  maxLotPerInvestor: number | null;
  currency: string;
  relatedDisclosureIds: number[];
  reviewed: boolean;
  createdAt: string;
  updatedAt: string;
  status: string;
  isFixedPrice: boolean;
}

export class HalkaArzClient extends Client {
  async getAllHalkaArz(
    size: number,
    region: Region,
    page?: number,
  ): Promise<PaginatedResponse<HalkaArz>> {
    return this.sendRequest<PaginatedResponse<HalkaArz>>({
      method: "GET",
      url: "/api/v1/ipo/all",
      params: { region, size, ...(page != null && { page }) },
    });
  }

  async getHalkaArzById(id: number): Promise<HalkaArz> {
    return this.sendRequest<HalkaArz>({
      method: "GET",
      url: `/api/v1/ipo/${id}`,
    });
  }
}
