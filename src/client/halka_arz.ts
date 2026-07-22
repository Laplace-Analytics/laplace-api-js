import { PaginatedResponse } from "./capital_increase";
import { Client } from "./client";
import { Region } from "./collections";
import { Currency } from "./financial_ratios";

// Derived from the offering's dates at read time; never persisted upstream.
export enum HalkaArzStatus {
  Upcoming = "upcoming", // announced, demand not started
  Collecting = "collecting", // talep toplama in progress
  Allocated = "allocated", // demand closed, not yet trading
  Trading = "trading", // listed on the exchange
}

export enum HalkaArzOfferingType {
  CapitalIncrease = "capital_increase", // sermaye artırımı
  ShareholderSale = "shareholder_sale", // ortak satışı
  Mixed = "mixed", // karma
}

// Satış yöntemi. Both variants collect demand over a window; they differ only in
// how the investor order is placed downstream.
export enum HalkaArzSaleMethod {
  TalepToplama = "talep_toplama", // talep toplama yöntemi
  BorsadaSatis = "borsada_satis", // borsada satış yöntemi
}

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
  offeringType: HalkaArzOfferingType | null;
  consortiumLeader: string | null;
  saleMethod: HalkaArzSaleMethod;
  additionalShares: number | null;
  distributionMethod: string | null;
  freeFloatRate: number | null;
  intendedMarket: string | null;
  sector: string | null;
  maxLotPerInvestor: number | null;
  currency: Currency;
  relatedDisclosureIds: number[];
  reviewed: boolean;
  createdAt: string;
  updatedAt: string;
  status: HalkaArzStatus;
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
