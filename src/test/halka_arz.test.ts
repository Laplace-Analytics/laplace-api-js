import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import { HalkaArz, HalkaArzClient } from "../client/halka_arz";
import { PaginatedResponse } from "../client/capital_increase";
import "./client_test_suite";
import { Region } from "../client/collections";

const mockHalkaArz: HalkaArz = {
  id: 1,
  companyName: "Test Company A.Ş.",
  symbol: "TEST",
  instrumentId: null,
  priceMin: 10.5,
  priceMax: 10.5,
  demandStartDate: "2024-03-01T00:00:00Z",
  demandEndDate: "2024-03-03T00:00:00Z",
  firstTradingDate: "2024-03-10T00:00:00Z",
  sharesOffered: 1000000,
  offeringSize: 10500000,
  offeringType: "capital_increase",
  consortiumLeader: "Test Yatırım",
  saleMethod: "talep_toplama",
  additionalShares: null,
  distributionMethod: null,
  freeFloatRate: null,
  intendedMarket: null,
  sector: null,
  maxLotPerInvestor: null,
  currency: "TRY",
  relatedDisclosureIds: [1001, 1002],
  reviewed: false,
  createdAt: "2024-02-20T00:00:00Z",
  updatedAt: "2024-02-20T00:00:00Z",
  status: "allocated",
  isFixedPrice: true,
};

const mockPaginatedResponse: PaginatedResponse<HalkaArz> = {
  recordCount: 1,
  items: [mockHalkaArz],
};

describe("Halka Arz (IPO)", () => {
  let client: HalkaArzClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new HalkaArzClient(config, logger);
  });

  describe("Integration Tests", () => {
    test("getAllHalkaArz", async () => {
      const resp = await client.getAllHalkaArz(10, Region.Tr, 1);

      expect(resp).toBeDefined();
      expect(typeof resp.recordCount).toBe("number");
      expect(Array.isArray(resp.items)).toBe(true);

      if (resp.items.length > 0) {
        validateHalkaArz(resp.items[0]);
      }
    });

    test("getHalkaArzById", async () => {
      const all = await client.getAllHalkaArz(10, Region.Tr, 1);

      if (all.items.length > 0) {
        const id = all.items[0].id;
        const resp = await client.getHalkaArzById(id);

        expect(resp).toBeDefined();
        expect(resp.id).toBe(id);
        validateHalkaArz(resp);
      }
    });
  });

  describe("Mock Tests", () => {
    const region = Region.Tr;
    const page = 1;
    const size = 10;

    let client: HalkaArzClient;
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

      client = new HalkaArzClient(config, logger, cli as any);
    });

    describe("getAllHalkaArz", () => {
      test("should call correct endpoint/params and map all fields", async () => {
        cli.request.mockResolvedValueOnce({ data: mockPaginatedResponse });

        const resp = await client.getAllHalkaArz(size, region, page);

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/ipo/all");
        expect(call.params).toEqual({ page, size, region });

        expect(resp.recordCount).toBe(1);
        expect(resp.items).toHaveLength(1);
        expectHalkaArzEqual(resp.items[0], mockHalkaArz);
      });

      test("should omit page when not provided", async () => {
        cli.request.mockResolvedValueOnce({ data: mockPaginatedResponse });

        await client.getAllHalkaArz(size, region);

        const call = cli.request.mock.calls[0][0];
        expect(call.params).toEqual({ size, region });
      });

      test("should handle empty response", async () => {
        cli.request.mockResolvedValueOnce({ data: { recordCount: 0, items: [] } });

        const resp = await client.getAllHalkaArz(size, region, page);

        expect(resp.recordCount).toBe(0);
        expect(resp.items).toEqual([]);
      });
    });

    describe("getHalkaArzById", () => {
      test("should call correct endpoint and map all fields", async () => {
        cli.request.mockResolvedValueOnce({ data: mockHalkaArz });

        const resp = await client.getHalkaArzById(1);

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/ipo/1");

        expectHalkaArzEqual(resp, mockHalkaArz);
      });

      test("should bubble up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("ipo not found"));

        await expect(client.getHalkaArzById(999)).rejects.toThrow(
          "ipo not found"
        );
      });
    });
  });
});

function validateHalkaArz(item: HalkaArz) {
  expect(typeof item.id).toBe("number");
  expect(typeof item.companyName).toBe("string");
  expect(typeof item.currency).toBe("string");
  expect(typeof item.saleMethod).toBe("string");
  expect(typeof item.status).toBe("string");
  expect(typeof item.reviewed).toBe("boolean");
  expect(typeof item.isFixedPrice).toBe("boolean");
  expect(Array.isArray(item.relatedDisclosureIds)).toBe(true);
}

function expectHalkaArzEqual(actual: HalkaArz, expected: HalkaArz) {
  expect(actual.id).toBe(expected.id);
  expect(actual.companyName).toBe(expected.companyName);
  expect(actual.symbol).toBe(expected.symbol);
  expect(actual.priceMin).toBe(expected.priceMin);
  expect(actual.priceMax).toBe(expected.priceMax);
  expect(actual.offeringType).toBe(expected.offeringType);
  expect(actual.currency).toBe(expected.currency);
  expect(actual.saleMethod).toBe(expected.saleMethod);
  expect(actual.relatedDisclosureIds).toEqual(expected.relatedDisclosureIds);
  expect(actual.reviewed).toBe(expected.reviewed);
  expect(actual.status).toBe(expected.status);
  expect(actual.isFixedPrice).toBe(expected.isFixedPrice);
  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
}
