// import { Logger } from 'winston';
// import { LaplaceConfiguration } from '../utilities/configuration';
// import { Client, createClient } from '../client/client';
// import { LivePriceClient, BISTStockLiveData, USStockLiveData } from '../client/live_price';
// import { Region } from '../client/collections';
// import './client_test_suite';

// describe('LivePrice', () => {
//   let client: Client;
//   let livePriceClient: LivePriceClient;

//   beforeAll(() => {
//     const config = (global as any).testSuite.config as LaplaceConfiguration;
//     const logger: Logger = {
//       info: jest.fn(),
//       error: jest.fn(),
//       warn: jest.fn(),
//       debug: jest.fn(),
//     } as unknown as Logger;

//     client = createClient(config, logger);
//     livePriceClient = new LivePriceClient(client);
//   });

//   const testLivePrice = async (
//     symbols: string[],
//     region: Region,
//     getLivePriceFunc: (symbols: string[], region: Region) => AsyncGenerator<BISTStockLiveData | USStockLiveData, void, unknown>
//   ) => {
//     const livePriceGenerator = getLivePriceFunc.call(livePriceClient, symbols, region);
//     let livePriceCount = 0;

//     try {
//       for await (const livePrice of livePriceGenerator) {
//         expect(livePrice).not.toBeEmpty();
//         livePriceCount++;
//         if (livePriceCount > 3) {
//           break;
//         }
//       }
//     } catch (error) {
//       throw new Error(`Error occurred during live price retrieval: ${error}`);
//     }

//     expect(livePriceCount).toBeGreaterThan(0);
//   };

//   test('BISTLivePrice', async () => {
//     const symbols = ['TUPRS', 'SASA', 'THYAO', 'GARAN', 'YKBN'];
//     await testLivePrice(symbols, Region.Tr, livePriceClient.getLivePriceForBIST);
//   }, 10000);

//   test('USLivePrice', async () => {
//     const symbols = ['AAPL', 'GOOGL', 'MSFT', 'AMZN', 'META'];
//     await testLivePrice(symbols, Region.Us, livePriceClient.getLivePriceForUS);
//   }, 10000);
// });