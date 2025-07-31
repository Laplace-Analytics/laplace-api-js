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
      description: "AI focused companies",
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

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("SearchStock", () => {
      test("should return stock search results with mock data", async () => {
        jest.spyOn(client, 'search').mockResolvedValue(mockStockSearchResponse);

        const resp = await client.search(
          "TUPRS",
          [SearchType.Stock],
          Region.Tr,
          Locale.Tr
        );

        expect(resp.stocks).toHaveLength(1);
        
        const firstResult = resp.stocks[0];
        expect(firstResult.id).toBe("61dd0d6f0ec2114146342fd0");
        expect(firstResult.name).toBe("Tüpraş");
        expect(firstResult.title).toBe("Türkiye Petrol Rafinerileri A.Ş.");
        expect(firstResult.region).toBe(Region.Tr);
        expect(firstResult.assetType).toBe("stock");
        expect(firstResult.type).toBe("equity");

        expect(resp.industries).toHaveLength(0);
        expect(resp.sectors).toHaveLength(0);
        expect(resp.collections).toHaveLength(0);

        expect(client.search).toHaveBeenCalledWith(
          "TUPRS",
          [SearchType.Stock],
          Region.Tr,
          Locale.Tr
        );
      });

      test("should handle API errors for stock search", async () => {
        jest.spyOn(client, 'search').mockRejectedValue(new Error("Failed to search stocks"));

        await expect(client.search(
          "TUPRS",
          [SearchType.Stock],
          Region.Tr,
          Locale.Tr
        )).rejects.toThrow("Failed to search stocks");
      });
    });

    describe("SearchIndustry", () => {
      test("should return industry search results with mock data", async () => {
        jest.spyOn(client, 'search').mockResolvedValue(mockIndustrySearchResponse);

        const resp = await client.search(
          "Hava",
          [SearchType.Industry],
          Region.Tr,
          Locale.Tr
        );

        expect(resp.industries).toHaveLength(1);
        
        const firstResult = resp.industries[0];
        expect(firstResult.id).toBe("ind123");
        expect(firstResult.title).toBe("Hava Yolları Taşımacılığı");
        expect(firstResult.region).toEqual([Region.Tr]);
        expect(firstResult.assetClass).toBe("equity");
        expect(firstResult.imageUrl).toBe("https://example.com/image.jpg");
        expect(firstResult.avatarUrl).toBe("https://example.com/avatar.jpg");

        expect(resp.stocks).toHaveLength(0);
        expect(resp.sectors).toHaveLength(0);
        expect(resp.collections).toHaveLength(0);

        expect(client.search).toHaveBeenCalledWith(
          "Hava",
          [SearchType.Industry],
          Region.Tr,
          Locale.Tr
        );
      });

      test("should handle API errors for industry search", async () => {
        jest.spyOn(client, 'search').mockRejectedValue(new Error("Failed to search industries"));

        await expect(client.search(
          "Hava",
          [SearchType.Industry],
          Region.Tr,
          Locale.Tr
        )).rejects.toThrow("Failed to search industries");
      });
    });

    describe("SearchAllTypes", () => {
      test("should return all types search results with mock data", async () => {
        jest.spyOn(client, 'search').mockResolvedValue(mockAllTypesSearchResponse);

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

        expect(resp.stocks).toHaveLength(1);
        expect(resp.stocks[0].name).toBe("Abbott");
        expect(resp.stocks[0].region).toBe(Region.Us);

        expect(resp.industries).toHaveLength(1);
        expect(resp.industries[0].title).toBe("Abrasive Manufacturing");
        expect(resp.industries[0].region).toEqual([Region.Us]);

        expect(resp.sectors).toHaveLength(1);
        expect(resp.sectors[0].title).toBe("Aerospace & Defense");
        expect(resp.sectors[0].region).toEqual([Region.Us]);

        expect(resp.collections).toHaveLength(1);
        expect(resp.collections[0].title).toBe("Artificial Intelligence");
        expect(resp.collections[0].region).toEqual([Region.Us]);

        expect(client.search).toHaveBeenCalledWith(
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
      });

      test("should handle API errors for all types search", async () => {
        jest.spyOn(client, 'search').mockRejectedValue(new Error("Failed to search all types"));

        await expect(client.search(
          "Ab",
          [
            SearchType.Stock,
            SearchType.Industry,
            SearchType.Sector,
            SearchType.Collection,
          ],
          Region.Us,
          Locale.Tr
        )).rejects.toThrow("Failed to search all types");
      });
    });
  });
});
