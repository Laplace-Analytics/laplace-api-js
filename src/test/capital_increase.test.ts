import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { CapitalIncreaseClient } from '../client/capital_increase';
import { Region } from '../client/collections';
import './client_test_suite';


describe('Capital Increase', () => {
  let client: CapitalIncreaseClient;

  beforeAll(() => {
    // Assuming global.testSuite is set up as in the previous example
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new CapitalIncreaseClient(config, logger);
  });

  test('GetAllCapitalIncreases', async () => {
    await client.getAllCapitalIncreases(1, 10, Region.Tr, );
  });

  test('GetCapitalIncreasesForInstrument', async () => {
    await client.getCapitalIncreasesForInstrument("TUPRS", 1, 10, Region.Tr);
  });

  test('GetActiveRightsForInstrument', async () => {
     await client.getActiveRightsForInstrument("TUPRS", "2024-01-01", Region.Tr);
  });

});
