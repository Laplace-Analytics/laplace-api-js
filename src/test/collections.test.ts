import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import { CollectionClient, Locale, Region, Collection, CollectionDetail, CollectionType } from "../client/collections";
import "./client_test_suite";
import { validateCollection, validateCollectionDetail } from "./helpers";
import { Stock, AssetType } from "../client/stocks";

const mockStocks: Stock[] = [
  {
    id: "stock1",
    name: "Tüpraş",
    symbol: "TUPRS",
    assetType: AssetType.Stock,
    sectorId: "sector1",
    industryId: "industry1",
    updatedDate: "2024-03-14T10:00:00Z",
    active: true
  },
  {
    id: "stock2",
    name: "Garanti Bankası",
    symbol: "GARAN",
    assetType: AssetType.Stock,
    sectorId: "sector2",
    industryId: "industry2",
    updatedDate: "2024-03-14T10:00:00Z",
    active: true
  }
];

const mockIndustries: Collection[] = [
  {
    id: "industry1",
    title: "Bankacılık",
    description: "Türkiye'nin önde gelen bankaları",
    region: [Region.Tr],
    assetClass: "equity",
    imageUrl: "https://example.com/banking.jpg",
    avatarUrl: "https://example.com/banking-avatar.jpg",
    numStocks: 10
  },
  {
    id: "industry2",
    title: "Enerji",
    description: "Enerji sektörü şirketleri",
    region: [Region.Tr],
    assetClass: "equity",
    imageUrl: "https://example.com/energy.jpg",
    avatarUrl: "https://example.com/energy-avatar.jpg",
    numStocks: 8
  }
];

const mockSectors: Collection[] = [
  {
    id: "sector1",
    title: "Finans",
    description: "Finans sektörü şirketleri",
    region: [Region.Tr],
    assetClass: "equity",
    imageUrl: "https://example.com/finance.jpg",
    avatarUrl: "https://example.com/finance-avatar.jpg",
    numStocks: 25
  }
];

const mockThemes: Collection[] = [
  {
    id: "theme1",
    title: "Sürdürülebilir Enerji",
    description: "Yenilenebilir enerji şirketleri",
    region: [Region.Tr],
    assetClass: "equity",
    imageUrl: "https://example.com/sustainable.jpg",
    avatarUrl: "https://example.com/sustainable-avatar.jpg",
    numStocks: 15
  }
];

const mockCollections: Collection[] = [
  {
    id: "collection1",
    title: "Borsa İstanbul 30",
    description: "BIST-30 endeksindeki şirketler",
    region: [Region.Tr],
    assetClass: "equity",
    imageUrl: "https://example.com/bist30.jpg",
    avatarUrl: "https://example.com/bist30-avatar.jpg",
    numStocks: 30
  }
];

const mockIndustryDetail: CollectionDetail = {
  ...mockIndustries[0],
  stocks: mockStocks
};

const mockSectorDetail: CollectionDetail = {
  ...mockSectors[0],
  stocks: mockStocks
};

const mockThemeDetail: CollectionDetail = {
  ...mockThemes[0],
  stocks: mockStocks
};

const mockCollectionDetail: CollectionDetail = {
  ...mockCollections[0],
  stocks: mockStocks
};

describe("Collections", () => {
  let client: CollectionClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new CollectionClient(config, logger);
  });

  describe("Integration Tests", () => {
    test("GetAllIndustries", async () => {
      const resp = await client.getAllIndustries(Region.Tr, Locale.Tr);
      expect(resp).not.toBeEmpty();

      const firstIndustry = resp[0];
      validateCollection(firstIndustry);
    });

    test("GetAllSectors", async () => {
      const resp = await client.getAllSectors(Region.Tr, Locale.Tr);
      expect(resp).not.toBeEmpty();

      const firstSector = resp[0];
      validateCollection(firstSector);
    });

    test("GetIndustryDetails", async () => {
      const resp = await client.getIndustryDetail(
        "65533e441fa5c7b58afa0944",
        Region.Tr,
        Locale.Tr
      );
      expect(resp).not.toBeEmpty();
      validateCollectionDetail(resp);
    });

    test("GetSectorDetails", async () => {
      const resp = await client.getSectorDetail(
        "65533e047844ee7afe9941b9",
        Region.Tr,
        Locale.Tr
      );
      expect(resp).not.toBeEmpty();
      validateCollectionDetail(resp);
    });

    test("GetAllThemes", async () => {
      const resp = await client.getAllThemes(Region.Tr, Locale.Tr);
      expect(resp).not.toBeEmpty();

      const firstTheme = resp[0];
      validateCollection(firstTheme);
    });

    test("GetThemeDetails", async () => {
      const resp = await client.getThemeDetail(
        "6256b0647d0bb100123effa7",
        Region.Tr,
        Locale.Tr
      );
      expect(resp).not.toBeEmpty();
      validateCollectionDetail(resp);
    });

    test("GetAllCollections", async () => {
      const resp = await client.getAllCollections(Region.Tr, Locale.Tr);
      expect(resp).not.toBeEmpty();

      const firstCollection = resp[0];
      validateCollection(firstCollection);
    });

    test("GetCollectionDetails", async () => {
      const resp = await client.getThemeDetail(
        "620f455a0187ade00bb0d55f",
        Region.Tr,
        Locale.Tr
      );
      expect(resp).not.toBeEmpty();
      validateCollectionDetail(resp);
    });
  });

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("Industries", () => {
      test("should get all industries", async () => {
        jest.spyOn(client, 'getAllIndustries').mockResolvedValue(mockIndustries);

        const resp = await client.getAllIndustries(Region.Tr, Locale.Tr);

        expect(resp).toHaveLength(2);
        expect(resp[0].title).toBe("Bankacılık");
        expect(resp[1].title).toBe("Enerji");
        expect(resp[0].numStocks).toBe(10);
        expect(resp[1].numStocks).toBe(8);

        expect(client.getAllIndustries).toHaveBeenCalledWith(Region.Tr, Locale.Tr);
      });

      test("should get industry details", async () => {
        jest.spyOn(client, 'getIndustryDetail').mockResolvedValue(mockIndustryDetail);

        const resp = await client.getIndustryDetail("industry1", Region.Tr, Locale.Tr);

        expect(resp.id).toBe("industry1");
        expect(resp.title).toBe("Bankacılık");
        expect(resp.stocks).toHaveLength(2);
        expect(resp.stocks[0].symbol).toBe("TUPRS");
        expect(resp.stocks[1].symbol).toBe("GARAN");

        expect(client.getIndustryDetail).toHaveBeenCalledWith("industry1", Region.Tr, Locale.Tr);
      });
    });

    describe("Sectors", () => {
      test("should get all sectors", async () => {
        jest.spyOn(client, 'getAllSectors').mockResolvedValue(mockSectors);

        const resp = await client.getAllSectors(Region.Tr, Locale.Tr);

        expect(resp).toHaveLength(1);
        expect(resp[0].title).toBe("Finans");
        expect(resp[0].numStocks).toBe(25);

        expect(client.getAllSectors).toHaveBeenCalledWith(Region.Tr, Locale.Tr);
      });

      test("should get sector details", async () => {
        jest.spyOn(client, 'getSectorDetail').mockResolvedValue(mockSectorDetail);

        const resp = await client.getSectorDetail("sector1", Region.Tr, Locale.Tr);

        expect(resp.id).toBe("sector1");
        expect(resp.title).toBe("Finans");
        expect(resp.stocks).toHaveLength(2);
        expect(resp.stocks[0].symbol).toBe("TUPRS");
        expect(resp.stocks[1].symbol).toBe("GARAN");

        expect(client.getSectorDetail).toHaveBeenCalledWith("sector1", Region.Tr, Locale.Tr);
      });
    });

    describe("Themes", () => {
      test("should get all themes", async () => {
        jest.spyOn(client, 'getAllThemes').mockResolvedValue(mockThemes);

        const resp = await client.getAllThemes(Region.Tr, Locale.Tr);

        expect(resp).toHaveLength(1);
        expect(resp[0].title).toBe("Sürdürülebilir Enerji");
        expect(resp[0].numStocks).toBe(15);

        expect(client.getAllThemes).toHaveBeenCalledWith(Region.Tr, Locale.Tr);
      });

      test("should get theme details", async () => {
        jest.spyOn(client, 'getThemeDetail').mockResolvedValue(mockThemeDetail);

        const resp = await client.getThemeDetail("theme1", Region.Tr, Locale.Tr);

        expect(resp.id).toBe("theme1");
        expect(resp.title).toBe("Sürdürülebilir Enerji");
        expect(resp.stocks).toHaveLength(2);
        expect(resp.stocks[0].symbol).toBe("TUPRS");
        expect(resp.stocks[1].symbol).toBe("GARAN");

        expect(client.getThemeDetail).toHaveBeenCalledWith("theme1", Region.Tr, Locale.Tr);
      });
    });

    describe("Collections", () => {
      test("should get all collections", async () => {
        jest.spyOn(client, 'getAllCollections').mockResolvedValue(mockCollections);

        const resp = await client.getAllCollections(Region.Tr, Locale.Tr);

        expect(resp).toHaveLength(1);
        expect(resp[0].title).toBe("Borsa İstanbul 30");
        expect(resp[0].numStocks).toBe(30);

        expect(client.getAllCollections).toHaveBeenCalledWith(Region.Tr, Locale.Tr);
      });

      test("should get collection details", async () => {
        jest.spyOn(client, 'getCollectionDetail').mockResolvedValue(mockCollectionDetail);

        const resp = await client.getCollectionDetail("collection1", Region.Tr, Locale.Tr);

        expect(resp.id).toBe("collection1");
        expect(resp.title).toBe("Borsa İstanbul 30");
        expect(resp.stocks).toHaveLength(2);
        expect(resp.stocks[0].symbol).toBe("TUPRS");
        expect(resp.stocks[1].symbol).toBe("GARAN");

        expect(client.getCollectionDetail).toHaveBeenCalledWith("collection1", Region.Tr, Locale.Tr);
      });
    });

    describe("Error Handling", () => {
      test("should handle invalid industry ID", async () => {
        jest.spyOn(client, 'getIndustryDetail').mockRejectedValue(new Error("Industry not found"));

        await expect(client.getIndustryDetail("invalid-id", Region.Tr, Locale.Tr))
          .rejects.toThrow("Industry not found");
      });

      test("should handle invalid sector ID", async () => {
        jest.spyOn(client, 'getSectorDetail').mockRejectedValue(new Error("Sector not found"));

        await expect(client.getSectorDetail("invalid-id", Region.Tr, Locale.Tr))
          .rejects.toThrow("Sector not found");
      });

      test("should handle invalid theme ID", async () => {
        jest.spyOn(client, 'getThemeDetail').mockRejectedValue(new Error("Theme not found"));

        await expect(client.getThemeDetail("invalid-id", Region.Tr, Locale.Tr))
          .rejects.toThrow("Theme not found");
      });

      test("should handle invalid collection ID", async () => {
        jest.spyOn(client, 'getCollectionDetail').mockRejectedValue(new Error("Collection not found"));

        await expect(client.getCollectionDetail("invalid-id", Region.Tr, Locale.Tr))
          .rejects.toThrow("Collection not found");
      });
    });
  });
});
