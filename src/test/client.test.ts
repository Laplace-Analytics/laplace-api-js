import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { createClient } from '../client/client';
import './client_test_suite';
import { Region, Locale } from '../client/collections';
import { CollectionClient } from '../client/collections';
import { LaplaceHTTPError } from '../client/errors';
import { suite } from 'node:test';

class LaplaceClientTestSuite {
  public config: LaplaceConfiguration;

  constructor(config: LaplaceConfiguration) {
    this.config = config;
  }
}

describe('LaplaceClient', () => {
  let testSuite: LaplaceClientTestSuite;

  beforeAll(() => {
    // Assuming global.testSuite is set up as in the previous example
    const config = (global as any).testSuite.config;
    testSuite = new LaplaceClientTestSuite(config);
  });

  it('should make a successful request', async () => {
    
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    const client = createClient(testSuite.config, logger);

    const res = await client.sendRequest({
      method: 'GET',
      url: '/api/v1/sector',
      params: {
        region: Region.Tr,
        locale: Locale.Tr,
      },
    });

    expect(res).toBeTruthy();
    expect(res).not.toEqual({});
  });
  it('should fail if invalid token', async () => {
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    var invalidConfig : LaplaceConfiguration = testSuite.config;
    invalidConfig.apiKey = 'invalid';

    const client = new CollectionClient(invalidConfig, logger);

    const f = async () => {await client.getAllIndustries(Region.Tr, Locale.Tr)};


    await expect(f).rejects.toThrow(LaplaceHTTPError);
  });
});