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
}

const expiredLinkError = {
  type: "error",
  errorCode: "connection_expired",
  message: "Connection link has expired, please request a new one",
};

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

  describe("setUrl", () => {
    it("reconnects with the new link and resends subscriptions", async () => {
      await connect("wss://expired-link");
      client.subscribe(["THYAO"], LivePriceFeed.LiveBist, () => {});

      FakeWebSocket.sockets[0].close();
      client.setUrl("wss://new-link");
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
});
