import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import { SearchClient, SearchType } from "../client/search";
import "./client_test_suite";
import { Region, Locale } from "../client/collections";

const mockStockSearchResponse = {
  stocks: [
    {
      id: "61dd0d6f0ec2114146342fd0",
      name: "Tüpraş",
      title: "Türkiye Petrol Rafinerileri A.Ş.",
      region: Region.Tr,
      assetType: "stock",
      type: "equity"
    }
  ],
  industries: [],
  sectors: [],
  collections: []
};

const mockIndustrySearchResponse = {
  stocks: [],
  industries: [
    {
      id: "ind123",
      title: "Hava Yolları Taşımacılığı",
      region: [Region.Tr],
      assetClass: "equity",
      imageUrl: "https://example.com/image.jpg",
      avatarUrl: "https://example.com/avatar.jpg"
    }
  ],
  sectors: [],
  collections: []
};

const mockAllTypesSearchResponse = {
  stocks: [
    {
      id: "61dd0d6f0ec2114146342fd1",
      name: "Abbott",
      title: "Abbott Laboratories",
      region: Region.Us,
      assetType: "stock",
      type: "equity"
    }
  ],
  industries: [
    {
      id: "ind456",
      title: "Abrasive Manufacturing",
      region: [Region.Us],
      assetClass: "equity",
      imageUrl: "https://example.com/image.jpg",
      avatarUrl: "https://example.com/avatar.jpg"
    }
  ],
  sectors: [
    {
      id: "sec789",
      title: "Aerospace & Defense",
      region: [Region.Us],
      assetClass: "equity",
      imageUrl: "https://example.com/sector.jpg",
      avatarUrl: "https://example.com/sector-avatar.jpg"
    }
  ],
  collections: [
    {
      id: "col123",
      title: "Artificial Intelligence",
      region: [Region.Us],
      assetClass: "equity",
      imageUrl: "https://example.com/collection.jpg",
      avatarUrl: "https://example.com/collection-avatar.jpg"
    }
  ]
};

describe("Search", () => {
  let client: SearchClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new SearchClient(config, logger);
  });

  describe("Integration Tests", () => {
    test("SearchStock", async () => {
      const resp = await client.search("TUPRS", [SearchType.Stock], Locale.Tr, Region.Tr);
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
      const resp = await client.search("Hava", [SearchType.Industry], Locale.Tr, Region.Tr);
      expect(resp.industries).not.toBeEmpty();

      const firstResult = resp.industries[0];
      expect(typeof firstResult.id).toBe("string");
      expect(typeof firstResult.title).toBe("string");
      expect(Array.isArray(firstResult.region)).toBe(true);
      expect(firstResult.region.length).toBeGreaterThan(0);
      firstResult.region.forEach((r: string) => expect(typeof r).toBe("string"));

      expect(typeof firstResult.assetClass).toBe("string");
      expect(typeof firstResult.imageUrl).toBe("string");
      expect(typeof firstResult.avatarUrl).toBe("string");
    });

    test("SearchAllTypes", async () => {
      const resp = await client.search(
        "Ab",
        [SearchType.Stock, SearchType.Industry, SearchType.Sector, SearchType.Collection],
        Locale.Tr,
        Region.Us
      );

      const hasResults =
        (resp.stocks && resp.stocks.length > 0) ||
        (resp.industries && resp.industries.length > 0) ||
        (resp.sectors && resp.sectors.length > 0) ||
        (resp.collections && resp.collections.length > 0);

      expect(hasResults).toBe(true);
    });
  });

  describe("Mock Tests (Data Injection)", () => {
    let client: SearchClient;
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

      client = new SearchClient(config, logger, cli as any);
    });

    function expectSearchCall(expected: {
      filter: string;
      types: SearchType[];
      locale: Locale;
      region?: Region;
      page?: number;
      size?: number;
    }) {
      expect(cli.request).toHaveBeenCalledTimes(1);
      const call = cli.request.mock.calls[0][0];

      expect(call.method).toBe("GET");
      expect(call.url).toBe("/api/v1/search");

      const expectedParams: any = {
        filter: expected.filter,
        types: expected.types.join(","),
        locale: expected.locale,
      };

      if (expected.region != null) expectedParams.region = expected.region;
      if (expected.page != null) expectedParams.page = expected.page;
      if (expected.size != null) expectedParams.size = expected.size;

      expect(call.params).toEqual(expectedParams);
    }

    test("SearchStock: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockStockSearchResponse });

      const resp = await client.search("TUPRS", [SearchType.Stock], Locale.Tr, Region.Tr);

      expectSearchCall({
        filter: "TUPRS",
        types: [SearchType.Stock],
        locale: Locale.Tr,
        region: Region.Tr,
      });

      expect(resp.stocks).toHaveLength(1);
      const first = resp.stocks[0];
      expect(first.id).toBe(mockStockSearchResponse.stocks[0].id);
      expect(first.name).toBe(mockStockSearchResponse.stocks[0].name);
      expect(first.title).toBe(mockStockSearchResponse.stocks[0].title);
      expect(first.region).toBe(mockStockSearchResponse.stocks[0].region);
      expect(first.assetType).toBe(mockStockSearchResponse.stocks[0].assetType);
      expect(first.type).toBe(mockStockSearchResponse.stocks[0].type);

      expect(resp.industries).toHaveLength(0);
      expect(resp.sectors).toHaveLength(0);
      expect(resp.collections).toHaveLength(0);
    });

    test("SearchIndustry: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockIndustrySearchResponse });

      const resp = await client.search("Hava", [SearchType.Industry], Locale.Tr, Region.Tr);

      expectSearchCall({
        filter: "Hava",
        types: [SearchType.Industry],
        locale: Locale.Tr,
        region: Region.Tr,
      });

      expect(resp.industries).toHaveLength(1);
      const first = resp.industries[0];
      expect(first.id).toBe(mockIndustrySearchResponse.industries[0].id);
      expect(first.title).toBe(mockIndustrySearchResponse.industries[0].title);
      expect(first.region).toEqual(mockIndustrySearchResponse.industries[0].region);
      expect(first.assetClass).toBe(mockIndustrySearchResponse.industries[0].assetClass);
      expect(first.imageUrl).toBe(mockIndustrySearchResponse.industries[0].imageUrl);
      expect(first.avatarUrl).toBe(mockIndustrySearchResponse.industries[0].avatarUrl);

      expect(resp.stocks).toHaveLength(0);
      expect(resp.sectors).toHaveLength(0);
      expect(resp.collections).toHaveLength(0);
    });

    test("SearchAllTypes: calls correct endpoint/params and matches raw response", async () => {
      cli.request.mockResolvedValueOnce({ data: mockAllTypesSearchResponse });

      const resp = await client.search(
        "Ab",
        [SearchType.Stock, SearchType.Industry, SearchType.Sector, SearchType.Collection],
        Locale.Tr,
        Region.Us
      );

      expectSearchCall({
        filter: "Ab",
        types: [SearchType.Stock, SearchType.Industry, SearchType.Sector, SearchType.Collection],
        locale: Locale.Tr,
        region: Region.Us,
      });

      expect(resp.stocks).toHaveLength(1);
      expect(resp.industries).toHaveLength(1);
      expect(resp.sectors).toHaveLength(1);
      expect(resp.collections).toHaveLength(1);
    });

    test("does not send optional params when undefined", async () => {
      cli.request.mockResolvedValueOnce({ data: mockStockSearchResponse });

      await client.search("TUPRS", [SearchType.Stock], Locale.Tr);

      expectSearchCall({
        filter: "TUPRS",
        types: [SearchType.Stock],
        locale: Locale.Tr,
      });
    });

    test("bubbles up request error", async () => {
      cli.request.mockRejectedValueOnce(new Error("Failed to search"));

      await expect(client.search("TUPRS", [SearchType.Stock], Locale.Tr, Region.Tr)).rejects.toThrow(
        "Failed to search"
      );

      expect(cli.request).toHaveBeenCalledTimes(1);
    });

    test("page=0 / size=0 should still be sent (guards against falsy spread bug)", async () => {
      cli.request.mockResolvedValueOnce({ data: mockStockSearchResponse });

      await client.search("TUPRS", [SearchType.Stock], Locale.Tr, Region.Tr, 0, 10);

      expectSearchCall({
        filter: "TUPRS",
        types: [SearchType.Stock],
        locale: Locale.Tr,
        region: Region.Tr,
        page: 0,
        size: 10,
      });
    });
  });
});
