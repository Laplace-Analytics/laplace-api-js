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
import { Locale, Region, SortBy, CollectionType } from "../client/collections";

const mockCustomThemes = [
  {
    "id": "6888e18a6c84bcba9dc69ef7",
    "title": "Test Custom Theme",
    "region": [
      "tr"
    ],
    "imageUrl": "Test Custom Theme Image URL",
    "avatarUrl": "Test Custom Theme Avatar Image",
    "numStocks": 2,
    "assetClass": "equity",
    "description": "Test Custom Theme Description",
    "image": "Test Custom Theme Image",
    "order": 0,
    "status": "active"
  }
];

const mockCustomThemeDetail = {
  "id": "6888e18a6c84bcba9dc69ef7",
  "title": "Test Custom Theme",
  "region": [
    "tr"
  ],
  "imageUrl": "Test Custom Theme Image URL",
  "avatarUrl": "Test Custom Theme Avatar Image",
  "numStocks": 2,
  "assetClass": "equity",
  "description": "Test Custom Theme Description",
  "image": "Test Custom Theme Image",
  "order": 0,
  "status": "active",
  "stocks": [
    {
      "id": "648ab66e38daf3102a5a7401",
      "assetType": "stock",
      "name": "A1 Capital Yatırım Menkul Değerler",
      "symbol": "A1CAP",
      "sectorId": "65533e047844ee7afe9941bc",
      "industryId": "65533e441fa5c7b58afa0955",
      "updatedDate": "2025-04-01T00:00:00.533Z",
      "active": true
    },
    {
      "id": "61dd0da80ec21141463430cf",
      "assetType": "stock",
      "name": "A1 Yenilenebilir Enerji",
      "symbol": "A1YEN",
      "sectorId": "65533e047844ee7afe9941c2",
      "industryId": "65533e441fa5c7b58afa0985",
      "updatedDate": "2025-07-28T09:06:04.286Z",
      "active": true
    }
  ],
  "locale": "tr"
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
    const locale = Locale.Tr;
  
    let client: CustomThemeClient;
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
  
      client = new CustomThemeClient(config, logger, cli as any);
    });
  
    describe("getAllCustomThemes", () => {
      test("should call correct endpoint/params and return list (check all fields)", async () => {
        cli.request.mockResolvedValueOnce({ data: mockCustomThemes });
  
        const resp = await client.getAllCustomThemes(locale);
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe(`/api/v1/${CollectionType.CustomTheme}`);
        expect(call.params).toEqual({ locale });
  
        expect(Array.isArray(resp)).toBe(true);
        expect(resp).toHaveLength(1);
  
        const theme = resp[0];
  
        expect(theme.id).toBe("6888e18a6c84bcba9dc69ef7");
        expect(theme.title).toBe("Test Custom Theme");
        expect(theme.region).toEqual(["tr"]);
        expect(theme.imageUrl).toBe("Test Custom Theme Image URL");
        expect(theme.avatarUrl).toBe("Test Custom Theme Avatar Image");
        expect(theme.numStocks).toBe(2);
        expect(theme.assetClass).toBe("equity"); 
        expect(theme.description).toBe("Test Custom Theme Description");
        expect(theme.image).toBe("Test Custom Theme Image");
        expect(theme.order).toBe(0);
        expect(theme.status).toBe("active"); 
      });
    });
  
    describe("getCustomThemeDetail", () => {
      test("should call correct endpoint/params and return detail (check all fields)", async () => {
        cli.request.mockResolvedValueOnce({ data: mockCustomThemeDetail });
  
        const resp = await client.getCustomThemeDetail(
          "6888e18a6c84bcba9dc69ef7",
          locale,
          null
        );
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe(
          `/api/v1/${CollectionType.CustomTheme}/6888e18a6c84bcba9dc69ef7`
        );
        expect(call.params).toEqual({ locale });
  
        expect(resp.id).toBe("6888e18a6c84bcba9dc69ef7");
        expect(resp.title).toBe("Test Custom Theme");
        expect(resp.region).toEqual(["tr"]);
        expect(resp.imageUrl).toBe("Test Custom Theme Image URL");
        expect(resp.avatarUrl).toBe("Test Custom Theme Avatar Image");
        expect(resp.numStocks).toBe(2);
        expect(resp.assetClass).toBe("equity");
        expect(resp.description).toBe("Test Custom Theme Description");
        expect(resp.image).toBe("Test Custom Theme Image");
        expect(resp.order).toBe(0);
        expect(resp.status).toBe("active");
        expect(resp.locale).toBe("tr");
  
        expect(Array.isArray(resp.stocks)).toBe(true);
        expect(resp.stocks).toHaveLength(2);
  
        const s0 = resp.stocks[0];
        expect(s0.id).toBe("648ab66e38daf3102a5a7401");
        expect(s0.assetType).toBe("stock");
        expect(s0.name).toBe("A1 Capital Yatırım Menkul Değerler");
        expect(s0.symbol).toBe("A1CAP");
        expect(s0.sectorId).toBe("65533e047844ee7afe9941bc");
        expect(s0.industryId).toBe("65533e441fa5c7b58afa0955");
        expect(s0.updatedDate).toBe("2025-04-01T00:00:00.533Z");
        expect(s0.active).toBe(true);
  
        const s1 = resp.stocks[1];
        expect(s1.id).toBe("61dd0da80ec21141463430cf");
        expect(s1.assetType).toBe("stock");
        expect(s1.name).toBe("A1 Yenilenebilir Enerji");
        expect(s1.symbol).toBe("A1YEN");
        expect(s1.sectorId).toBe("65533e047844ee7afe9941c2");
        expect(s1.industryId).toBe("65533e441fa5c7b58afa0985");
        expect(s1.updatedDate).toBe("2025-07-28T09:06:04.286Z");
        expect(s1.active).toBe(true);
      });
  
      test("should include sortBy when provided", async () => {
        cli.request.mockResolvedValueOnce({ data: mockCustomThemeDetail });
  
        await client.getCustomThemeDetail(
          "6888e18a6c84bcba9dc69ef7",
          locale,
          SortBy.PriceChange
        );
  
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
  
        expect(call.method).toBe("GET");
        expect(call.url).toBe(
          `/api/v1/${CollectionType.CustomTheme}/6888e18a6c84bcba9dc69ef7`
        );
        expect(call.params).toEqual({ locale, sortBy: SortBy.PriceChange });
      });
    });
    describe("createCustomTheme", () => {
      test("should call correct endpoint/body and return id", async () => {
        const createParams: CreateCustomThemeParams = {
          title: { [Locale.Tr]: "Test Custom Theme" },
          description: { [Locale.Tr]: "Test Custom Theme Description" },
          region: [Region.Tr],
          image_url: "Test Custom Theme Image URL",
          image: "Test Custom Theme Image",
          avatar_url: "Test Custom Theme Avatar Image",
          stocks: [
            "648ab66e38daf3102a5a7401",
            "61dd0da80ec21141463430cf",
          ],
          order: 0,
          status: CollectionStatus.Active,
          meta_data: { foo: "bar" },
        };
    
        cli.request.mockResolvedValueOnce({ data: { id: "6888e18a6c84bcba9dc69ef7" } });
    
        const id = await client.createCustomTheme(createParams);
    
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
    
        expect(call.method).toBe("POST");
        expect(call.url).toBe("/api/v1/custom-theme");
        expect(call.data).toEqual(createParams);
    
        expect(id).toBe("6888e18a6c84bcba9dc69ef7");
      });
    
      test("should bubble up request error", async () => {
        const createParams: CreateCustomThemeParams = {
          title: { [Locale.Tr]: "Test Custom Theme" },
          stocks: ["648ab66e38daf3102a5a7401"],
          status: CollectionStatus.Active,
        };
    
        cli.request.mockRejectedValueOnce(new Error("Validation error"));
    
        await expect(client.createCustomTheme(createParams)).rejects.toThrow("Validation error");
      });
    });
    
    describe("updateCustomTheme", () => {
      test("should call correct endpoint/body (stockIds) and resolve", async () => {
        const updateParams: UpdateCustomThemeParams = {
          title: { [Locale.Tr]: "Test Custom Theme Title Updated" },
          description: { [Locale.Tr]: "Test Custom Theme Description Updated" },
          image_url: "Test Custom Theme Image URL Updated",
          image: "Test Custom Theme Image Updated",
          avatar_url: "Test Custom Theme Avatar Image Updated",
          stockIds: [
            "648ab66e38daf3102a5a7401",
            "61dd0da80ec21141463430cf",
          ],
          status: CollectionStatus.Inactive,
          meta_data: { hello: "world" },
        };
    
        cli.request.mockResolvedValueOnce({ data: undefined });
    
        await client.updateCustomTheme("6888e18a6c84bcba9dc69ef7", updateParams);
    
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
    
        expect(call.method).toBe("PATCH");
        expect(call.url).toBe("/api/v1/custom-theme/6888e18a6c84bcba9dc69ef7");
        expect(call.data).toEqual(updateParams);
      });
    
      test("should bubble up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Theme not found"));
    
        await expect(
          client.updateCustomTheme("invalid-theme", { status: CollectionStatus.Active })
        ).rejects.toThrow("Theme not found");
      });
    });
    
    describe("deleteCustomTheme", () => {
      test("should call correct endpoint and resolve", async () => {
        cli.request.mockResolvedValueOnce({ data: undefined });
    
        await client.deleteCustomTheme("6888e18a6c84bcba9dc69ef7");
    
        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
    
        expect(call.method).toBe("DELETE");
        expect(call.url).toBe("/api/v1/custom-theme/6888e18a6c84bcba9dc69ef7");
      });
    
      test("should bubble up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Theme not found"));
    
        await expect(client.deleteCustomTheme("invalid-theme")).rejects.toThrow("Theme not found");
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