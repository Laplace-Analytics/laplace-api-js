import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import { Holding, Politician, PoliticianClient, PoliticianPortfolio, TopHolding } from "../client/politician";

describe("Politician", () => {
  let politicianClient: PoliticianClient;

  const mockPoliticians: Politician[] = [
    {
      id: 1,
      politicianName: "John Doe",
      totalHoldings: "$1,000,000",
      lastUpdated: new Date("2024-01-01")
    },
    {
      id: 2,
      politicianName: "Jane Smith",
      totalHoldings: "$2,500,000",
      lastUpdated: new Date("2024-01-02")
    }
  ];

  const mockHoldings: Holding[] = [
    {
      politicianName: "John Doe",
      symbol: "AAPL",
      company: "Apple Inc.",
      holding: "$500,000",
      allocation: "50%",
      lastUpdated: new Date("2024-01-01")
    },
    {
      politicianName: "John Doe",
      symbol: "GOOGL",
      company: "Alphabet Inc.",
      holding: "$500,000",
      allocation: "50%",
      lastUpdated: new Date("2024-01-01")
    }
  ];

  const mockTopHoldings: TopHolding[] = [
    {
      symbol: "AAPL",
      company: "Apple Inc.",
      politicians: [
        {
          name: "John Doe",
          holding: "$500,000",
          allocation: "50%"
        },
        {
          name: "Jane Smith",
          holding: "$1,000,000",
          allocation: "40%"
        }
      ],
      count: 2
    }
  ];

  const mockPoliticianPortfolio: PoliticianPortfolio = {
    id: 1,
    name: "John Doe",
    holdings: [
      {
        symbol: "AAPL",
        company: "Apple Inc.",
        holding: "$500,000",
        allocation: "50%"
      },
      {
        symbol: "GOOGL",
        company: "Alphabet Inc.",
        holding: "$500,000",
        allocation: "50%"
      }
    ],
    totalHoldings: 1000000,
    lastUpdated: new Date("2024-01-01")
  };

  beforeAll(async () => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    politicianClient = new PoliticianClient(config, logger);
  });

  describe("Integration Tests", () => {
    describe("getAllPolitician", () => {
      it("should fetch all politicians", async () => {
        const politicians = await politicianClient.getAllPolitician();
        expect(Array.isArray(politicians)).toBe(true);
        if (politicians.length > 0) {
          expect(politicians[0]).toHaveProperty("id");
          expect(politicians[0]).toHaveProperty("politicianName");
          expect(politicians[0]).toHaveProperty("totalHoldings");
          expect(politicians[0]).toHaveProperty("lastUpdated");
        }
      });
    });

    describe("getPoliticianHoldingBySymbol", () => {
      it("should fetch holdings for a specific symbol", async () => {
        const symbol = "AAPL";
        const holdings = await politicianClient.getPoliticianHoldingBySymbol(symbol);
        expect(Array.isArray(holdings)).toBe(true);
        if (holdings.length > 0) {
          expect(holdings[0]).toHaveProperty("politicianName");
          expect(holdings[0]).toHaveProperty("symbol", symbol);
          expect(holdings[0]).toHaveProperty("company");
          expect(holdings[0]).toHaveProperty("holding");
          expect(holdings[0]).toHaveProperty("allocation");
        }
      });
    });

    describe("getAllTopHoldings", () => {
      it("should fetch all top holdings", async () => {
        const topHoldings = await politicianClient.getAllTopHoldings();
        expect(Array.isArray(topHoldings)).toBe(true);
        if (topHoldings.length > 0) {
          expect(topHoldings[0]).toHaveProperty("symbol");
          expect(topHoldings[0]).toHaveProperty("company");
          expect(topHoldings[0]).toHaveProperty("politicians");
          expect(topHoldings[0]).toHaveProperty("count");
          if (topHoldings[0].politicians.length > 0) {
            expect(topHoldings[0].politicians[0]).toHaveProperty("name");
            expect(topHoldings[0].politicians[0]).toHaveProperty("holding");
            expect(topHoldings[0].politicians[0]).toHaveProperty("allocation");
          }
        }
      });
    });

    describe("getPoliticianById", () => {
      it("should fetch politician portfolio by ID", async () => {
        const portfolio = await politicianClient.getPoliticianById(1);
        expect(portfolio).toHaveProperty("id");
        expect(portfolio).toHaveProperty("name");
        expect(portfolio).toHaveProperty("holdings");
        expect(portfolio).toHaveProperty("totalHoldings");
        expect(portfolio).toHaveProperty("lastUpdated");
        if (portfolio.holdings.length > 0) {
          expect(portfolio.holdings[0]).toHaveProperty("symbol");
          expect(portfolio.holdings[0]).toHaveProperty("company");
          expect(portfolio.holdings[0]).toHaveProperty("holding");
          expect(portfolio.holdings[0]).toHaveProperty("allocation");
        }
      });
    });
  });

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getAllPolitician", () => {
      it("should return all politicians successfully", async () => {
        jest.spyOn(politicianClient, "getAllPolitician").mockResolvedValue(mockPoliticians);

        const result = await politicianClient.getAllPolitician();

        expect(result).toEqual(mockPoliticians);
        expect(result).toHaveLength(2);
        expect(result[0].politicianName).toBe("John Doe");
        expect(result[1].politicianName).toBe("Jane Smith");
      });

      it("should handle errors when fetching politicians", async () => {
        jest.spyOn(politicianClient, "getAllPolitician").mockRejectedValue(new Error("Failed to fetch politicians"));

        await expect(politicianClient.getAllPolitician()).rejects.toThrow("Failed to fetch politicians");
      });
    });

    describe("getPoliticianHoldingBySymbol", () => {
      it("should return holdings for a symbol successfully", async () => {
        jest.spyOn(politicianClient, "getPoliticianHoldingBySymbol").mockResolvedValue(mockHoldings);

        const result = await politicianClient.getPoliticianHoldingBySymbol("AAPL");

        expect(result).toEqual(mockHoldings);
        expect(result).toHaveLength(2);
        expect(result[0].symbol).toBe("AAPL");
        expect(result[1].symbol).toBe("GOOGL");
      });

      it("should handle errors when fetching holdings", async () => {
        jest.spyOn(politicianClient, "getPoliticianHoldingBySymbol").mockRejectedValue(new Error("Failed to fetch holdings"));

        await expect(politicianClient.getPoliticianHoldingBySymbol("INVALID")).rejects.toThrow("Failed to fetch holdings");
      });

      it("should handle empty holdings", async () => {
        jest.spyOn(politicianClient, "getPoliticianHoldingBySymbol").mockResolvedValue([]);

        const result = await politicianClient.getPoliticianHoldingBySymbol("NONEXISTENT");

        expect(result).toEqual([]);
        expect(result).toHaveLength(0);
      });
    });

    describe("getAllTopHoldings", () => {
      it("should return top holdings successfully", async () => {
        jest.spyOn(politicianClient, "getAllTopHoldings").mockResolvedValue(mockTopHoldings);

        const result = await politicianClient.getAllTopHoldings();

        expect(result).toEqual(mockTopHoldings);
        expect(result).toHaveLength(1);
        expect(result[0].symbol).toBe("AAPL");
        expect(result[0].politicians).toHaveLength(2);
        expect(result[0].count).toBe(2);
      });

      it("should handle errors when fetching top holdings", async () => {
        jest.spyOn(politicianClient, "getAllTopHoldings").mockRejectedValue(new Error("Failed to fetch top holdings"));

        await expect(politicianClient.getAllTopHoldings()).rejects.toThrow("Failed to fetch top holdings");
      });
    });

    describe("getPoliticianById", () => {
      it("should return politician portfolio by ID successfully", async () => {
        jest.spyOn(politicianClient, "getPoliticianById").mockResolvedValue(mockPoliticianPortfolio);

        const result = await politicianClient.getPoliticianById(1);

        expect(result).toEqual(mockPoliticianPortfolio);
        expect(result.id).toBe(1);
        expect(result.name).toBe("John Doe");
        expect(result.holdings).toHaveLength(2);
        expect(result.totalHoldings).toBe(1000000);
      });

      it("should handle errors when fetching politician by ID", async () => {
        jest.spyOn(politicianClient, "getPoliticianById").mockRejectedValue(new Error("Failed to fetch politician"));

        await expect(politicianClient.getPoliticianById(999)).rejects.toThrow("Failed to fetch politician");
      });
    });
  });
});
