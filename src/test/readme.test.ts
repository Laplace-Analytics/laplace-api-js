import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import "./client_test_suite";
import { Region, Locale } from "../client/collections";
import {
  StockClient,
  AssetClass,
  HistoricalPricePeriod,
  HistoricalPriceInterval,
} from "../client/stocks";
import { CollectionClient } from "../client/collections";
import { FundsClient, HistoricalFundPricePeriod } from "../client/funds";
import {
  FinancialClient,
  HistoricalRatiosKey,
  RatioComparisonPeerType,
} from "../client/financial_ratios";
import {
  FinancialFundamentalsClient,
  TopMoverDirection,
} from "../client/financial_fundamentals";
import { AssetType } from "../client/stocks";
import { LivePriceClient } from "../client/live-price";
import { BrokerClient, BrokerSort, SortDirection } from "../client/broker";
import { SearchClient, SearchType } from "../client/search";
import {
  LivePriceWebSocketClient,
  LivePriceFeed,
} from "../client/live-price-web-socket";
import { CapitalIncreaseClient } from "../client/capital_increase";
import { CustomThemeClient, CollectionStatus } from "../client/custom_theme";
import { KeyInsightClient } from "../client/key-insights";
import { LaplaceHTTPError } from "../client/errors";

describe("README Examples - Comprehensive Tests", () => {
  let stockClient: StockClient;
  let collectionClient: CollectionClient;
  let fundsClient: FundsClient;
  let financialClient: FinancialClient;
  let financialFundamentalsClient: FinancialFundamentalsClient;
  let livePriceClient: LivePriceClient;
  let brokerClient: BrokerClient;
  let searchClient: SearchClient;
  let webSocketClient: LivePriceWebSocketClient;
  let capitalIncreaseClient: CapitalIncreaseClient;
  let customThemeClient: CustomThemeClient;
  let keyInsightClient: KeyInsightClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    // Initialize all clients
    stockClient = new StockClient(config, logger);
    collectionClient = new CollectionClient(config, logger);
    fundsClient = new FundsClient(config, logger);
    financialClient = new FinancialClient(config, logger);
    financialFundamentalsClient = new FinancialFundamentalsClient(
      config,
      logger
    );
    livePriceClient = new LivePriceClient(config, logger);
    brokerClient = new BrokerClient(config, logger);
    searchClient = new SearchClient(config, logger);
    webSocketClient = new LivePriceWebSocketClient(
      [LivePriceFeed.LiveBist, LivePriceFeed.LiveUs],
      "test-user-id",
      config,
      logger
    );
    capitalIncreaseClient = new CapitalIncreaseClient(config, logger);
    customThemeClient = new CustomThemeClient(config, logger);
    keyInsightClient = new KeyInsightClient(config, logger);
  });

  describe("Stocks Client", () => {
    test("getAllStocks with pagination", async () => {
      const stocks = await stockClient.getAllStocks(Region.Us, 1, 10);
      expect(Array.isArray(stocks)).toBe(true);
      if (stocks.length > 0) {
        expect(typeof stocks[0].id).toBe("string");
        expect(typeof stocks[0].symbol).toBe("string");
        expect(typeof stocks[0].name).toBe("string");
      }
    });

    test("getStockDetailBySymbol", async () => {
      const stock = await stockClient.getStockDetailBySymbol(
        "AAPL",
        AssetClass.Equity,
        Region.Us,
        Locale.En
      );
      expect(stock).toBeDefined();
      expect(typeof stock.name).toBe("string");
      expect(typeof stock.description).toBe("string");
    });

    test("getStockDetailByID", async () => {
      // Using a valid ID format
      const stock = await stockClient.getStockDetailById(
        "648ab66e38daf3102a5a7401",
        Locale.En
      );
      expect(stock).toBeDefined();
      expect(typeof stock.id).toBe("string");
    });

    test("getHistoricalPrices", async () => {
      const prices = await stockClient.getHistoricalPrices(
        ["THYAO"],
        Region.Tr,
        [HistoricalPricePeriod.OneDay, HistoricalPricePeriod.OneWeek]
      );
      expect(Array.isArray(prices)).toBe(true);
    });

    test("getCustomHistoricalPrices", async () => {
      const prices = await stockClient.getCustomHistoricalPrices(
        "THYAO",
        Region.Tr,
        "2024-01-01",
        "2024-01-10",
        HistoricalPriceInterval.OneMinute,
        true
      );
      expect(Array.isArray(prices)).toBe(true);
    });

    test("getTickRules", async () => {
      const rules = await stockClient.getTickRules("THYAO", Region.Tr);
      expect(rules).toBeDefined();
      expect(typeof rules.basePrice).toBe("number");
    });

    test("getStockRestrictions", async () => {
      const restrictions = await stockClient.getStockRestrictions(
        "THYAO",
        Region.Tr
      );
      expect(Array.isArray(restrictions)).toBe(true);
    });
  });

  describe("Collections Client", () => {
    test("getAllCollections", async () => {
      const collections = await collectionClient.getAllCollections(
        Region.Tr,
        Locale.En
      );
      expect(Array.isArray(collections)).toBe(true);
      if (collections.length > 0) {
        expect(typeof collections[0].id).toBe("string");
        expect(typeof collections[0].title).toBe("string");
      }
    });

    test("getCollectionDetail", async () => {
      const detail = await collectionClient.getCollectionDetail(
        "620f455a0187ade00bb0d55f",
        Region.Tr,
        Locale.En
      );
      expect(detail).toBeDefined();
      expect(typeof detail.id).toBe("string");
    });

    test("getAllThemes", async () => {
      const themes = await collectionClient.getAllThemes(Region.Tr, Locale.En);
      expect(Array.isArray(themes)).toBe(true);
    });

    test("getThemeDetail", async () => {
      const themeDetail = await collectionClient.getThemeDetail(
        "620f455a0187ade00bb0d55f",
        Region.Tr,
        Locale.En
      );
      expect(themeDetail).toBeDefined();
    });

    test("getAllIndustries", async () => {
      const industries = await collectionClient.getAllIndustries(
        Region.Tr,
        Locale.En
      );
      expect(Array.isArray(industries)).toBe(true);
    });

    test("getIndustryDetail", async () => {
      const industryDetail = await collectionClient.getIndustryDetail(
        "65533e441fa5c7b58afa0957",
        Region.Tr,
        Locale.En
      );
      expect(industryDetail).toBeDefined();
    });

    test("getAllSectors", async () => {
      const sectors = await collectionClient.getAllSectors(
        Region.Tr,
        Locale.En
      );
      expect(Array.isArray(sectors)).toBe(true);
    });

    test("getSectorDetail", async () => {
      const sectorDetail = await collectionClient.getSectorDetail(
        "65533e047844ee7afe9941bf",
        Region.Tr,
        Locale.En
      );
      expect(sectorDetail).toBeDefined();
    });
  });

  describe("Funds Client", () => {
    test("getFunds", async () => {
      const funds = await fundsClient.getFunds(Region.Tr, 1, 10);
      expect(Array.isArray(funds)).toBe(true);
    });

    test("getFundStats", async () => {
      const stats = await fundsClient.getFundStats("fund-symbol", Region.Tr);
      expect(stats).toBeDefined();
    });

    test("getFundDistribution", async () => {
      const distribution = await fundsClient.getFundDistribution(
        "fund-symbol",
        Region.Tr
      );
      expect(distribution).toBeDefined();
    });

    test("getHistoricalFundPrices", async () => {
      const prices = await fundsClient.getHistoricalFundPrices(
        "fund-symbol",
        Region.Tr,
        HistoricalFundPricePeriod.OneYear
      );
      expect(Array.isArray(prices)).toBe(true);
    });
  });

  describe("Financial Data Client", () => {
    test("getHistoricalRatios", async () => {
      const ratios = await financialClient.getHistoricalRatios(
        "THYAO",
        [HistoricalRatiosKey.PriceToEarningsRatio],
        Region.Tr,
        Locale.En
      );
      expect(Array.isArray(ratios)).toBe(true);
    });

    test("getFinancialRatioComparison", async () => {
      const comparisons = await financialClient.getFinancialRatioComparison(
        "TUPRS",
        Region.Tr,
        RatioComparisonPeerType.Sector
      );
      expect(comparisons).toBeDefined();
    });

    test("getStockDividends", async () => {
      const dividends = await financialFundamentalsClient.getStockDividends(
        "AAPL",
        Region.Us
      );
      expect(Array.isArray(dividends)).toBe(true);
    });

    test("getStockStats", async () => {
      const stats = await financialFundamentalsClient.getStockStats(
        ["AAPL", "GOOGL"],
        Region.Us
      );
      expect(Array.isArray(stats)).toBe(true);
    });

    test("getTopMovers", async () => {
      const movers = await financialFundamentalsClient.getTopMovers(
        Region.Tr,
        1,
        10,
        TopMoverDirection.Gainers,
        AssetType.Stock,
        AssetClass.Equity
      );
      expect(Array.isArray(movers)).toBe(true);
    });
  });

  describe("Live Price Client", () => {
    test("getLivePriceForBIST", async () => {
      const bistClient = livePriceClient.getLivePriceForBIST([
        "THYAO",
        "GARAN",
      ]);
      expect(bistClient).toBeDefined();
      expect(typeof bistClient.receive).toBe("function");
      expect(typeof bistClient.close).toBe("function");
    });

    test("getLivePriceForUS", async () => {
      const usClient = livePriceClient.getLivePriceForUS(["AAPL", "GOOGL"]);
      expect(usClient).toBeDefined();
      expect(typeof usClient.receive).toBe("function");
      expect(typeof usClient.close).toBe("function");
    });
  });

  describe("Brokers Client", () => {
    test("getBrokers", async () => {
      const brokers = await brokerClient.getBrokers(Region.Tr, 1, 10);
      expect(Array.isArray(brokers.items)).toBe(true);
    });

    test("getMarketStocks", async () => {
      const marketStocks = await brokerClient.getMarketStocks(
        Region.Tr,
        BrokerSort.NetAmount,
        SortDirection.Desc,
        "2024-01-01",
        "2024-01-31",
        1,
        10
      );
      expect(Array.isArray(marketStocks.items)).toBe(true);
    });

    test("getBrokersByStock", async () => {
      const brokersByStock = await brokerClient.getBrokersByStock(
        "THYAO",
        Region.Tr,
        BrokerSort.NetAmount,
        SortDirection.Desc,
        "2024-01-01",
        "2024-01-31",
        1,
        10
      );
      expect(Array.isArray(brokersByStock.items)).toBe(true);
    });
  });

  describe("Search Client", () => {
    test("search", async () => {
      const results = await searchClient.search(
        "technology",
        [SearchType.Stock, SearchType.Collection],
        Region.Us,
        Locale.En
      );
      expect(results).toBeDefined();
    });
  });

  describe("WebSocket Client", () => {
    test("connect", async () => {
      // Test WebSocket connection functionality
      expect(webSocketClient).toBeDefined();
      expect(typeof webSocketClient.connect).toBe("function");
    });
  });

  describe("Capital Increase Client", () => {
    test("getAllCapitalIncreases", async () => {
      const increases = await capitalIncreaseClient.getAllCapitalIncreases(
        1,
        10,
        Region.Tr
      );
      expect(Array.isArray(increases.items)).toBe(true);
    });

    test("getCapitalIncreasesForInstrument", async () => {
      const instrumentIncreases =
        await capitalIncreaseClient.getCapitalIncreasesForInstrument(
          "THYAO",
          1,
          10,
          Region.Tr
        );
      expect(Array.isArray(instrumentIncreases.items)).toBe(true);
    });

    test("getActiveRightsForInstrument", async () => {
      const rights = await capitalIncreaseClient.getActiveRightsForInstrument(
        "THYAO",
        "2024-01-15",
        Region.Tr
      );
      expect(Array.isArray(rights)).toBe(true);
    });
  });

  describe("Custom Themes Client", () => {
    test("getAllCustomThemes", async () => {
      const themes = await customThemeClient.getAllCustomThemes(Locale.En);
      expect(Array.isArray(themes)).toBe(true);
    });

    test("getCustomThemeDetail", async () => {
      const themeDetail = await customThemeClient.getCustomThemeDetail(
        "685d0912119e32929b8006ac",
        Locale.En,
        null
      );
      expect(themeDetail).toBeDefined();
    });

    test("createCustomTheme", async () => {
      const stockID = "648ab66e38daf3102a5a7401";
      const id = await customThemeClient.createCustomTheme({
        title: { en: "My Tech Portfolio" },
        description: { en: "Technology stocks portfolio" },
        region: [Region.Us],
        stocks: [stockID],
        status: CollectionStatus.Active,
      });
      expect(typeof id).toBe("string");
    });

    test("updateCustomTheme", async () => {
      const themeID = "620f455a0187ade00bb0d55f";
      const stockID = "648ab66e38daf3102a5a7401";
      await expect(
        customThemeClient.updateCustomTheme(themeID, {
          title: { en: "Updated Tech Portfolio" },
          stockIds: [stockID],
        })
      ).resolves.not.toThrow();
    });

    test("deleteCustomTheme", async () => {
      const themeID = "620f455a0187ade00bb0d55f";
      await expect(
        customThemeClient.deleteCustomTheme(themeID)
      ).resolves.not.toThrow();
    });
  });

  describe("Key Insights Client", () => {
    test("getKeyInsights", async () => {
      const insights = await keyInsightClient.getKeyInsights("AAPL", Region.Us);
      expect(insights).toBeDefined();
    });
  });

  describe("Error Handling", () => {
    test("should handle invalid API key", async () => {
      const invalidConfig = new LaplaceConfiguration({
        baseURL: "https://api.laplace.com",
        apiKey: "invalid-key",
      });

      const logger: Logger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      } as unknown as Logger;

      const invalidClient = new StockClient(invalidConfig, logger);

      await expect(
        invalidClient.getStockDetailBySymbol(
          "INVALID",
          AssetClass.Equity,
          Region.Us,
          Locale.En
        )
      ).rejects.toThrow(LaplaceHTTPError);
    });
  });
});
