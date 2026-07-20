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
      const resp = await client.getAllHalkaArz(1, 10, Region.Tr);

      expect(resp).toBeDefined();
      expect(typeof resp.recordCount).toBe("number");
      expect(Array.isArray(resp.items)).toBe(true);

      if (resp.items.length > 0) {
        validateHalkaArz(resp.items[0]);
      }
    });

    test("getHalkaArzById", async () => {
      const all = await client.getAllHalkaArz(1, 10, Region.Tr);

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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    test("getAllHalkaArz should return paginated offerings", async () => {
      jest.spyOn(client, "getAllHalkaArz").mockResolvedValue(mockPaginatedResponse);

      const resp = await client.getAllHalkaArz(1, 10, Region.Tr);

      expect(resp.recordCount).toBe(1);
      expect(resp.items).toHaveLength(1);
      expect(resp.items[0].companyName).toBe("Test Company A.Ş.");
      expect(resp.items[0].isFixedPrice).toBe(true);
      expect(client.getAllHalkaArz).toHaveBeenCalledWith(1, 10, Region.Tr);
    });

    test("getHalkaArzById should return a single offering", async () => {
      jest.spyOn(client, "getHalkaArzById").mockResolvedValue(mockHalkaArz);

      const resp = await client.getHalkaArzById(1);

      expect(resp.id).toBe(1);
      expect(resp.symbol).toBe("TEST");
      expect(client.getHalkaArzById).toHaveBeenCalledWith(1);
    });
  });
});

function validateHalkaArz(item: HalkaArz) {
  expect(typeof item.id).toBe("number");
  expect(typeof item.companyName).toBe("string");
  expect(typeof item.currency).toBe("string");
  expect(typeof item.status).toBe("string");
  expect(typeof item.reviewed).toBe("boolean");
  expect(typeof item.isFixedPrice).toBe("boolean");
  expect(Array.isArray(item.relatedDisclosureIds)).toBe(true);
}
