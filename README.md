# Laplace TypeScript/JavaScript SDK

[![Node.js Version](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/laplace-api-js.svg)](https://www.npmjs.com/package/laplace-api-js)

The official TypeScript/JavaScript SDK for the Laplace stock data platform. Get easy access to stock data, collections, financials, funds, and AI-powered insights.

## Features

- 🚀 **Easy to use**: Simple, intuitive API with TypeScript/JavaScript idioms
- 📊 **Comprehensive data**: Stocks, collections, financials, funds, and AI insights
- 🔧 **Well-typed**: Full TypeScript type safety with comprehensive interfaces
- 🧪 **Well-tested**: Comprehensive test coverage with real API integration
- 🌍 **Multi-region**: Support for US and Turkish markets
- ⚡ **Fast**: High-performance HTTP requests
- 📚 **Well-documented**: Complete documentation for all public methods
- 🔄 **Real-time**: Live price streaming with Server-Sent Events

## Installation

```bash
npm install laplace-api-js
```

## Quick Start

```typescript
import { createClient } from "laplace-api-js";
import { LaplaceConfiguration } from "laplace-api-js";
import { Logger } from "winston";

// Initialize the client
const config: LaplaceConfiguration = {
  apiKey: "your-api-key-here",
  baseURL: "https://api.laplace.finfree.co",
};

const logger: Logger = {
  info: console.log,
  error: console.error,
  warn: console.warn,
  debug: console.log,
} as Logger;

const client = createClient(config, logger);

// Get stock details
async function getStockDetails() {
  try {
    const stock = await client.getStockDetailBySymbol(
      "AAPL",
      "equity",
      "us",
      "en"
    );
    console.log(`${stock.name}: ${stock.description}`);
  } catch (error) {
    console.error("Error fetching stock:", error);
  }
}

// Get all stocks in a region
async function getAllStocks() {
  try {
    const stocks = await client.getAllStocks("us", 1, 10);
    stocks.forEach((stock) => {
      console.log(`${stock.symbol}: ${stock.name}`);
    });
  } catch (error) {
    console.error("Error fetching stocks:", error);
  }
}

// Get collections
async function getCollections() {
  try {
    const collections = await client.getAllCollections("tr", "en");
    collections.forEach((collection) => {
      console.log(`${collection.title}: ${collection.numStocks} stocks`);
    });
  } catch (error) {
    console.error("Error fetching collections:", error);
  }
}

// Get live price data
async function getLivePrices() {
  try {
    const liveClient = client.getLivePriceForBIST(["THYAO", "GARAN"]);

    for await (const data of liveClient.receive()) {
      console.log("Live price:", data);
      break; // Get first data and exit
    }

    liveClient.close();
  } catch (error) {
    console.error("Error getting live prices:", error);
  }
}
```

## API Reference

### Stocks Client

```typescript
// Get all stocks with pagination
const stocks = await client.getAllStocks("us", 1, 10);

// Get stock detail by symbol
const stock = await client.getStockDetailBySymbol("AAPL", "equity", "us", "en");

// Get stock detail by ID
const stock = await client.getStockDetailByID("stock-id", "en");

// Get historical prices
const prices = await client.getHistoricalPrices(["AAPL", "GOOGL"], "us", [
  "1d",
  "1w",
]);

// Get historical prices with custom interval
const prices = await client.getCustomHistoricalPrices(
  "AAPL",
  "us",
  "2024-01-01",
  "2024-01-31",
  "1m",
  true
);

// Get tick rules (Turkey only)
const rules = await client.getTickRules("THYAO", "tr");

// Get restrictions (Turkey only)
const restrictions = await client.getStockRestrictions("THYAO", "tr");
```

### Collections Client

```typescript
// Get all collections
const collections = await client.getAllCollections("tr", "en");

// Get collection detail
const detail = await client.getCollectionDetail("collection-id", "tr", "en");

// Get themes
const themes = await client.getAllThemes("tr", "en");

// Get theme detail
const themeDetail = await client.getThemeDetail("theme-id", "tr", "en");

// Get industries
const industries = await client.getAllIndustries("tr", "en");

// Get industry detail
const industryDetail = await client.getIndustryDetail(
  "industry-id",
  "tr",
  "en"
);

// Get sectors
const sectors = await client.getAllSectors("tr", "en");

// Get sector detail
const sectorDetail = await client.getSectorDetail("sector-id", "tr", "en");
```

### Funds Client

```typescript
// Get all funds
const funds = await client.getFunds("tr", 1, 10);

// Get fund statistics
const stats = await client.getFundStats("fund-symbol", "tr");

// Get fund distribution
const distribution = await client.getFundDistribution("fund-symbol", "tr");

// Get historical fund prices
const prices = await client.getHistoricalFundPrices("fund-symbol", "tr", "1y");
```

### Financial Data Client

```typescript
// Get financial ratios
const ratios = await client.getHistoricalRatios(
  "AAPL",
  ["pe-ratio"],
  "us",
  "en"
);

// Get financial ratio comparisons
const comparisons = await client.getFinancialRatioComparison(
  "AAPL",
  "us",
  "sector"
);

// Get stock dividends
const dividends = await client.getStockDividends("AAPL", "us");

// Get stock statistics
const stats = await client.getStockStats(["AAPL", "GOOGL"], "us");

// Get top movers
const movers = await client.getTopMovers(
  "us",
  1,
  10,
  "gainers",
  "stock",
  "equity"
);
```

### Live Price Client

```typescript
// Get live prices for BIST stocks
const bistClient = client.getLivePriceForBIST(["THYAO", "GARAN"]);

// Get live prices for US stocks
const usClient = client.getLivePriceForUS(["AAPL", "GOOGL"]);

// Receive live data
for await (const data of bistClient.receive()) {
  console.log("Received BIST data:", data);
  // data.s - symbol, data.p - price, data.ch - change, data.d - date
}

// Subscribe to different symbols
await bistClient.subscribe(["AKBNK", "EREGL"]);

// Close connection
bistClient.close();
```

### Brokers Client

```typescript
// Get all brokers
const brokers = await client.getBrokers("tr", 1, 10);

// Get market stocks with broker statistics
const marketStocks = await client.getMarketStocks(
  "tr",
  "netAmount",
  "desc",
  "2024-01-01",
  "2024-01-31",
  1,
  10
);

// Get brokers by stock
const brokersByStock = await client.getBrokersByStock(
  "THYAO",
  "tr",
  "netAmount",
  "desc",
  "2024-01-01",
  "2024-01-31",
  1,
  10
);
```

### Search Client

```typescript
// Search across stocks, collections, sectors, and industries
const results = await client.search(
  "technology",
  ["stock", "collection"],
  "us",
  "en"
);
```

### WebSocket Client

```typescript
// Create WebSocket client for real-time data
const webSocketClient = new LivePriceWebSocketClient();

// Connect to WebSocket
await webSocketClient.connect("ws://example.com/websocket");

// Subscribe to live price feeds
const unsubscribe = webSocketClient.subscribe(
  ["THYAO", "GARAN"],
  "live_price_tr",
  (data) => {
    console.log("Received live data:", data);
  }
);

// Close connection
await webSocketClient.close();
```

### Capital Increase Client

```typescript
// Get all capital increases
const increases = await client.getAllCapitalIncreases(1, 10, "tr");

// Get capital increases for a specific instrument
const instrumentIncreases = await client.getCapitalIncreasesForInstrument(
  "THYAO",
  1,
  10,
  "tr"
);

// Get active rights for an instrument
const rights = await client.getActiveRightsForInstrument(
  "THYAO",
  "2024-01-15",
  "tr"
);
```

### Custom Themes Client

```typescript
// Get all custom themes
const themes = await client.getAllCustomThemes("en");

// Get custom theme detail
const themeDetail = await client.getCustomThemeDetail("theme-id", "en", null);

// Create a custom theme
const id = await client.createCustomTheme({
  title: { en: "My Tech Portfolio" },
  description: { en: "Technology stocks portfolio" },
  region: ["us"],
  stocks: ["stock-id-1", "stock-id-2"],
  status: "active",
});

// Update a custom theme
await client.updateCustomTheme(id, {
  title: { en: "Updated Tech Portfolio" },
  stockIds: ["stock-id-1", "stock-id-2"],
});

// Delete a custom theme
await client.deleteCustomTheme(id);
```

### Key Insights Client

```typescript
// Get key insights for a stock
const insights = await client.getKeyInsights("AAPL", "us");
```

## Supported Regions

- **US**: United States stock market
- **TR**: Turkey stock market (Borsa Istanbul)

## Error Handling

```typescript
import { createClient } from "laplace-api-js";
import { LaplaceHTTPError } from "laplace-api-js";

const client = createClient(config, logger);

try {
  const stock = await client.getStockDetailBySymbol(
    "INVALID",
    "equity",
    "us",
    "en"
  );
} catch (error) {
  if (error instanceof LaplaceHTTPError) {
    console.log(`API Error: ${error.message}`);
    console.log(`Status Code: ${error.httpStatus}`);
  } else {
    console.log(`Error: ${error}`);
  }
}
```

## Authentication

Get your API key from the Laplace platform and initialize the client:

```typescript
import { createClient } from "laplace-api-js";
import { LaplaceConfiguration } from "laplace-api-js";

const config: LaplaceConfiguration = {
  apiKey: "your-api-key-here",
  baseURL: "https://api.laplace.finfree.co",
};

const client = createClient(config, logger);
```

## Configuration

You can also load configuration from environment variables:

```typescript
import { loadGlobal } from "laplace-api-js";

const config = loadGlobal();
const client = createClient(config, logger);
```

Environment variables:

- `API_KEY`: Your API key
- `BASE_URL`: API base URL

## Development

### Setup

```bash
git clone https://github.com/Laplace-Analytics/laplace-api-js.git
cd laplace-api-js
npm install
```

### Building

```bash
# Build the project
npm run build

# Build with type checking
npm run build:check
```

## Requirements

- Node.js 18+
- TypeScript 5.0+

## Documentation

Full API documentation is available at [laplace.finfree.co/en/docs](https://laplace.finfree.co/en/docs)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
