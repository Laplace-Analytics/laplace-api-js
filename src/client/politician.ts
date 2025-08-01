import { Client } from "./client";

export interface Politician {
    id: number;
    politicianName: string;
    totalHoldings: number;
    lastUpdated: Date;
}

export interface Holding {
    politicianName: string;
    symbol: string;
    company: string;
    holding: string;
    allocation: string;
    lastUpdated: Date;
}

export interface HoldingShort {
    symbol: string;
    company: string;
    holding: string;
    allocation: string;
}

export interface TopHolding {
    symbol: string;
    company: string;
    politicians: TopHoldingPolitician[];
    count: number;
}

export interface TopHoldingPolitician {
    name: string;
    holding: string;
    allocation: string;
}

export interface PoliticianPortfolio {
    id: number;
    name: string;
    holdings: HoldingShort[];
    totalHoldings: number;
    lastUpdated: Date;
}

export class PoliticianClient extends Client {
    async getAllPolitician(): Promise<Politician[]> {
        return await this.sendRequest<Politician[]>({
            method: 'GET',
            url: `/api/v1/politician`,
        });
    }

    async getPoliticianHoldingBySymbol(symbol: string): Promise<Holding[]> {
        return await this.sendRequest<Holding[]>({
            method: 'GET',
            url: `/api/v1/holding/${symbol}`
        })
    }

    async getAllTopHoldings(): Promise<TopHolding[]> {
        return await this.sendRequest<TopHolding[]>({
            method: 'GET',
            url: `/api/v1/top-holding`
        })
    }

    async getPoliticianById(id: number): Promise<PoliticianPortfolio> {
        return await this.sendRequest<PoliticianPortfolio>({
            method: 'GET',
            url: `/api/v1/politician/${id}`
        })
    }
}