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
import { Locale, Region, SortBy } from "../client/collections";

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