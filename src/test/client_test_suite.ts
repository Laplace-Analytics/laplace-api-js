import * as path from 'path';
import * as dotenv from 'dotenv';
import { findModuleRoot } from '../utilities/fs';
import { loadGlobal, LaplaceConfiguration } from '../utilities/configuration';

const testConfig = './src/utilities/test.env';

class ClientTestSuite {
  config: LaplaceConfiguration | null = null;

  async setUp(): Promise<void> {
    try {
      const repoRoot = await findModuleRoot();
      const configPath = path.join(repoRoot, testConfig);
      
      dotenv.config({ path: configPath });
      
      this.config = loadGlobal(configPath);

      if (!this.config) {
        throw new Error('Config is not set');
      }
      
      if (!this.config.apiKey) {
        throw new Error('API key is not set');
      }
      
      if (!this.config.baseURL) {
        throw new Error('API base URL is not set');
      }
    } catch (error) {
      throw new Error(`Setup failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
}

// Jest beforeAll hook to set up the test suite
beforeAll(async () => {
  const suite = new ClientTestSuite();
  await suite.setUp();
  (global as any).testSuite = suite;
});

// Example test
test('Config is properly loaded', () => {
  expect((global as any).testSuite.config).toBeTruthy();
  expect((global as any).testSuite.config?.apiKey).toBeTruthy();
  expect((global as any).testSuite.config?.baseURL).toBeTruthy();
});

export { ClientTestSuite };
