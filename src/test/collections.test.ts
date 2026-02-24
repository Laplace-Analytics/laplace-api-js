import { Logger } from "winston";
import { LaplaceConfiguration } from "../utilities/configuration";
import {
  CollectionClient,
  Locale,
  Region
} from "../client/collections";
import "./client_test_suite";
import { validateCollection, validateCollectionDetail } from "./helpers";
import {
  AggregateGraphPeriod,
} from "../client/collections";

const mockCollectionList = [
  {
    id: "620f455a0187ade00bb0d55f",
    title: "En Büyükler",
    region: ["tr"],
    imageUrl:
      "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/en-buyukler_original.webp",
    avatarUrl:
      "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/en-buyukler_avatar.webp",
    numStocks: 10,
    assetClass: "equity",
    order: 0,
  },
];

const mockCollectionDetail = {
  id: "620f455a0187ade00bb0d55f",
  title: "En Büyükler",
  region: ["tr"],
  imageUrl:
    "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/en-buyukler_original.webp",
  avatarUrl:
    "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/en-buyukler_avatar.webp",
  numStocks: 10,
  assetClass: "equity",
  order: 0,
  stocks: [
    {
      id: "61dd0d670ec2114146342fa5",
      assetType: "stock",
      name: "SASA Polyester",
      symbol: "SASA",
      sectorId: "65533e047844ee7afe9941c0",
      industryId: "65533e441fa5c7b58afa097a",
      updatedDate: "2025-08-05T14:53:59.57Z",
      active: true,
    },
  ],
};

const mockThemesList = [
  {
    id: "6256b0647d0bb100123effa7",
    title: "İhracat Şampiyonları",
    region: ["tr"],
    imageUrl:
      "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/ihracat-sampiyonlari_original.webp",
    avatarUrl:
      "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/ihracat-sampiyonlari_avatar.webp",
    numStocks: 15,
    assetClass: "equity",
  },
];

const mockThemeDetail = {
  id: "6256b0647d0bb100123effa7",
  title: "İhracat Şampiyonları",
  region: ["tr"],
  imageUrl:
    "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/ihracat-sampiyonlari_original.webp",
  avatarUrl:
    "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/ihracat-sampiyonlari_avatar.webp",
  numStocks: 15,
  assetClass: "equity",
  image:
    "https://finfree-storage.s3.eu-central-1.amazonaws.com/themes/tr/ihracat_sampiyonlari.png",
  order: 0,
  stocks: [
    {
      id: "61dd0d4b0ec2114146342f69",
      assetType: "stock",
      name: "Şişe ve Cam Fabrikaları",
      symbol: "SISE",
      sectorId: "65533e047844ee7afe9941be",
      industryId: "65533e441fa5c7b58afa0956",
      updatedDate: "2025-04-01T00:00:00.533Z",
      active: true,
    },
  ],
};

const mockIndustryList = [
  {
    id: "65533e441fa5c7b58afa097b",
    title: "Kimyasal (Çeşitlendirilmiş)",
    imageUrl:
      "https://finfree-storage.s3.amazonaws.com/collection-images/chemical-diversified.webp",
    avatarUrl:
      "https://finfree-storage.s3.amazonaws.com/collection-images/chemical-diversified_avatar.webp",
    numStocks: 1,
  },
];

const mockIndustryDetail = {
  id: "65533e441fa5c7b58afa0944",
  title: "Perakende (Özel Hatlar)",
  region: ["us", "tr"],
  imageUrl:
    "https://finfree-storage.s3.amazonaws.com/collection-images/retail-special-lines.webp",
  avatarUrl:
    "https://finfree-storage.s3.amazonaws.com/collection-images/retail-special-lines_avatar.webp",
  numStocks: 59,
  order: 0,
  stocks: [
    {
      id: "61dd0d850ec2114146343053",
      assetType: "stock",
      name: "Teknosa",
      symbol: "TKNSA",
      sectorId: "65533e047844ee7afe9941b9",
      industryId: "65533e441fa5c7b58afa0944",
      updatedDate: "2025-07-02T00:00:00.426Z",
      active: true,
    },
  ],
};

const mockSectorsList = [
  {
    id: "65533e047844ee7afe9941bf",
    title: "Teknoloji",
    imageUrl:
      "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/informationtechnology-stocks_original.webp",
    avatarUrl:
      "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/informationtechnology-stocks_avatar.webp",
    numStocks: 47,
  },
];

const mockSectorDetail = {
  id: "65533e047844ee7afe9941b9",
  title: "Tüketici Döngüsel",
  region: ["us", "tr"],
  imageUrl:
    "https://finfree-storage.s3.amazonaws.com/collection-images/consumer-cyclical.webp",
  avatarUrl:
    "https://finfree-storage.s3.amazonaws.com/collection-images/consumer-cyclical_avatar.webp",
  numStocks: 798,
  order: 0,
  stocks: [
    {
      id: "61dd0d420ec2114146342f2d",
      assetType: "stock",
      name: "Tek-Art İnşaat",
      symbol: "TEKTU",
      sectorId: "65533e047844ee7afe9941b9",
      industryId: "65533e441fa5c7b58afa093b",
      updatedDate: "2022-01-11T04:53:22.944Z",
      active: true,
    },
  ],
};

const mockPriceDataPoints = [
  {
    d: 1710403200000,
    o: 100.5,
    h: 105.2,
    l: 99.8,
    c: 103.7,
  },
  {
    d: 1710489600000,
    o: 103.7,
    h: 107.1,
    l: 102.3,
    c: 106.4,
  },
  {
    d: 1710576000000,
    o: 106.4,
    h: 108.9,
    l: 105.1,
    c: 107.8,
  },
];

const mockCollectionPriceGraph = {
  previous_close: 98.5,
  graph: mockPriceDataPoints,
};

describe("Collections", () => {
  let client: CollectionClient;

  beforeAll(() => {
    const config = (global as any).testSuite.config as LaplaceConfiguration;
    const logger: Logger = {
      info: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    } as unknown as Logger;

    client = new CollectionClient(config, logger);
  });

  describe("Integration Tests", () => {
    test("GetAllIndustries", async () => {
      const resp = await client.getAllIndustries(Region.Tr, Locale.Tr);
      expect(resp).not.toBeEmpty();

      const firstIndustry = resp[0];
      validateCollection(firstIndustry);
    });

    test("GetAllSectors", async () => {
      const resp = await client.getAllSectors(Region.Tr, Locale.Tr);
      expect(resp).not.toBeEmpty();

      const firstSector = resp[0];
      validateCollection(firstSector);
    });

    test("GetIndustryDetails", async () => {
      const resp = await client.getIndustryDetail(
        "65533e441fa5c7b58afa0944",
        Region.Tr,
        Locale.Tr
      );
      expect(resp).not.toBeEmpty();
      validateCollectionDetail(resp);
    });

    test("GetSectorDetails", async () => {
      const resp = await client.getSectorDetail(
        "65533e047844ee7afe9941b9",
        Region.Tr,
        Locale.Tr
      );
      expect(resp).not.toBeEmpty();
      validateCollectionDetail(resp);
    });

    test("GetAllThemes", async () => {
      const resp = await client.getAllThemes(Region.Tr, Locale.Tr);
      expect(resp).not.toBeEmpty();

      const firstTheme = resp[0];
      validateCollection(firstTheme);
    });

    test("GetThemeDetails", async () => {
      const resp = await client.getThemeDetail(
        "6256b0647d0bb100123effa7",
        Region.Tr,
        Locale.Tr
      );
      expect(resp).not.toBeEmpty();
      validateCollectionDetail(resp);
    });

    test("GetAllCollections", async () => {
      const resp = await client.getAllCollections(Region.Tr, Locale.Tr);
      expect(resp).not.toBeEmpty();

      const firstCollection = resp[0];
      validateCollection(firstCollection);
    });

    test("GetCollectionDetails", async () => {
      const resp = await client.getThemeDetail(
        "620f455a0187ade00bb0d55f",
        Region.Tr,
        Locale.Tr
      );
      expect(resp).not.toBeEmpty();
      validateCollectionDetail(resp);
    });

    test("GetAggregateGraph", async () => {
      const resp = await client.getAggregateGraph(
        AggregateGraphPeriod.OneYear,
        "65533e047844ee7afe9941b9",
        "65533e441fa5c7b58afa0944",
        "",
        Region.Tr
      );

      expect(resp).not.toBeNull();
      expect(resp.previous_close).toBeDefined();
      expect(resp.graph).toBeDefined();
      expect(resp.graph).toBeInstanceOf(Array);

      if (resp.graph.length > 0) {
        const firstDataPoint = resp.graph[0];
        expect(firstDataPoint.d).toBeDefined();
        expect(firstDataPoint.o).toBeDefined();
        expect(firstDataPoint.h).toBeDefined();
        expect(firstDataPoint.l).toBeDefined();
        expect(firstDataPoint.c).toBeDefined();
        expect(typeof firstDataPoint.d).toBe("number");
        expect(typeof firstDataPoint.o).toBe("number");
        expect(typeof firstDataPoint.h).toBe("number");
        expect(typeof firstDataPoint.l).toBe("number");
        expect(typeof firstDataPoint.c).toBe("number");
      }
    });
  });

  describe("Mock Tests", () => {
    let client: CollectionClient;
    let cli: { request: jest.Mock };

    const region = Region.Tr;
    const locale = Locale.Tr;

    beforeEach(() => {
      cli = { request: jest.fn() };

      const config = (global as any).testSuite.config as LaplaceConfiguration;
      const logger: Logger = {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn(),
        debug: jest.fn(),
      } as unknown as Logger;

      client = new CollectionClient(config, logger, cli as any);
    });

    describe("getAllIndustries", () => {
      test("calls correct endpoint/params and matches raw list", async () => {
        cli.request.mockResolvedValueOnce({ data: mockIndustryList });

        const resp = await client.getAllIndustries(region, locale);

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/industry");
        expect(call.params).toEqual({ region, locale });

        expect(resp).toHaveLength(1);
        const item = resp[0];
        expect(item.id).toBe("65533e441fa5c7b58afa097b");
        expect(item.title).toBe("Kimyasal (Çeşitlendirilmiş)");
        expect(item.imageUrl).toBe(
          "https://finfree-storage.s3.amazonaws.com/collection-images/chemical-diversified.webp"
        );
        expect(item.avatarUrl).toBe(
          "https://finfree-storage.s3.amazonaws.com/collection-images/chemical-diversified_avatar.webp"
        );
        expect(item.numStocks).toBe(1);

        expect((item as any).region).toBeUndefined();
        expect((item as any).assetClass).toBeUndefined();
        expect((item as any).order).toBeUndefined();
      });
    });

    describe("getIndustryDetail", () => {
      test("calls correct endpoint/params and matches raw detail", async () => {
        cli.request.mockResolvedValueOnce({ data: mockIndustryDetail });

        const resp = await client.getIndustryDetail(
          "65533e441fa5c7b58afa0944",
          region,
          locale
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/industry/65533e441fa5c7b58afa0944");
        expect(call.params).toEqual({ region, locale });

        expect(resp.id).toBe("65533e441fa5c7b58afa0944");
        expect(resp.title).toBe("Perakende (Özel Hatlar)");
        expect(resp.region).toEqual(["us", "tr"]);
        expect(resp.imageUrl).toBe(
          "https://finfree-storage.s3.amazonaws.com/collection-images/retail-special-lines.webp"
        );
        expect(resp.avatarUrl).toBe(
          "https://finfree-storage.s3.amazonaws.com/collection-images/retail-special-lines_avatar.webp"
        );
        expect(resp.numStocks).toBe(59);
        expect(resp.order).toBe(0);

        // stocks
        expect(resp.stocks).toHaveLength(1);
        const s = resp.stocks[0];
        expect(s.id).toBe("61dd0d850ec2114146343053");
        expect((s as any).assetType).toBe("stock");
        expect(s.name).toBe("Teknosa");
        expect(s.symbol).toBe("TKNSA");
        expect(s.sectorId).toBe("65533e047844ee7afe9941b9");
        expect(s.industryId).toBe("65533e441fa5c7b58afa0944");
        expect(s.updatedDate).toBe("2025-07-02T00:00:00.426Z");
        expect(s.active).toBe(true);
      });
    });

    describe("getAllSectors", () => {
      test("calls correct endpoint/params and matches raw list", async () => {
        cli.request.mockResolvedValueOnce({ data: mockSectorsList });

        const resp = await client.getAllSectors(region, locale);

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/sector");
        expect(call.params).toEqual({ region, locale });

        expect(resp).toHaveLength(1);
        const item = resp[0];
        expect(item.id).toBe("65533e047844ee7afe9941bf");
        expect(item.title).toBe("Teknoloji");
        expect(item.imageUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/informationtechnology-stocks_original.webp"
        );
        expect(item.avatarUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/informationtechnology-stocks_avatar.webp"
        );
        expect(item.numStocks).toBe(47);

        expect((item as any).region).toBeUndefined();
        expect((item as any).assetClass).toBeUndefined();
        expect((item as any).order).toBeUndefined();
      });
    });

    describe("getSectorDetail", () => {
      test("calls correct endpoint/params and matches raw detail", async () => {
        cli.request.mockResolvedValueOnce({ data: mockSectorDetail });

        const resp = await client.getSectorDetail(
          "65533e047844ee7afe9941b9",
          region,
          locale
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/sector/65533e047844ee7afe9941b9");
        expect(call.params).toEqual({ region, locale });

        expect(resp.id).toBe("65533e047844ee7afe9941b9");
        expect(resp.title).toBe("Tüketici Döngüsel");
        expect(resp.region).toEqual(["us", "tr"]);
        expect(resp.imageUrl).toBe(
          "https://finfree-storage.s3.amazonaws.com/collection-images/consumer-cyclical.webp"
        );
        expect(resp.avatarUrl).toBe(
          "https://finfree-storage.s3.amazonaws.com/collection-images/consumer-cyclical_avatar.webp"
        );
        expect(resp.numStocks).toBe(798);
        expect(resp.order).toBe(0);

        expect(resp.stocks).toHaveLength(1);
        const s = resp.stocks[0];
        expect(s.id).toBe("61dd0d420ec2114146342f2d");
        expect((s as any).assetType).toBe("stock");
        expect(s.name).toBe("Tek-Art İnşaat");
        expect(s.symbol).toBe("TEKTU");
        expect(s.sectorId).toBe("65533e047844ee7afe9941b9");
        expect(s.industryId).toBe("65533e441fa5c7b58afa093b");
        expect(s.updatedDate).toBe("2022-01-11T04:53:22.944Z");
        expect(s.active).toBe(true);
      });
    });

    describe("getAllThemes", () => {
      test("calls correct endpoint/params and matches raw list", async () => {
        cli.request.mockResolvedValueOnce({ data: mockThemesList });

        const resp = await client.getAllThemes(region, locale);

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/theme");
        expect(call.params).toEqual({ region, locale });

        expect(resp).toHaveLength(1);
        const item = resp[0];
        expect(item.id).toBe("6256b0647d0bb100123effa7");
        expect(item.title).toBe("İhracat Şampiyonları");
        expect(item.region).toEqual(["tr"]);
        expect(item.imageUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/ihracat-sampiyonlari_original.webp"
        );
        expect(item.avatarUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/ihracat-sampiyonlari_avatar.webp"
        );
        expect(item.numStocks).toBe(15);
        expect(item.assetClass).toBe("equity");
      });
    });

    describe("getThemeDetail", () => {
      test("calls correct endpoint/params and matches raw detail", async () => {
        cli.request.mockResolvedValueOnce({ data: mockThemeDetail });

        const resp = await client.getThemeDetail(
          "6256b0647d0bb100123effa7",
          region,
          locale
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/theme/6256b0647d0bb100123effa7");
        expect(call.params).toEqual({ region, locale });

        expect(resp.id).toBe("6256b0647d0bb100123effa7");
        expect(resp.title).toBe("İhracat Şampiyonları");
        expect(resp.region).toEqual(["tr"]);
        expect(resp.imageUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/ihracat-sampiyonlari_original.webp"
        );
        expect(resp.avatarUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/ihracat-sampiyonlari_avatar.webp"
        );
        expect(resp.numStocks).toBe(15);
        expect(resp.assetClass).toBe("equity");
        expect(resp.image).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/themes/tr/ihracat_sampiyonlari.png"
        );
        expect(resp.order).toBe(0);

        expect(resp.stocks).toHaveLength(1);
        const s = resp.stocks[0];
        expect(s.id).toBe("61dd0d4b0ec2114146342f69");
        expect((s as any).assetType).toBe("stock");
        expect(s.name).toBe("Şişe ve Cam Fabrikaları");
        expect(s.symbol).toBe("SISE");
        expect(s.sectorId).toBe("65533e047844ee7afe9941be");
        expect(s.industryId).toBe("65533e441fa5c7b58afa0956");
        expect(s.updatedDate).toBe("2025-04-01T00:00:00.533Z");
        expect(s.active).toBe(true);
      });
    });

    describe("getAllCollections", () => {
      test("calls correct endpoint/params and matches raw list", async () => {
        cli.request.mockResolvedValueOnce({ data: mockCollectionList });

        const resp = await client.getAllCollections(region, locale);

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/collection");
        expect(call.params).toEqual({ region, locale });

        expect(resp).toHaveLength(1);
        const item = resp[0];
        expect(item.id).toBe("620f455a0187ade00bb0d55f");
        expect(item.title).toBe("En Büyükler");
        expect(item.region).toEqual(["tr"]);
        expect(item.imageUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/en-buyukler_original.webp"
        );
        expect(item.avatarUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/en-buyukler_avatar.webp"
        );
        expect(item.numStocks).toBe(10);
        expect(item.assetClass).toBe("equity");
        expect(item.order).toBe(0);
      });
    });

    describe("getCollectionDetail", () => {
      test("calls correct endpoint/params and matches raw detail", async () => {
        cli.request.mockResolvedValueOnce({ data: mockCollectionDetail });

        const resp = await client.getCollectionDetail(
          "620f455a0187ade00bb0d55f",
          region,
          locale
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];
        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/collection/620f455a0187ade00bb0d55f");
        expect(call.params).toEqual({ region, locale });

        expect(resp.id).toBe("620f455a0187ade00bb0d55f");
        expect(resp.title).toBe("En Büyükler");
        expect(resp.region).toEqual(["tr"]);
        expect(resp.imageUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/en-buyukler_original.webp"
        );
        expect(resp.avatarUrl).toBe(
          "https://finfree-storage.s3.eu-central-1.amazonaws.com/collection-images/en-buyukler_avatar.webp"
        );
        expect(resp.numStocks).toBe(10);
        expect(resp.assetClass).toBe("equity");
        expect(resp.order).toBe(0);

        expect(resp.stocks).toHaveLength(1);
        const s = resp.stocks[0];
        expect(s.id).toBe("61dd0d670ec2114146342fa5");
        expect((s as any).assetType).toBe("stock");
        expect(s.name).toBe("SASA Polyester");
        expect(s.symbol).toBe("SASA");
        expect(s.sectorId).toBe("65533e047844ee7afe9941c0");
        expect(s.industryId).toBe("65533e441fa5c7b58afa097a");
        expect(s.updatedDate).toBe("2025-08-05T14:53:59.57Z");
        expect(s.active).toBe(true);
      });
    });
    describe("getAggregateGraph", () => {
      test("calls correct endpoint/params and matches raw graph response", async () => {
        cli.request.mockResolvedValueOnce({ data: mockCollectionPriceGraph });

        const resp = await client.getAggregateGraph(
          AggregateGraphPeriod.OneYear,
          "65533e047844ee7afe9941b9", // sectorId
          "65533e441fa5c7b58afa0944", // industryId
          "", // collectionId
          Region.Tr
        );

        expect(cli.request).toHaveBeenCalledTimes(1);
        const call = cli.request.mock.calls[0][0];

        expect(call.method).toBe("GET");
        expect(call.url).toBe("/api/v1/aggregate/graph");
        expect(call.params).toEqual({
          period: AggregateGraphPeriod.OneYear,
          sectorId: "65533e047844ee7afe9941b9",
          industryId: "65533e441fa5c7b58afa0944",
          collectionId: "",
          region: Region.Tr,
        });

        expect(resp.previous_close).toBe(98.5);
        expect(resp.graph).toHaveLength(3);

        expect(resp.graph[0].d).toBe(1710403200000);
        expect(resp.graph[0].o).toBe(100.5);
        expect(resp.graph[0].h).toBe(105.2);
        expect(resp.graph[0].l).toBe(99.8);
        expect(resp.graph[0].c).toBe(103.7);

        expect(resp.graph[1].d).toBe(1710489600000);
        expect(resp.graph[1].o).toBe(103.7);
        expect(resp.graph[1].h).toBe(107.1);
        expect(resp.graph[1].l).toBe(102.3);
        expect(resp.graph[1].c).toBe(106.4);

        expect(resp.graph[2].d).toBe(1710576000000);
        expect(resp.graph[2].o).toBe(106.4);
        expect(resp.graph[2].h).toBe(108.9);
        expect(resp.graph[2].l).toBe(105.1);
        expect(resp.graph[2].c).toBe(107.8);
      });

      test("bubbles up request error", async () => {
        cli.request.mockRejectedValueOnce(new Error("Invalid parameters"));

        await expect(
          client.getAggregateGraph(
            AggregateGraphPeriod.OneMonth,
            "",
            "",
            "collection1",
            Region.Tr
          )
        ).rejects.toThrow("Invalid parameters");
      });
    });
  });
});
