import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { StockClient, AssetClass, HistoricalPricePeriod } from '../client/stocks';
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

  test('GetStockRestrictions', async () => {
    await client.getStockRestrictions("TUPRS", Region.Tr);
  });
});
