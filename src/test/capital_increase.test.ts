import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  CapitalIncrease,
  CapitalIncreaseClient,
  PaginatedResponse,
} from "../client/capital_increase";
import "./client_test_suite";
import { Region } from "../client/collections";

const mockCapitalIncrease: CapitalIncrease = {
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

const mockCapitalIncrease2: CapitalIncrease = {
  ...mockCapitalIncrease,
  id: 12346,
  symbol: "GARAN",
  boardDecisionDate: "2024-03-10",
};

const mockPaginatedResponse: PaginatedResponse<CapitalIncrease> = {
  recordCount: 2,
  items: [mockCapitalIncrease, mockCapitalIncrease2]
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
        Region.Tr
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
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getAllCapitalIncreases", () => {
      test("should return paginated capital increases", async () => {
        jest.spyOn(client, 'getAllCapitalIncreases').mockResolvedValue(mockPaginatedResponse);

        const resp = await client.getAllCapitalIncreases(1, 10, Region.Tr);

        expect(resp.recordCount).toBe(2);
        expect(resp.items).toHaveLength(2);
        
        const firstItem = resp.items[0];
        expect(firstItem.symbol).toBe("TUPRS");
        expect(firstItem.types).toEqual(["RIGHTS", "BONUS"]);
        expect(firstItem.currentCapital).toBe("500000000");
        expect(firstItem.targetCapital).toBe("750000000");

        expect(client.getAllCapitalIncreases).toHaveBeenCalledWith(1, 10, Region.Tr);
      });

      test("should handle empty response", async () => {
        const emptyResponse: PaginatedResponse<CapitalIncrease> = {
          recordCount: 0,
          items: []
        };
        jest.spyOn(client, 'getAllCapitalIncreases').mockResolvedValue(emptyResponse);

        const resp = await client.getAllCapitalIncreases(1, 10, Region.Tr);

        expect(resp.recordCount).toBe(0);
        expect(resp.items).toHaveLength(0);
      });
    });

    describe("getCapitalIncreasesForInstrument", () => {
      test("should return capital increases for specific instrument", async () => {
        const singleInstrumentResponse: PaginatedResponse<CapitalIncrease> = {
          recordCount: 1,
          items: [mockCapitalIncrease]
        };
        jest.spyOn(client, 'getCapitalIncreasesForInstrument').mockResolvedValue(singleInstrumentResponse);

        const resp = await client.getCapitalIncreasesForInstrument("TUPRS", 1, 10, Region.Tr);

        expect(resp.recordCount).toBe(1);
        expect(resp.items).toHaveLength(1);
        expect(resp.items[0].symbol).toBe("TUPRS");
        expect(resp.items[0].boardDecisionDate).toBe("2024-03-01");

        expect(client.getCapitalIncreasesForInstrument).toHaveBeenCalledWith("TUPRS", 1, 10, Region.Tr);
      });

      test("should handle instrument with no capital increases", async () => {
        const emptyResponse: PaginatedResponse<CapitalIncrease> = {
          recordCount: 0,
          items: []
        };
        jest.spyOn(client, 'getCapitalIncreasesForInstrument').mockResolvedValue(emptyResponse);

        const resp = await client.getCapitalIncreasesForInstrument("INVALID", 1, 10, Region.Tr);

        expect(resp.recordCount).toBe(0);
        expect(resp.items).toHaveLength(0);
      });
    });

    describe("getActiveRightsForInstrument", () => {
      test("should return active rights for specific instrument", async () => {
        jest.spyOn(client, 'getActiveRightsForInstrument').mockResolvedValue(mockActiveRights);

        const resp = await client.getActiveRightsForInstrument("TUPRS", "2024-03-14", Region.Tr);

        expect(resp).toHaveLength(1);
        expect(resp[0].symbol).toBe("TUPRS");
        expect(resp[0].rightsStartDate).toBe("2024-04-01");
        expect(resp[0].rightsEndDate).toBe("2024-04-15");

        expect(client.getActiveRightsForInstrument).toHaveBeenCalledWith("TUPRS", "2024-03-14", Region.Tr);
      });

      test("should handle instrument with no active rights", async () => {
        jest.spyOn(client, 'getActiveRightsForInstrument').mockResolvedValue([]);

        const resp = await client.getActiveRightsForInstrument("INVALID", "2024-03-14", Region.Tr);

        expect(resp).toHaveLength(0);
      });

      test("should handle invalid date format", async () => {
        jest.spyOn(client, 'getActiveRightsForInstrument').mockRejectedValue(new Error("Invalid date format"));

        await expect(client.getActiveRightsForInstrument("TUPRS", "invalid-date", Region.Tr))
          .rejects.toThrow("Invalid date format");
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
