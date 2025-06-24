import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  CapitalIncrease,
  CapitalIncreaseClient,
} from "../client/capital_increase";
import "./client_test_suite";
import { Region } from "../client/collections";

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
