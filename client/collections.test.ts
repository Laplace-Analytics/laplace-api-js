import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { CollectionClient, Region, Locale } from './collections';
import '../utilities/client_test_suite';

describe('Collections', () => {
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

  test('GetAllIndustries', async () => {
    const resp = await client.getAllIndustries(Region.Tr, Locale.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('GetIndustryDetails', async () => {
    const resp = await client.getIndustryDetail("65533e441fa5c7b58afa0944", Region.Tr, Locale.Tr);
    expect(resp).not.toBeEmpty();
  });

  test('GetSectorDetails', async () => {
    const resp = await client.getSectorDetail("65533e047844ee7afe9941b9", Region.Tr, Locale.Tr);
    expect(resp).not.toBeEmpty();
  });
});