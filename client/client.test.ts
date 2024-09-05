import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { Client, createClient } from './client';
import '../utilities/client_test_suite';

// Assuming these are defined elsewhere in your project
enum Region { Tr = 'tr' }
enum Locale { Tr = 'tr' }

class LaplaceClientTestSuite {
  private config: LaplaceConfiguration;

  constructor(config: LaplaceConfiguration) {
    this.config = config;
  }

  async testClient() {
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    const client = createClient(this.config, logger);

    const res = await client.sendRequest({
      method: 'GET',
      url: '/api/v1/industry',
      params: {
        region: Region.Tr,
        locale: Locale.Tr,
      },
    });

    expect(res).toBeTruthy();
    expect(res).not.toEqual({});
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
    await testSuite.testClient();
  });
});