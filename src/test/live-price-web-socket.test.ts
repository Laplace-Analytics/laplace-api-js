import {
  LivePriceFeed,
  LivePriceWebSocketClient,
  WebSocketServerErrorCode,
} from "../client/live-price-web-socket";

type Handler = ((event: { data?: string }) => void) | null;

class FakeWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;
  static sockets: FakeWebSocket[] = [];

  readyState = FakeWebSocket.CONNECTING;
  sent: unknown[] = [];
  onopen: Handler = null;
  onclose: Handler = null;
  onerror: Handler = null;
  onmessage: Handler = null;

  constructor(public url: string) {
    FakeWebSocket.sockets.push(this);
  }

  send(data: string) {
    this.sent.push(JSON.parse(data));
  }

  open() {
    this.readyState = FakeWebSocket.OPEN;
    this.onopen?.({});
  }

  receive(message: object) {
    this.onmessage?.({ data: JSON.stringify(message) });
  }

  close() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onclose?.({});
  }

  // The connection attempt fails before it opens.
  fail() {
    this.readyState = FakeWebSocket.CLOSED;
    this.onerror?.({});
    this.onclose?.({});
  }
}

const expiredLinkError = {
  type: "error",
  errorCode: "connection_expired",
  message: "Connection link has expired, please request a new one",
};

const priceUpdate = (symbol: string) => ({
  type: "data",
  feed: LivePriceFeed.LiveBist,
  message: { symbol, cl: 10, d: 1, c: 0.5 },
});

describe("LivePriceWebSocketClient", () => {
  const realWebSocket = global.WebSocket;
  let client: LivePriceWebSocketClient;

  async function connect(url: string) {
    const connecting = client.connect(url);
    FakeWebSocket.sockets[FakeWebSocket.sockets.length - 1].open();
    await connecting;
  }

  beforeEach(() => {
    jest.useFakeTimers();
    (global as any).WebSocket = FakeWebSocket;
    client = new LivePriceWebSocketClient({ enableLogging: false });
  });

  afterEach(async () => {
    await client.close();
    FakeWebSocket.sockets = [];
    (global as any).WebSocket = realWebSocket;
    jest.useRealTimers();
  });

  describe("connect", () => {
    it("reconnects after a drop when the client was closed and connected again", async () => {
      await connect("wss://link");
      await client.close();
      await connect("wss://link");

      FakeWebSocket.sockets[1].close();
      await jest.advanceTimersByTimeAsync(5000);

      expect(FakeWebSocket.sockets).toHaveLength(3);
    });
  });

  describe("onError", () => {
    it("passes server error messages with their code to the handler", async () => {
      const handler = jest.fn();
      client.onError(handler);
      await connect("wss://link");

      FakeWebSocket.sockets[0].receive(expiredLinkError);

      expect(handler).toHaveBeenCalledWith({
        errorCode: WebSocketServerErrorCode.ConnectionExpired,
        message: expiredLinkError.message,
      });
    });

    it("stops calling the handler once it is removed", async () => {
      const handler = jest.fn();
      const removeHandler = client.onError(handler);
      await connect("wss://link");

      removeHandler();
      FakeWebSocket.sockets[0].receive(expiredLinkError);

      expect(handler).not.toHaveBeenCalled();
    });

    it("is not called for other messages", async () => {
      const handler = jest.fn();
      client.onError(handler);
      await connect("wss://link");

      FakeWebSocket.sockets[0].receive({ type: "heartbeat" });
      FakeWebSocket.sockets[0].receive({ type: "warning", message: "slow down" });

      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe("handlers", () => {
    const failing = () => {
      throw new Error("handler bug");
    };

    it("keeps calling the other error handlers when one throws or rejects", async () => {
      const consoleError = jest.spyOn(console, "error").mockImplementation(() => {});
      client = new LivePriceWebSocketClient({ enableLogging: true });
      const handler = jest.fn();
      client.onError(failing);
      client.onError(async () => {
        throw new Error("async handler bug");
      });
      client.onError(handler);
      await connect("wss://link");

      FakeWebSocket.sockets[0].receive(expiredLinkError);
      await jest.advanceTimersByTimeAsync(0);

      expect(handler).toHaveBeenCalledTimes(1);
      const logged = consoleError.mock.calls.map(([message]) => message);
      expect(logged.filter((m) => m.includes("Handler failed"))).toHaveLength(2);
      expect(logged.some((m) => m.includes("Failed to parse"))).toBe(false);
      consoleError.mockRestore();
    });

    it("keeps delivering prices to the other subscribers when one throws", async () => {
      const handler = jest.fn();
      await connect("wss://link");
      client.subscribe(["THYAO"], LivePriceFeed.LiveBist, failing);
      client.subscribe(["THYAO"], LivePriceFeed.LiveBist, handler);

      FakeWebSocket.sockets[0].receive(priceUpdate("THYAO"));

      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ symbol: "THYAO" }));
    });

    it("finishes subscribing when the last price sent to a new handler throws", async () => {
      await connect("wss://link");
      client.subscribe(["THYAO"], LivePriceFeed.LiveBist, () => {});
      FakeWebSocket.sockets[0].receive(priceUpdate("THYAO"));

      const unsubscribe = client.subscribe(["THYAO", "GARAN"], LivePriceFeed.LiveBist, failing);

      expect(typeof unsubscribe).toBe("function");
      expect(FakeWebSocket.sockets[0].sent).toContainEqual({
        type: "subscribe",
        symbols: ["GARAN"],
        feed: LivePriceFeed.LiveBist,
      });
    });
  });

  describe("reconnectWithUrl", () => {
    it("closes an open socket on the old link and reconnects with the new one", async () => {
      await connect("wss://old-link");
      client.subscribe(["THYAO"], LivePriceFeed.LiveBist, () => {});

      client.reconnectWithUrl("wss://new-link");
      expect(FakeWebSocket.sockets[0].readyState).toBe(FakeWebSocket.CLOSED);
      await jest.advanceTimersByTimeAsync(5000);

      const reconnected = FakeWebSocket.sockets[1];
      expect(reconnected.url).toBe("wss://new-link");
      reconnected.open();
      await jest.advanceTimersByTimeAsync(0);
      expect(reconnected.sent).toContainEqual({
        type: "subscribe",
        symbols: ["THYAO"],
        feed: LivePriceFeed.LiveBist,
      });
    });

    it("starts again with the new link after the client stopped reconnecting", async () => {
      client = new LivePriceWebSocketClient({ enableLogging: false, reconnectAttempts: 1 });
      await connect("wss://old-link");
      FakeWebSocket.sockets[0].close();
      await jest.advanceTimersByTimeAsync(5000);
      FakeWebSocket.sockets[1].fail();
      await jest.advanceTimersByTimeAsync(60000);
      expect(FakeWebSocket.sockets).toHaveLength(2);

      client.reconnectWithUrl("wss://new-link");
      await jest.advanceTimersByTimeAsync(5000);

      expect(FakeWebSocket.sockets).toHaveLength(3);
      expect(FakeWebSocket.sockets[2].url).toBe("wss://new-link");
    });

    it("reconnects with the new link and resends subscriptions", async () => {
      await connect("wss://expired-link");
      client.subscribe(["THYAO"], LivePriceFeed.LiveBist, () => {});

      FakeWebSocket.sockets[0].close();
      client.reconnectWithUrl("wss://new-link");
      await jest.advanceTimersByTimeAsync(5000);

      const reconnected = FakeWebSocket.sockets[1];
      expect(reconnected.url).toBe("wss://new-link");

      reconnected.open();
      await jest.advanceTimersByTimeAsync(0);
      expect(reconnected.sent).toContainEqual({
        type: "subscribe",
        symbols: ["THYAO"],
        feed: LivePriceFeed.LiveBist,
      });
    });
  });

  describe("back/forward cache", () => {
    const pageEvent = (type: "pagehide" | "pageshow", persisted: boolean) =>
      Object.assign(new Event(type), { persisted });

    beforeEach(() => {
      (global as any).window = new EventTarget();
    });

    afterEach(async () => {
      await client.close();
      delete (global as any).window;
    });

    it("closes the socket when the page is cached and keeps it closed while cached", async () => {
      await connect("wss://link");
      client.subscribe(["THYAO"], LivePriceFeed.LiveBist, () => {});

      window.dispatchEvent(pageEvent("pagehide", true));
      await jest.advanceTimersByTimeAsync(60000);

      expect(FakeWebSocket.sockets[0].readyState).toBe(FakeWebSocket.CLOSED);
      expect(FakeWebSocket.sockets).toHaveLength(1);
    });

    it("reconnects and resends subscriptions when the page is restored", async () => {
      await connect("wss://link");
      client.subscribe(["THYAO"], LivePriceFeed.LiveBist, () => {});
      window.dispatchEvent(pageEvent("pagehide", true));

      window.dispatchEvent(pageEvent("pageshow", true));

      const reconnected = FakeWebSocket.sockets[1];
      expect(reconnected.url).toBe("wss://link");
      reconnected.open();
      await jest.advanceTimersByTimeAsync(0);
      expect(reconnected.sent).toContainEqual({
        type: "subscribe",
        symbols: ["THYAO"],
        feed: LivePriceFeed.LiveBist,
      });
    });

    it("holds a pending reconnect while cached and reconnects when restored", async () => {
      await connect("wss://link");
      FakeWebSocket.sockets[0].close();

      window.dispatchEvent(pageEvent("pagehide", true));
      await jest.advanceTimersByTimeAsync(60000);
      expect(FakeWebSocket.sockets).toHaveLength(1);

      window.dispatchEvent(pageEvent("pageshow", true));
      expect(FakeWebSocket.sockets).toHaveLength(2);
    });

    it("closes a socket that is still connecting and connects once again when restored", async () => {
      let connectSettled = false;
      client.connect("wss://link").then(
        () => (connectSettled = true),
        () => (connectSettled = true)
      );
      client.subscribe(["THYAO"], LivePriceFeed.LiveBist, () => {});

      window.dispatchEvent(pageEvent("pagehide", true));
      await jest.advanceTimersByTimeAsync(60000);

      expect(FakeWebSocket.sockets[0].readyState).toBe(FakeWebSocket.CLOSED);
      expect(FakeWebSocket.sockets).toHaveLength(1);
      expect(connectSettled).toBe(false);

      window.dispatchEvent(pageEvent("pageshow", true));
      const reconnected = FakeWebSocket.sockets[1];
      reconnected.open();
      await jest.advanceTimersByTimeAsync(0);

      expect(FakeWebSocket.sockets).toHaveLength(2);
      expect(reconnected.sent).toEqual([
        { type: "subscribe", symbols: ["THYAO"], feed: LivePriceFeed.LiveBist },
      ]);
    });

    it("closes the socket on pagehide even when the page is not going to be cached", async () => {
      await connect("wss://link");

      window.dispatchEvent(pageEvent("pagehide", false));

      expect(FakeWebSocket.sockets[0].readyState).toBe(FakeWebSocket.CLOSED);
    });

    it("does not reconnect on restore once the client was closed", async () => {
      await connect("wss://link");
      window.dispatchEvent(pageEvent("pagehide", true));
      await client.close();

      window.dispatchEvent(pageEvent("pageshow", true));

      expect(FakeWebSocket.sockets).toHaveLength(1);
    });
  });
});
