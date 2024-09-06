import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { EventSourcePolyfill } from 'event-source-polyfill';


export class Client {
  private cli: AxiosInstance;
  private baseUrl: string;
  private apiKey: string;
  private logger: Logger;

  constructor(cfg: LaplaceConfiguration, logger: Logger) {
    this.cli = axios.create();
    this.baseUrl = cfg.baseURL;
    this.apiKey = cfg.apiKey;
    this.logger = logger;
  }

  async sendRequest<T>(config: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.cli.request<T>({
        ...config,
        baseURL: this.baseUrl,
        headers: {
          ...config.headers,
          Authorization: `Bearer ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        throw new Error(`Unexpected status code: ${error.response.status}, body: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  sendSSERequest<T>(url: string): { events: AsyncIterable<T>, cancel: () => void } {
    const eventSource = new EventSourcePolyfill(url, {
      headers: {
        Accept: 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
        Authorization: `Bearer ${this.apiKey}`,
      },
    });

    const events: AsyncIterable<T> = {
      async *[Symbol.asyncIterator]() {
        try {
          while (true) {
            yield await new Promise<T>((resolve, reject) => {
              eventSource.onmessage = (event) => {
                try {
                  const data = JSON.parse(event.data);
                  resolve(data);
                } catch (error) {
                  reject(new Error(`Error parsing event data: ${error}`));
                }
              };

              eventSource.onerror = (event) => {
                reject(new Error(`SSE error: ${JSON.stringify(event)}`));
              };
            });
          }
        } finally {
          eventSource.close();
        }
      },
    };

    const cancel = () => {
      eventSource.close();
    };

    return { events, cancel };
  }
}

export function createClient(cfg: LaplaceConfiguration, logger: Logger): Client {
  return new Client(cfg, logger);
}