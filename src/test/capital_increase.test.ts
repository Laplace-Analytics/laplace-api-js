import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  CapitalIncrease,
  CapitalIncreaseClient,
  PaginatedResponse,
} from "../client/capital_increase";
import "./client_test_suite";
import { Region } from "../client/collections";

const mockCapitalIncrease = {
  id: 12345,
  boardDecisionDate: "2024-03-01",
  registeredCapitalCeiling: "1000000000",
  currentCapital: "500000000",
  targetCapital: "750000000",
  types: ["RIGHTS", "BONUS"],
  spkApplicationResult: "APPROVED",
  spkApplicationDate: "2024-03-05",
  spkApprovalDate: "2024-03-15",
  paymentDate: "2024-04-01",
  registrationDate: "2024-03-20",
  specifiedCurrency: "TRY",
  symbol: "TUPRS",
  relatedDisclosureIds: [1001, 1002],
  rightsRate: "0.5",
  rightsPrice: "100",
  rightsTotalAmount: "250000000",
  rightsStartDate: "2024-04-01",
  rightsEndDate: "2024-04-15",
  rightsLastSellDate: "2024-04-14",
  bonusRate: "0.2",
  bonusTotalAmount: "100000000",
  bonusStartDate: "2024-04-01",
  bonusDividendRate: "0.1",
  bonusDividendTotalAmount: "50000000",
  externalCapitalIncreaseAmount: "150000000",
  externalCapitalIncreaseRate: "0.3"
};

const mockPaginatedResponse: PaginatedResponse<CapitalIncrease> = {
  recordCount: 2,
  items: [mockCapitalIncrease]
};

const mockActiveRights: CapitalIncrease[] = [mockCapitalIncrease];

describe("Capital Increase", () => {
  let client: CapitalIncreaseClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new CapitalIncreaseClient(config, logger);
  });

  describe("Integration Tests", () => {
    test("GetAllCapitalIncreases", async () => {
      const resp = await client.getAllCapitalIncreases(1, 10, Region.Tr);

      expect(resp).toBeDefined();
      expect(typeof resp.recordCount).toBe("number");
      expect(Array.isArray(resp.items)).toBe(true);

      if (resp.items.length > 0) {
        const firstItem = resp.items[0];
        validateCapitalIncrease(firstItem);
      }
    });

    test("GetCapitalIncreasesForInstrument", async () => {
      const resp = await client.getCapitalIncreasesForInstrument(
        "TUPRS",
        1,
        10,
        Region.Tr
      );

      expect(resp).toBeDefined();
      expect(typeof resp.recordCount).toBe("number");
      expect(Array.isArray(resp.items)).toBe(true);

      if (resp.items.length > 0) {
        const firstItem = resp.items[0];
        validateCapitalIncrease(firstItem);
        expect(firstItem.symbol).toBe("TUPRS");
      }
    });

    test("GetActiveRightsForInstrument", async () => {
      const resp = await client.getActiveRightsForInstrument(
        "TUPRS",
        "2024-01-01",
      );

      expect(Array.isArray(resp)).toBe(true);

      if (resp.length > 0) {
        const firstItem = resp[0];
        validateCapitalIncrease(firstItem);
        expect(firstItem.symbol).toBe("TUPRS");
      }
    });
  });

  describe("Mock Tests", () => {
    const region = Region.Tr;
    const page = 1;
    const size = 10;
    const symbol = "TUPRS";
    const date = "2024-03-14";
  
    let client: CapitalIncreaseClient;
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
  
      client = new CapitalIncreaseClient(config, logger, cli as any);
    });
  
    describe("getAllCapitalIncreases", () => {
      test("should call correct endpoint/params and map all fields", async () => {
        cli.request.mockResolvedValueOnce({ data: mockPaginatedResponse });
  
        const resp = await client.getAllCapitalIncreases(page, size, region);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/capital-increase/all");
        expect(call.params).toEqual({ page, size, region });
  
        expect(resp.recordCount).toBe(2);
        expect(resp.items).toHaveLength(1);
  
        expectCapitalIncreaseEqual(resp.items[0], mockCapitalIncrease);
      });
  
      test("should handle empty response", async () => {
        cli.request.mockResolvedValueOnce({ data: { recordCount: 0, items: [] } });
  
        const resp = await client.getAllCapitalIncreases(page, size, region);
  
        expect(resp.recordCount).toBe(0);
        expect(resp.items).toEqual([]);
      });
    });
  
    describe("getCapitalIncreasesForInstrument", () => {
      test("should call correct endpoint/params and map all fields", async () => {
        cli.request.mockResolvedValueOnce({ data: { recordCount: 1, items: [mockCapitalIncrease] } });
  
        const resp = await client.getCapitalIncreasesForInstrument(symbol, page, size, region);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe(`/api/v1/capital-increase/${symbol}`);
        expect(call.params).toEqual({ page, size, region });
  
        expect(resp.recordCount).toBe(1);
        expect(resp.items).toHaveLength(1);
        expectCapitalIncreaseEqual(resp.items[0], mockCapitalIncrease);
        expect(resp.items[0].symbol).toBe(symbol);
      });
  
      test("should bubble up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid symbol"));
  
        await expect(
          client.getCapitalIncreasesForInstrument("INVALID", page, size, region)
        ).rejects.toThrow("Invalid symbol");
      });
    });
  
    describe("getActiveRightsForInstrument", () => {
      test("should call correct endpoint/params and map all fields", async () => {
        cli.request.mockResolvedValueOnce({ data: mockActiveRights });
  
        const resp = await client.getActiveRightsForInstrument(symbol, date);

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe(`/api/v1/rights/active/${symbol}`);
        expect(call.params).toEqual({ date });
  
        expect(Array.isArray(resp)).toBe(true);
        expect(resp).toHaveLength(1);
        expectCapitalIncreaseEqual(resp[0], mockCapitalIncrease);
        expect(resp[0].symbol).toBe(symbol);
      });
  
      test("should handle empty array", async () => {
        cli.request.mockResolvedValueOnce({ data: [] });
  
        const resp = await client.getActiveRightsForInstrument("INVALID", date);
  
        expect(resp).toEqual([]);
      });
  
      test("should bubble up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid date format"));
  
        await expect(
          client.getActiveRightsForInstrument(symbol, "invalid-date")
        ).rejects.toThrow("Invalid date format");
      });
    });
  });
  
});

function validateCapitalIncrease(item: CapitalIncrease) {
  expect(typeof item.id).toBe("number");
  expect(typeof item.boardDecisionDate).toBe("string");
  expect(typeof item.registeredCapitalCeiling).toBe("string");
  expect(typeof item.currentCapital).toBe("string");
  expect(typeof item.targetCapital).toBe("string");
  expect(Array.isArray(item.types)).toBe(true);
  
  if (item.spkApplicationResult !== null) {
    expect(typeof item.spkApplicationResult).toBe("string");
  }
  
  if (item.spkApplicationDate !== null) {
    expect(typeof item.spkApplicationDate).toBe("string");
  }
  
  if (item.spkApprovalDate !== null) {
    expect(typeof item.spkApprovalDate).toBe("string");
  }
  
  if (item.paymentDate !== null) {
    expect(typeof item.paymentDate).toBe("string");
  }
  
  if (item.registrationDate !== null) {
    expect(typeof item.registrationDate).toBe("string");
  }
  
  expect(typeof item.specifiedCurrency).toBe("string");
  expect(typeof item.symbol).toBe("string");
  expect(Array.isArray(item.relatedDisclosureIds)).toBe(true);
  expect(typeof item.rightsRate).toBe("string");
  expect(typeof item.rightsPrice).toBe("string");
  expect(typeof item.rightsTotalAmount).toBe("string");
  
  if (item.rightsStartDate !== null) {
    expect(typeof item.rightsStartDate).toBe("string");
  }
  
  if (item.rightsEndDate !== null) {
    expect(typeof item.rightsEndDate).toBe("string");
  }
  
  if (item.rightsLastSellDate !== null) {
    expect(typeof item.rightsLastSellDate).toBe("string");
  }
  
  expect(typeof item.bonusRate).toBe("string");
  expect(typeof item.bonusTotalAmount).toBe("string");
  
  if (item.bonusStartDate !== null) {
    expect(typeof item.bonusStartDate).toBe("string");
  }
  
  expect(typeof item.bonusDividendRate).toBe("string");
  expect(typeof item.bonusDividendTotalAmount).toBe("string");
  expect(typeof item.externalCapitalIncreaseAmount).toBe("string");
  expect(typeof item.externalCapitalIncreaseRate).toBe("string");
  
  item.types.forEach(type => {
    expect(typeof type).toBe("string");
  });
  
  item.relatedDisclosureIds.forEach(id => {
    expect(typeof id).toBe("number");
  });
}

function expectCapitalIncreaseEqual(actual: CapitalIncrease, expected: CapitalIncrease) {
  expect(actual.id).toBe(expected.id);
  expect(actual.boardDecisionDate).toBe(expected.boardDecisionDate);
  expect(actual.registeredCapitalCeiling).toBe(expected.registeredCapitalCeiling);
  expect(actual.currentCapital).toBe(expected.currentCapital);
  expect(actual.targetCapital).toBe(expected.targetCapital);
  expect(actual.types).toEqual(expected.types);

  expect(actual.spkApplicationResult).toBe(expected.spkApplicationResult);
  expect(actual.spkApplicationDate).toBe(expected.spkApplicationDate);
  expect(actual.spkApprovalDate).toBe(expected.spkApprovalDate);
  expect(actual.paymentDate).toBe(expected.paymentDate);
  expect(actual.registrationDate).toBe(expected.registrationDate);

  expect(actual.specifiedCurrency).toBe(expected.specifiedCurrency);
  expect(actual.symbol).toBe(expected.symbol);
  expect(actual.relatedDisclosureIds).toEqual(expected.relatedDisclosureIds);

  expect(actual.rightsRate).toBe(expected.rightsRate);
  expect(actual.rightsPrice).toBe(expected.rightsPrice);
  expect(actual.rightsTotalAmount).toBe(expected.rightsTotalAmount);
  expect(actual.rightsStartDate).toBe(expected.rightsStartDate);
  expect(actual.rightsEndDate).toBe(expected.rightsEndDate);
  expect(actual.rightsLastSellDate).toBe(expected.rightsLastSellDate);

  expect(actual.bonusRate).toBe(expected.bonusRate);
  expect(actual.bonusTotalAmount).toBe(expected.bonusTotalAmount);
  expect(actual.bonusStartDate).toBe(expected.bonusStartDate);
  expect(actual.bonusDividendRate).toBe(expected.bonusDividendRate);
  expect(actual.bonusDividendTotalAmount).toBe(expected.bonusDividendTotalAmount);

  expect(actual.externalCapitalIncreaseAmount).toBe(expected.externalCapitalIncreaseAmount);
  expect(actual.externalCapitalIncreaseRate).toBe(expected.externalCapitalIncreaseRate);

  expect(Object.keys(actual).sort()).toEqual(Object.keys(expected).sort());
}

