import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';
import { LaplaceHTTPError, WrapError } from './errors';


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
        const httpError = new LaplaceHTTPError(
          error.response.status,
          JSON.stringify(error.response.data)
        );
        throw WrapError(httpError);
      }
      throw error;
    }
  }

sendSSERequest<T>(url: string): { events: AsyncIterable<T>, cancel: () => void } {
  const source = axios.CancelToken.source();
  var apiKey = this.apiKey;

  const events: AsyncIterable<T> = {
    async *[Symbol.asyncIterator]() {
      try {
        const response = await axios.get(url, {
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
          responseType: 'stream',
          cancelToken: source.token,
        });

        const reader = response.data;
        const decoder = new TextDecoder();

        for await (const chunk of reader) {
          const text = decoder.decode(chunk);
          const lines = text.split('\n').filter(line => line.trim() !== '');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);
              try {
                const parsedData = JSON.parse(data) as T;
                yield parsedData;
              } catch (error) {
                console.error(`Error parsing event data: ${error}`);
              }
            }
          }
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error(`SSE error: ${error}`);
        }
      }
    },
  };

  const cancel = () => {
    source.cancel('Request cancelled by user');
  };

  return { events, cancel };
}
}

export function createClient(cfg: LaplaceConfiguration, logger: Logger): Client {
  return new Client(cfg, logger);
}