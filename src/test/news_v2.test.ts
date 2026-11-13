import * as path from "path";
import axios from "axios";
import { Logger } from "winston";
import { LaplaceConfiguration, loadGlobal } from "../utilities/configuration";
import {
  NewsClient,
  NewsEventType,
  NewsOrderBy,
  NewsOriginality,
  NewsTickerRelevance,
  NewsV2,
  NewsV2Page,
} from "../client/news";
import { Locale, Region } from "../client/collections";
import { SortDirection } from "../client/broker";
import { LaplaceHTTPError } from "../client/errors";

const logger = {
  info: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  debug: jest.fn(),
} as unknown as Logger;

const itemAllFields = {
  id: "3f6c1e2a",
  url: "https://www.ekonomim.com/a",
  imageUrl: "https://x/image.jpg",
  publisherUrl: "https://www.ekonomim.com",
  publisher: { name: "Ekonomim", logoUrl: null },
  publishedAt: null,
  ingestedAt: "2026-11-12T10:24:13.106706Z",
  contentUpdatedAt: null,
  updatedAt: "2026-11-12T10:31:02.55192Z",
  createdAt: "2026-11-12T10:24:13.106706Z",
  timestamp: "2026-11-12T10:24:13.106706Z",
  content: {
    title: "THY ekim ayında 8,1 milyon yolcu taşıdı",
    description: "d",
    content: ["p"],
    summary: ["s"],
    investorInsight: "i",
  },
  primaryTicker: "THYAO",
  tickers: [
    { id: "61dd0d6", symbol: "THYAO", name: "Türk Hava Yolları", region: "tr", relevance: "primary" },
  ],
  isListArticle: false,
  eventType: { slug: "operational-data", name: "Operasyonel Veriler", language: "tr" },
  qualityScore: 7,
  clusterId: "9b1d",
  isClusterLead: true,
  clusterSize: 4,
  originality: "original",
};

const itemOldShape = {
  id: "old",
  url: "https://x/a",
  imageUrl: "",
  publisherUrl: "https://x",
  publisher: { name: "X", logoUrl: null },
  timestamp: "2025-01-02T03:04:05Z",
  createdAt: "2025-01-02T03:04:05Z",
  qualityScore: 5,
  tickers: [{ id: "1", name: "Apple", symbol: "AAPL" }],
};

describe("NewsClient v2 (mocked)", () => {
  let client: NewsClient;
  let cli: { request: jest.Mock };

  beforeEach(() => {
    cli = { request: jest.fn() };
    const config = new LaplaceConfiguration({ apiKey: "test-key", baseURL: "http://test-api" });
    client = new NewsClient(config, logger, cli as any);
  });

  const lastParams = () => cli.request.mock.calls[cli.request.mock.calls.length - 1][0].params;

  describe("getNewsV2 query", () => {
    test("sends every new param with its API name and format", async () => {
      cli.request.mockResolvedValueOnce({ data: { recordCount: 0, items: [] } });

      await client.getNewsV2(Region.Tr, Locale.Tr, {
        symbols: "THYAO,GARAN",
        size: 73,
        tickerRelevance: [NewsTickerRelevance.PRIMARY, "mentioned"],
        excludeListArticles: false,
        eventTypes: [NewsEventType.DIVIDEND, "some-new-slug"],
        excludeEventTypes: [NewsEventType.OTHER],
        collapseClusters: true,
        maxPublisherShare: 25,
        publishedFrom: "2026-11-01",
        publishedTo: "2026-11-12T09:00:00Z",
        updatedSince: "2026-11-10T00:00:00Z",
        asOf: "2026-11-11T00:00:00Z",
        cursor: "abc",
        includeTotal: false,
      });

      expect(cli.request.mock.calls[0][0].url).toBe("/api/v2/news");
      expect(lastParams()).toEqual({
        region: "tr",
        locale: "tr",
        symbols: "THYAO,GARAN",
        size: 73,
        tickerRelevance: "primary,mentioned",
        excludeListArticles: "false",
        eventTypes: "dividend,some-new-slug",
        excludeEventTypes: "other",
        collapseClusters: "true",
        maxPublisherShare: 25,
        publishedFrom: "2026-11-01",
        publishedTo: "2026-11-12T09:00:00Z",
        updatedSince: "2026-11-10T00:00:00Z",
        asOf: "2026-11-11T00:00:00Z",
        cursor: "abc",
        includeTotal: "false",
      });
    });

    test("doesn't send unset or empty params", async () => {
      cli.request.mockResolvedValueOnce({ data: { recordCount: 0, items: [] } });
      await client.getNewsV2(Region.Us, Locale.En, { eventTypes: [], tickerRelevance: [] });
      expect(lastParams()).toEqual({ region: "us", locale: "en" });
    });
  });

  describe("orderBy rendering", () => {
    const cases: [string, object, Record<string, unknown>][] = [
      ["single field", { orderBy: NewsOrderBy.PUBLISHED_AT }, { orderBy: "publishedAt" }],
      [
        "single field with direction",
        { orderBy: NewsOrderBy.UPDATED_AT, orderByDirection: SortDirection.Asc },
        { orderBy: "updatedAt", orderByDirection: "asc" },
      ],
      ["legacy quality_score", { orderBy: NewsOrderBy.QUALITY_SCORE }, { orderBy: "quality_score" }],
      [
        "multi field",
        {
          orderBy: NewsOrderBy.TIMESTAMP,
          orderByDirection: SortDirection.Asc,
          orderByFields: [
            [NewsOrderBy.QUALITY_SCORE_V2, SortDirection.Desc],
            ["publishedAt", SortDirection.Desc],
            NewsOrderBy.INGESTED_AT,
          ],
        },
        { orderBy: "qualityScore desc,publishedAt desc,ingestedAt" },
      ],
    ];

    test.each(cases)("%s", async (_name, options, expected) => {
      cli.request.mockResolvedValueOnce({ data: { recordCount: 0, items: [] } });
      await client.getNewsV2(Region.Us, Locale.En, options);
      expect(lastParams()).toEqual({ region: "us", locale: "en", ...expected });
    });
  });

  describe("parsing", () => {
    test("item with every new field, including null times", async () => {
      cli.request.mockResolvedValueOnce({ data: { recordCount: 1, items: [itemAllFields] } });
      const page = await client.getNewsV2(Region.Tr, Locale.Tr);
      const n = page.items[0];

      expect(n.publishedAt).toBeNull();
      expect(n.contentUpdatedAt).toBeNull();
      expect(n.ingestedAt).toBe("2026-11-12T10:24:13.106706Z");
      expect(n.primaryTicker).toBe("THYAO");
      expect(n.isListArticle).toBe(false);
      expect(n.eventType).toEqual({ slug: NewsEventType.OPERATIONAL_DATA, name: "Operasyonel Veriler", language: "tr" });
      expect(n.isClusterLead).toBe(true);
      expect(n.clusterSize).toBe(4);
      expect(n.originality).toBe(NewsOriginality.ORIGINAL);
      expect(n.tickers?.[0].relevance).toBe(NewsTickerRelevance.PRIMARY);
      expect(n.tickers?.[0].region).toBe(Region.Tr);
    });

    test("item with the old shape still type-checks and parses", async () => {
      const old: NewsV2 = itemOldShape;
      cli.request.mockResolvedValueOnce({ data: { recordCount: 1, items: [old] } });
      const page = await client.getNewsV2(Region.Tr, Locale.Tr);
      expect(page.items[0].publishedAt).toBeUndefined();
      expect(page.items[0].eventType).toBeUndefined();
    });

    test("page with null recordCount, nextCursor and publisherCap", async () => {
      const raw: NewsV2Page = {
        recordCount: null,
        items: [itemOldShape],
        nextCursor: "c1",
        publisherCap: { share: 25, perPublisher: 42, achievedShare: 24.9 },
      };
      cli.request.mockResolvedValueOnce({ data: raw });
      const page = await client.getNewsV2(Region.Tr, Locale.Tr, { maxPublisherShare: 25 });
      expect(page.recordCount).toBeNull();
      expect(page.nextCursor).toBe("c1");
      expect(page.publisherCap).toEqual({ share: 25, perPublisher: 42, achievedShare: 24.9 });
    });
  });

  describe("iterateNewsV2", () => {
    test("follows nextCursor and keeps the filters", async () => {
      cli.request
        .mockResolvedValueOnce({ data: { recordCount: null, items: [itemOldShape, itemOldShape], nextCursor: "next-1" } })
        .mockResolvedValueOnce({ data: { recordCount: null, items: [itemAllFields] } });

      const ids: string[] = [];
      for await (const n of client.iterateNewsV2(Region.Tr, Locale.Tr, {
        symbols: "THYAO",
        size: 2,
        eventTypes: [NewsEventType.DIVIDEND],
      })) {
        ids.push(n.id);
      }

      expect(ids).toEqual(["old", "old", "3f6c1e2a"]);
      expect(cli.request).toHaveBeenCalledTimes(2);
      const [first, second] = cli.request.mock.calls.map((c) => c[0].params);
      for (const p of [first, second]) {
        expect(p).toMatchObject({ symbols: "THYAO", size: 2, eventTypes: "dividend", includeTotal: "false" });
        expect(p).not.toHaveProperty("page");
        expect(p).not.toHaveProperty("skip");
      }
      expect(first).not.toHaveProperty("cursor");
      expect(second.cursor).toBe("next-1");
    });

    test("refuses page", async () => {
      const it = client.iterateNewsV2(Region.Tr, Locale.Tr, { page: 1 } as any);
      await expect(it.next()).rejects.toThrow("cursor paging");
      expect(cli.request).not.toHaveBeenCalled();
    });

    test("stops at the first error and rethrows it", async () => {
      cli.request
        .mockResolvedValueOnce({ data: { recordCount: null, items: [itemOldShape], nextCursor: "n" } })
        .mockRejectedValueOnce(new Error("page 2 failed"));

      const ids: string[] = [];
      await expect(
        (async () => {
          for await (const n of client.iterateNewsV2(Region.Tr, Locale.Tr)) ids.push(n.id);
        })()
      ).rejects.toThrow("page 2 failed");
      expect(ids).toEqual(["old"]);
      expect(cli.request).toHaveBeenCalledTimes(2);
    });
  });

  test("surfaces the API validation message", async () => {
    const message = 'invalid eventTypes value "foo": must be one of financial-results, guidance';
    const error = Object.assign(new Error("Request failed"), {
      isAxiosError: true,
      response: { status: 400, data: { message, error_code: "validation" } },
    });
    cli.request.mockRejectedValueOnce(error);

    const p = client.getNewsV2(Region.Tr, Locale.Tr, { eventTypes: ["foo"] });
    await expect(p).rejects.toBeInstanceOf(LaplaceHTTPError);
    await expect(p).rejects.toMatchObject({ httpStatus: 400 });
    await expect(p).rejects.toThrow(message.replace(/"/g, '\\"'));
  });

  test("getNewsEventTypes calls the endpoint and returns the list", async () => {
    const data = [
      { slug: "financial-results", name: "Finansal Sonuçlar", language: "tr" },
      { slug: "guidance", name: "Beklenti ve Hedefler", language: "tr" },
    ];
    cli.request.mockResolvedValueOnce({ data });

    const types = await client.getNewsEventTypes(Locale.Tr);

    const call = cli.request.mock.calls[0][0];
    expect(call.url).toBe("/api/v1/news/event-types");
    expect(call.params).toEqual({ locale: "tr" });
    expect(types).toEqual(data);
  });

  describe("streamNews filters", () => {
    const emptyStream = {
      async *[Symbol.asyncIterator]() {
        yield new TextEncoder().encode("data: " + JSON.stringify([itemAllFields]) + "\n\n");
      },
    };

    test("sends the new content filters", async () => {
      const spy = jest.spyOn(axios, "get").mockResolvedValueOnce({ data: emptyStream });
      const { events, cancel } = client.streamNews(Region.Tr, Locale.Tr, undefined, ["THYAO"], undefined, undefined, undefined, undefined, {
        tickerRelevance: [NewsTickerRelevance.PRIMARY],
        excludeListArticles: true,
        eventTypes: [NewsEventType.DIVIDEND, NewsEventType.GUIDANCE],
        excludeEventTypes: ["other"],
        collapseClusters: false,
      });

      const received: NewsV2[][] = [];
      for await (const items of events) received.push(items);

      expect(spy.mock.calls[0][0]).toBe(
        "http://test-api/api/v1/news/stream?locale=tr&region=tr&symbols=THYAO" +
          "&tickerRelevance=primary&excludeListArticles=true&eventTypes=dividend%2Cguidance" +
          "&excludeEventTypes=other&collapseClusters=false"
      );
      expect(received[0][0].primaryTicker).toBe("THYAO");
      cancel();
      spy.mockRestore();
    });
  });
});

// Live API tests. Skipped when no API key is configured.
let liveConfig: LaplaceConfiguration | null = null;
try {
  const cfg = loadGlobal(path.resolve(__dirname, "../utilities/test.env"));
  if (cfg?.apiKey) liveConfig = cfg;
} catch {
  liveConfig = null;
}

const describeLive = liveConfig ? describe : describe.skip;

describeLive("NewsClient v2 (live API)", () => {
  jest.setTimeout(60_000);
  const client = () => new NewsClient(liveConfig!, logger);

  test("THYAO news carries a named THYAO ticker", async () => {
    const page = await client().getNewsV2(Region.Tr, Locale.Tr, { symbols: "THYAO", size: 10 });
    const tickers = page.items.flatMap((n) => n.tickers ?? []).filter((t) => t.symbol === "THYAO");
    expect(tickers.length).toBeGreaterThan(0);
    expect(tickers[0].name).toBeTruthy();
  });

  test("a cursor run over a small query ends", async () => {
    const since = new Date().toISOString().slice(0, 10);
    let count = 0;
    for await (const _ of client().iterateNewsV2(Region.Tr, Locale.Tr, { symbols: "THYAO", size: 100, publishedFrom: since })) {
      count++;
    }
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test("an unknown event type raises LaplaceHTTPError with the API message", async () => {
    const p = client().getNewsV2(Region.Tr, Locale.Tr, { eventTypes: ["foo"] });
    await expect(p).rejects.toBeInstanceOf(LaplaceHTTPError);
    await expect(p).rejects.toThrow("eventTypes");
  });

  test("getNewsEventTypes returns slugs and names", async () => {
    const types = await client().getNewsEventTypes(Locale.Tr);
    expect(types.length).toBeGreaterThan(0);
    expect(types[0].slug).toBeTruthy();
    expect(types[0].name).toBeTruthy();
  });
});
