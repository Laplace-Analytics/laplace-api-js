import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import { CollectionClient, Locale, Region } from "../client/collections";
import "./client_test_suite";
import { validateCollection, validateCollectionDetail } from "./helpers";

describe("Collections", () => {
  let client: CollectionClient;

  beforeAll(() => {
    // Assuming global.testSuite is set up as in the previous example
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new CollectionClient(config, logger);
  });

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
