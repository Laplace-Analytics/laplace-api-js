import { Client } from "./client";
import { Region } from "./collections";
import { AssetType } from "./stocks";

export enum FundType {
  STOCK_UMBRELLA_FUND = "STOCK_UMBRELLA_FUND",
  VARIABLE_UMBRELLA_FUND = "VARIABLE_UMBRELLA_FUND",
  PARTICIPATION_UMBRELLA_FUND = "PARTICIPATION_UMBRELLA_FUND",
  FLEXIBLE_UMBRELLA_FUND = "FLEXIBLE_UMBRELLA_FUND",
  FUND_BASKET_UMBRELLA_FUND = "FUND_BASKET_UMBRELLA_FUND",
  MONEY_MARKET_UMBRELLA_FUND = "MONEY_MARKET_UMBRELLA_FUND",
  PRECIOUS_METALS_UMBRELLA_FUND = "PRECIOUS_METALS_UMBRELLA_FUND",
  DEBT_INSTRUMENTS_UMBRELLA_FUND = "DEBT_INSTRUMENTS_UMBRELLA_FUND",
  MIXED_UMBRELLA_FUND = "MIXED_UMBRELLA_FUND",
  UNKNOWN_FUND_TYPE = "UNKNOWN_FUND_TYPE",
}

export interface Fund {
  assetType: AssetType;
  name: string;
  symbol: string;
  active: boolean;
  managementFee: number;
  riskLevel: number;
  fundType: FundType;
  ownerSymbol: string;
}

export interface FundStats {
  yearBeta: number;
  yearStdev: number;
  ytdReturn: number;
  yearMomentum: number;
  yearlyReturn: number;
  monthlyReturn: number;
  fiveYearReturn: number;
  sixMonthReturn: number;
  threeYearReturn: number;
  threeMonthReturn: number;
}

export enum FundContentType {
  BIST_STOCK = "BIST_STOCK",
  OTHER_STOCK = "OTHER_STOCK",
  UNKNOWN = "UNKNOWN",
}

export enum FundAssetCategory {
  OTHER = "OTHER",
  EQUITY = "EQUITY",
  LIQUID_DEPOSIT = "LIQUID_DEPOSIT",
  FUTURES_CASH_COLLATERAL = "FUTURES_CASH_COLLATERAL",
  INVESTMENT_FUNDS = "INVESTMENT_FUNDS",
  PARTICIPATION_ACCOUNT = "PARTICIPATION_ACCOUNT",
  PRECIOUS_METALS = "PRECIOUS_METALS",
  CORPORATE_BOND = "CORPORATE_BOND",
  CURRENCY = "CURRENCY",
  PUBLIC_EXTERNAL_DEBT_SECURITIES = "PUBLIC_EXTERNAL_DEBT_SECURITIES",
  PRIVATE_SECTOR_EXTERNAL_DEBT_SECURITIES = "PRIVATE_SECTOR_EXTERNAL_DEBT_SECURITIES",
  PUBLIC_LEASE_CERTIFICATES = "PUBLIC_LEASE_CERTIFICATES",
  PRIVATE_SECTOR_LEASE_CERTIFICATES = "PRIVATE_SECTOR_LEASE_CERTIFICATES",
  FOREIGN_EXCHANGE_TRADED_FUNDS = "FOREIGN_EXCHANGE_TRADED_FUNDS",
  PUBLIC_LEASE_CERTIFICATES_CURRENCY = "PUBLIC_LEASE_CERTIFICATES_CURRENCY",
  GOVERNMENT_BOND = "GOVERNMENT_BOND",
  PRIVATE_SECTOR_LEASE_CERTIFICATES_CURRENCY = "PRIVATE_SECTOR_LEASE_CERTIFICATES_CURRENCY",
  UNKNOWN = "UNKNOWN",
}

export interface FundAsset {
  type: FundContentType;
  symbol: string;
  wholePercentage: number;
  categoryPercentage: number;
}

export interface FundDistribution {
  categories: FundCategoryDistribution[];
}

export interface FundCategoryDistribution {
  category: FundAssetCategory;
  percentage: number;
  assets?: FundAsset[];
}

export enum HistoricalFundPricePeriod {
  OneWeek = "1H",
  OneMonth = "1A",
  ThreeMonth = "3A",
  OneYear = "1Y",
  ThreeYear = "3Y",
  FiveYear = "5Y",
}

export interface FundHistoricalPrice {
  aum: number;
  date: string;
  price: number;
  shareCount: number;
  investorCount: number;
}

export class FundsClient extends Client {
  async getFunds(region: Region, page: number, pageSize: number) {
    return this.sendRequest<Fund[]>({
      method: "GET",
      url: `/api/v1/fund`,
      params: { region, page, pageSize },
    });
  }

  async getFundStats(symbol: string, region: Region) {
    return this.sendRequest<FundStats>({
      method: "GET",
      url: `/api/v1/fund/stats`,
      params: { symbol, region },
    });
  }

  async getFundDistribution(symbol: string, region: Region) {
    return this.sendRequest<FundDistribution>({
      method: "GET",
      url: `/api/v1/fund/distribution`,
      params: { symbol, region },
    });
  }

  async getHistoricalFundPrices(
    symbol: string,
    region: Region,
    period: HistoricalFundPricePeriod
  ) {
    return this.sendRequest<FundHistoricalPrice[]>({
      method: "GET",
      url: `/api/v1/fund/price`,
      params: { symbol, region, period },
    });
  }
}
