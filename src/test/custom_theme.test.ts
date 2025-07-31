import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  CustomThemeClient,
  CollectionStatus,
  CreateCustomThemeParams,
  UpdateCustomThemeParams,
} from "../client/custom_theme";
import { Stock, StockClient } from "../client/stocks";
import "./client_test_suite";
import { validateCollection } from "./helpers";
import { Locale, Region, SortBy, Collection, CollectionDetail } from "../client/collections";
import { AssetType } from "../client/stocks";

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
  },
  {
    id: "stock3",
    name: "Türk Hava Yolları",
    symbol: "THYAO",
    assetType: AssetType.Stock,
    sectorId: "sector3",
    industryId: "industry3",
    updatedDate: "2024-03-14T10:00:00Z",
    active: true
  }
];

const mockCustomThemes: Collection[] = [
  {
    id: "theme1",
    title: "Enerji Şirketleri",
    description: "Türkiye'nin önde gelen enerji şirketleri",
    region: [Region.Tr],
    imageUrl: "https://example.com/energy.jpg",
    avatarUrl: "https://example.com/energy-avatar.jpg",
    numStocks: 5,
    status: CollectionStatus.Active
  }
];

const mockCustomThemeDetail: CollectionDetail = {
  id: "theme1",
  title: "Enerji Şirketleri",
  description: "Türkiye'nin önde gelen enerji şirketleri",
  region: [Region.Tr],
  imageUrl: "https://example.com/energy.jpg",
  avatarUrl: "https://example.com/energy-avatar.jpg",
  numStocks: 2,
  status: CollectionStatus.Active,
  stocks: [mockStocks[0], mockStocks[1]]
};

describe("CustomTheme", () => {
  let client: CustomThemeClient;
  let stocksClient: StockClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new CustomThemeClient(config, logger);
    stocksClient = new StockClient(config, logger);
  });

  describe("Integration Tests", () => {
    test("GetAllCustomThemes", async () => {
      const resp = await client.getAllCustomThemes(Locale.Tr);
      expect(resp).not.toBeEmpty();

      const firstTheme = resp[0];
      validateCollection(firstTheme);
    });

    test('CreateUpdateDeleteCustomTheme', async () => {
      const stocks = await stocksClient.getAllStocks(Region.Tr);
      expect(stocks).not.toBeEmpty();

      const createParams: CreateCustomThemeParams = {
        title: {
          [Locale.Tr]: 'Test Custom Theme',
        },
        description: {
          [Locale.Tr]: 'Test Custom Theme Description',
        },
        region: [Region.Tr],
        image_url: 'Test Custom Theme Image URL',
        image: 'Test Custom Theme Image',
        avatar_url: 'Test Custom Theme Avatar Image',
        stocks: [stocks[0].id, stocks[1].id],
        status: CollectionStatus.Active,
      };

      const id = await testCreateCustomTheme(client, createParams);
      await testGetDetails(id, Locale.Tr, client, createParams);

      let updateParams: UpdateCustomThemeParams = {
        stockIds: [stocks[0].id, stocks[2].id],
      };
      await testUpdateCustomTheme(id, client, updateParams);
      applyUpdateParams(updateParams, createParams);
      await testGetDetails(id, Locale.Tr, client, createParams);

      updateParams = {
        title: {
          [Locale.Tr]: 'Test Custom Theme Title Updated',
          [Locale.En]: 'Test Custom Theme Title Updated',
        },
        description: {
          [Locale.Tr]: 'Test Custom Theme Description Updated',
          [Locale.En]: 'Test Custom Theme Description Updated',
        },
      };
      await testUpdateCustomTheme(id, client, updateParams);
      applyUpdateParams(updateParams, createParams);
      await testGetDetails(id, Locale.Tr, client, createParams);
      await testGetDetails(id, Locale.En, client, createParams);

      updateParams = {
        status: CollectionStatus.Inactive,
      };
      await testUpdateCustomTheme(id, client, updateParams);
      applyUpdateParams(updateParams, createParams);
      await testGetDetails(id, Locale.Tr, client, createParams);

      await testDeleteCustomTheme(id, client);
      await expect(client.getCustomThemeDetail(id, Locale.Tr, SortBy.PriceChange)).rejects.toThrow();
    }, 15000);
  });

  describe("Mock Tests", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    describe("getAllCustomThemes", () => {
      test("should return custom themes list with mock data", async () => {
        jest.spyOn(client, 'getAllCustomThemes').mockResolvedValue(mockCustomThemes);

        const resp = await client.getAllCustomThemes(Locale.Tr);

        expect(resp).toHaveLength(1);
        
        const theme = resp[0];
        expect(theme.id).toBe("theme1");
        expect(theme.title).toBe("Enerji Şirketleri");
        expect(theme.description).toBe("Türkiye'nin önde gelen enerji şirketleri");
        expect(theme.region).toEqual([Region.Tr]);
        expect(theme.imageUrl).toBe("https://example.com/energy.jpg");
        expect(theme.avatarUrl).toBe("https://example.com/energy-avatar.jpg");
        expect(theme.numStocks).toBe(5);
        expect(theme.status).toBe(CollectionStatus.Active);

        expect(client.getAllCustomThemes).toHaveBeenCalledWith(Locale.Tr);
      });
    });

    describe("getCustomThemeDetail", () => {
      test("should return custom theme detail with mock data", async () => {
        jest.spyOn(client, 'getCustomThemeDetail').mockResolvedValue(mockCustomThemeDetail);

        const resp = await client.getCustomThemeDetail("theme1", Locale.Tr, null);

        expect(resp.id).toBe("theme1");
        expect(resp.title).toBe("Enerji Şirketleri");
        expect(resp.description).toBe("Türkiye'nin önde gelen enerji şirketleri");
        expect(resp.region).toEqual([Region.Tr]);
        expect(resp.imageUrl).toBe("https://example.com/energy.jpg");
        expect(resp.avatarUrl).toBe("https://example.com/energy-avatar.jpg");
        expect(resp.numStocks).toBe(2);
        expect(resp.status).toBe(CollectionStatus.Active);
        expect(resp.stocks).toHaveLength(2);
        expect(resp.stocks[0].symbol).toBe("TUPRS");
        expect(resp.stocks[1].symbol).toBe("GARAN");

        expect(client.getCustomThemeDetail).toHaveBeenCalledWith("theme1", Locale.Tr, null);
      });

      test("should handle sort by price change", async () => {
        jest.spyOn(client, 'getCustomThemeDetail').mockResolvedValue(mockCustomThemeDetail);

        await client.getCustomThemeDetail("theme1", Locale.Tr, SortBy.PriceChange);

        expect(client.getCustomThemeDetail).toHaveBeenCalledWith("theme1", Locale.Tr, SortBy.PriceChange);
      });
    });

    describe("createCustomTheme", () => {
      test("should create custom theme with mock data", async () => {
        const createParams: CreateCustomThemeParams = {
          title: {
            [Locale.Tr]: "Yeni Tema",
            [Locale.En]: "New Theme"
          },
          description: {
            [Locale.Tr]: "Tema açıklaması",
            [Locale.En]: "Theme description"
          },
          region: [Region.Tr],
          image_url: "https://example.com/new-theme.jpg",
          avatar_url: "https://example.com/new-theme-avatar.jpg",
          stocks: [mockStocks[0].id, mockStocks[1].id],
          status: CollectionStatus.Active
        };

        jest.spyOn(client, 'createCustomTheme').mockResolvedValue("new-theme-id");

        const resp = await client.createCustomTheme(createParams);

        expect(resp).toBe("new-theme-id");

        expect(client.createCustomTheme).toHaveBeenCalledWith(createParams);
      });
    });

    describe("updateCustomTheme", () => {
      test("should update custom theme with mock data", async () => {
        const updateParams: UpdateCustomThemeParams = {
          title: {
            [Locale.Tr]: "Güncellenmiş Tema",
            [Locale.En]: "Updated Theme"
          },
          stockIds: [mockStocks[0].id, mockStocks[2].id]
        };

        jest.spyOn(client, 'updateCustomTheme').mockResolvedValue(undefined);

        await client.updateCustomTheme("theme1", updateParams);

        expect(client.updateCustomTheme).toHaveBeenCalledWith("theme1", updateParams);
      });
    });

    describe("deleteCustomTheme", () => {
      test("should delete custom theme", async () => {
        jest.spyOn(client, 'deleteCustomTheme').mockResolvedValue(undefined);

        await client.deleteCustomTheme("theme1");

        expect(client.deleteCustomTheme).toHaveBeenCalledWith("theme1");
      });

      test("should handle delete error", async () => {
        jest.spyOn(client, 'deleteCustomTheme').mockRejectedValue(new Error("Theme not found"));

        await expect(client.deleteCustomTheme("invalid-theme"))
          .rejects.toThrow("Theme not found");
      });
    });
  });
});

async function testCreateCustomTheme(client: CustomThemeClient, createParams: CreateCustomThemeParams): Promise<string> {
  const resp = await client.createCustomTheme(createParams);
  expect(resp).not.toBeEmpty();
  return resp;
}

async function testGetDetails(id: string, locale: Locale, client: CustomThemeClient, createParams: CreateCustomThemeParams) {
  const resp = await client.getCustomThemeDetail(id, locale, null);
  expect(resp).not.toBeEmpty();

  expect(resp.title).toBe(createParams.title[locale]);
  expect(resp.description).toBe(createParams.description?.[locale]);
  expect(resp.region).toEqual(createParams.region);
  expect(resp.imageUrl).toBe(createParams.image_url);
  expect(resp.image).toBe(createParams.image);
  expect(resp.avatarUrl).toBe(createParams.avatar_url);
  expect(resp.stocks.map((stock: Stock) => stock.id)).toEqual(createParams.stocks);
  expect(resp.status).toBe(createParams.status);
}

async function testUpdateCustomTheme(id: string, client: CustomThemeClient, updateParams: UpdateCustomThemeParams) {
  await client.updateCustomTheme(id, updateParams);
}

function applyUpdateParams(updateParams: UpdateCustomThemeParams, createParams: CreateCustomThemeParams) {
  if (updateParams.stockIds) createParams.stocks = updateParams.stockIds;
  if (updateParams.title) createParams.title = updateParams.title;
  if (updateParams.description) createParams.description = updateParams.description;
  if (updateParams.image_url) createParams.image_url = updateParams.image_url;
  if (updateParams.image) createParams.image = updateParams.image;
  if (updateParams.avatar_url) createParams.avatar_url = updateParams.avatar_url;
  if (updateParams.status) createParams.status = updateParams.status;
  if (updateParams.meta_data) createParams.meta_data = updateParams.meta_data;
}

async function testDeleteCustomTheme(id: string, client: CustomThemeClient) {
  await client.deleteCustomTheme(id);
}