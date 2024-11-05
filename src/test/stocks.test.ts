import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { StockClient, AssetClass, HistoricalPricePeriod, HistoricalPriceInterval } from '../client/stocks';
import { Region, Locale } from '../client/collections';
import './client_test_suite';


describe('Stocks', () => {
  let client: StockClient;

  beforeAll(() => {
    // Assuming global.testSuite is set up as in the previous example
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new StockClient(config, logger);
  });

  test('GetAllStocks', async () => {
    const resp = await client.getAllStocks(Region.Tr);
    expect(resp).not.toBeEmpty();
  });


  test('GetAllStocksWithPagination', async () => {
    const resp = await client.getAllStocks(Region.Tr, 10, 10);
    expect(resp).not.toBeEmpty();
    expect(resp.length).toBe(10);
  });

  test('GetStockDetailByID', async () => {
    const resp = await client.getStockDetailById("61dd0d6f0ec2114146342fd0", Locale.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('GetStockDetailBySymbol', async () => {
    const resp = await client.getStockDetailBySymbol("TUPRS", AssetClass.Equity, Region.Tr, Locale.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('GetHistoricalPrices', async () => {
    const resp = await client.getHistoricalPrices(
      ["TUPRS", "SASA"],
      Region.Tr,
      [HistoricalPricePeriod.OneDay, HistoricalPricePeriod.OneWeek, HistoricalPricePeriod.OneMonth]
    );
    expect(resp).not.toBeEmpty();

    for (const price of resp) {
      expect(price).not.toBeEmpty();
    }
  });

  test('GetCustomHistoricalPrices', async () => {
    let resp = await client.getCustomHistoricalPrices(
      "TUPRS",
      Region.Tr,
      "2024-01-01",
      "2024-03-01",
      HistoricalPriceInterval.OneDay,
      false
    );
    expect(resp).not.toBeEmpty();

    for (const price of resp) {
      expect(price).not.toBeEmpty();
    }

    resp = await client.getCustomHistoricalPrices(
      "SASA",
      Region.Tr,
      "2024-01-01 10:00:00",
      "2024-01-05 10:00:00",
      HistoricalPriceInterval.OneHour,
      true
    );
    expect(resp).not.toBeEmpty();

    for (const price of resp) {
      expect(price).not.toBeEmpty();
    }
  });

  test('GetStockRestrictions', async () => {
    await client.getStockRestrictions("TUPRS", Region.Tr);
  });

  test('GetTickRules', async () => {
    const resp = await client.getTickRules("TUPRS", Region.Tr);
    expect(resp).not.toBeEmpty();
  });
});
