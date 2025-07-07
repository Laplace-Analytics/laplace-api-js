import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import { SearchClient, SearchType } from "../client/search";
import "./client_test_suite";
import { Region, Locale } from "../client/collections";

describe("Search", () => {
  let client: SearchClient;

  beforeAll(() => {
    // Assuming global.testSuite is set up as in the previous example
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new SearchClient(config, logger);
  });

  test("SearchStock", async () => {
    const resp = await client.search(
      "TUPRS",
      [SearchType.Stock],
      Region.Tr,
      Locale.Tr
    );
    expect(resp.stocks).not.toBeEmpty();

    const firstResult = resp.stocks[0];
    expect(typeof firstResult.id).toBe("string");
    expect(typeof firstResult.name).toBe("string");
    expect(typeof firstResult.title).toBe("string");
    expect(typeof firstResult.region).toBe("string");
    expect(typeof firstResult.assetType).toBe("string");
    expect(typeof firstResult.type).toBe("string");
  });

  test("SearchIndustry", async () => {
    const resp = await client.search(
      "Hava",
      [SearchType.Industry],
      Region.Tr,
      Locale.Tr
    );
    expect(resp.industries).not.toBeEmpty();

    const firstResult = resp.industries[0];
    expect(typeof firstResult.id).toBe("string");
    expect(typeof firstResult.title).toBe("string");
    expect(Array.isArray(firstResult.region)).toBe(true);
    expect(firstResult.region.length).toBeGreaterThan(0);
    firstResult.region.forEach((region) => {
      expect(typeof region).toBe("string");
    });

    expect(typeof firstResult.assetClass).toBe("string");
    expect(typeof firstResult.imageUrl).toBe("string");
    expect(typeof firstResult.avatarUrl).toBe("string");
  });
  test("SearchAllTypes", async () => {
    const resp = await client.search(
      "Ab",
      [
        SearchType.Stock,
        SearchType.Industry,
        SearchType.Sector,
        SearchType.Collection,
      ],
      Region.Us,
      Locale.Tr
    );

    expect(typeof resp).toBe("object");
    expect(resp).not.toBeNull();

    const hasResults =
      (resp.stocks && resp.stocks.length > 0) ||
      (resp.industries && resp.industries.length > 0) ||
      (resp.sectors && resp.sectors.length > 0) ||
      (resp.collections && resp.collections.length > 0);

    expect(hasResults).toBe(true);

    if (resp.stocks) expect(Array.isArray(resp.stocks)).toBe(true);
    if (resp.industries) expect(Array.isArray(resp.industries)).toBe(true);
    if (resp.sectors) expect(Array.isArray(resp.sectors)).toBe(true);
    if (resp.collections) expect(Array.isArray(resp.collections)).toBe(true);
  });
});
