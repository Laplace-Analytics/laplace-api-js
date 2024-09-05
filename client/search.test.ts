import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { SearchClient, SearchType } from './search';
import { Region, Locale } from './collections';
import '../utilities/client_test_suite';


describe('Search', () => {
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

  test('SearchStock', async () => {
    const resp = await client.search("TUPRS", [SearchType.Stock], Region.Tr, Locale.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('SearchIndustry', async () => {
    const resp = await client.search("Hava Taşımacılığı", [SearchType.Industry], Region.Tr, Locale.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('SearchAllTypes', async () => {
    const resp = await client.search("Ab", [
      SearchType.Stock,
      SearchType.Industry,
      SearchType.Sector,
      SearchType.Collection
    ], Region.Us, Locale.Tr);
    expect(resp).not.toBeEmpty();
  });
});