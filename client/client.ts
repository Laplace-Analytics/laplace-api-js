import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { Logger } from 'winston';
import { LaplaceConfiguration } from '../utilities/configuration';

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
}

export function createClient(cfg: LaplaceConfiguration, logger: Logger): Client {
  return new Client(cfg, logger);
}