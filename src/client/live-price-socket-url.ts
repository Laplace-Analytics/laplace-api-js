import { Client } from "./client";
import { Region } from "./collections";

interface WebSocketUrlResponse {
  url: string;
}

export class LivePriceWebSocketUrlClient extends Client {
  async getWebSocketUrl(
    externalUserId: string,
    region: Region
  ): Promise<string> {
    const url = new URL(`${this["baseUrl"]}/api/v1/ws/url`);
    url.searchParams.append("region", region);
    url.searchParams.append("accessLevel", "KRMD1");

    const response = await this.sendRequest<WebSocketUrlResponse>({
      method: "POST",
      url: url.toString(),
      data: {
        externalUserId: externalUserId,
      },
    });

    return response.url;
  }
}