import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import { PoliticianClient } from "../client/politician";

const mockPoliticians = [
  {
    id: 1,
    politicianName: "John Doe",
    totalHoldings: 10000,
    lastUpdated: new Date("2024-01-01")
  },
  {
    id: 2,
    politicianName: "Jane Smith",
    totalHoldings: 20000,
    lastUpdated: new Date("2024-01-02")
  }
];

const mockHoldings = [
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

const mockTopHoldings = [
  {
    symbol: "AAPL",
    company: "Apple Inc.",
    politicians: [
      { name: "John Doe", holding: "$500,000", allocation: "50%" },
      { name: "Jane Smith", holding: "$1,000,000", allocation: "40%" }
    ],
    count: 2
  }
];

const mockPoliticianDetail = {
  id: 1,
  name: "John Doe",
  holdings: [
    { symbol: "AAPL", company: "Apple Inc.", holding: "$500,000", allocation: "50%" },
    { symbol: "GOOGL", company: "Alphabet Inc.", holding: "$500,000", allocation: "50%" }
  ],
  totalHoldings: 1000000,
  lastUpdated: new Date("2024-01-01")
};

describe("Politician Client", () => {
  let client: PoliticianClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new PoliticianClient(config, logger);
  });

  describe("Integration Tests", () => {
    describe("getAllPolitician", () => {
      test("should return all politicians", async () => {
        const resp = await client.getAllPolitician();

        expect(Array.isArray(resp)).toBe(true);

        if (resp.length > 0) {
          const first = resp[0];
          expect(typeof first.id).toBe("number");
          expect(typeof first.politicianName).toBe("string");
          expect(typeof first.totalHoldings).toBe("number");
          expect(first.lastUpdated).toBeDefined();
        }
      });
    });

    describe("getPoliticianHoldingBySymbol", () => {
      test("should return holdings for a specific symbol", async () => {
        const resp = await client.getPoliticianHoldingBySymbol("AAPL");

        expect(Array.isArray(resp)).toBe(true);

        if (resp.length > 0) {
          const first = resp[0];
          expect(typeof first.politicianName).toBe("string");
          expect(typeof first.symbol).toBe("string");
          expect(typeof first.company).toBe("string");
          expect(typeof first.holding).toBe("string");
          expect(typeof first.allocation).toBe("string");
        }
      });
    });

    describe("getAllTopHoldings", () => {
      test("should return all top holdings", async () => {
        const resp = await client.getAllTopHoldings();

        expect(Array.isArray(resp)).toBe(true);

        if (resp.length > 0) {
          const first = resp[0];
          expect(typeof first.symbol).toBe("string");
          expect(typeof first.company).toBe("string");
          expect(typeof first.count).toBe("number");
          expect(Array.isArray(first.politicians)).toBe(true);

          if (first.politicians.length > 0) {
            const politician = first.politicians[0];
            expect(typeof politician.name).toBe("string");
            expect(typeof politician.holding).toBe("string");
            expect(typeof politician.allocation).toBe("string");
          }
        }
      });
    });

    describe("getPoliticianDetail", () => {
      test("should return politician detail by ID", async () => {
        const resp = await client.getPoliticianDetail(1);

        expect(resp).toBeDefined();
        expect(typeof resp.id).toBe("number");
        expect(typeof resp.name).toBe("string");
        expect(typeof resp.totalHoldings).toBe("number");
        expect(resp.lastUpdated).toBeDefined();
        expect(Array.isArray(resp.holdings)).toBe(true);

        if (resp.holdings.length > 0) {
          const first = resp.holdings[0];
          expect(typeof first.symbol).toBe("string");
          expect(typeof first.company).toBe("string");
          expect(typeof first.holding).toBe("string");
          expect(typeof first.allocation).toBe("string");
        }
      });
    });
  });

  describe("Mock Tests (Data Injection)", () => {
    let client: PoliticianClient;
    let cli: { request: jest.Mock };

    beforeEach(() => {
      cli = { request: jest.fn() };

      const config = (global as any).testSuite.config as LaplaceConfiguration;
      const logger: Logger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      } as unknown as Logger;

      client = new PoliticianClient(config, logger, cli as any);
    });

    test("getAllPolitician: calls correct endpoint and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockPoliticians });

      const resp = await client.getAllPolitician();

      expect(cli.request).toHaveBeenCalledTimes(1);
      const call = cli.request.mock.calls[0][0];

      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/politician");
      expect(call.params).toBeUndefined();

      expect(resp).toEqual(mockPoliticians);
    });

    test("getPoliticianHoldingBySymbol: calls correct endpoint and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockHoldings });

      const resp = await client.getPoliticianHoldingBySymbol("AAPL");

      expect(cli.request).toHaveBeenCalledTimes(1);
      const call = cli.request.mock.calls[0][0];

      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/holding/AAPL");
      expect(call.params).toBeUndefined();

      expect(resp).toEqual(mockHoldings);
    });

    test("getAllTopHoldings: calls correct endpoint and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockTopHoldings });

      const resp = await client.getAllTopHoldings();

      expect(cli.request).toHaveBeenCalledTimes(1);
      const call = cli.request.mock.calls[0][0];

      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/top-holding");
      expect(call.params).toBeUndefined();

      expect(resp).toEqual(mockTopHoldings);
    });

    test("getPoliticianDetail: calls correct endpoint and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockPoliticianDetail });

      const resp = await client.getPoliticianDetail(1);

      expect(cli.request).toHaveBeenCalledTimes(1);
      const call = cli.request.mock.calls[0][0];

      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/politician/1");
      expect(call.params).toBeUndefined();

      expect(resp).toEqual(mockPoliticianDetail);
    });

    test("bubbles up request error", async () => {
      cli.request.mockRejectedValueOnce(new Error("API Error"));

      await expect(client.getAllPolitician()).rejects.toThrow("API Error");
      expect(cli.request).toHaveBeenCalledTimes(1);
    });
  });
});
