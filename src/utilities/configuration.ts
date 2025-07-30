import * as dotenv from "dotenv";
import * as envalid from "envalid";
const { str } = envalid;

export interface LaplaceConfigurationInterface {
  baseURL?: string;
  apiKey: string;
}

export class LaplaceConfiguration implements LaplaceConfigurationInterface {
  baseURL: string;
  apiKey: string;

  constructor({
    baseURL = "https://api.finfree.app",
    apiKey,
  }: LaplaceConfigurationInterface) {
    this.baseURL = baseURL || "https://api.finfree.app";
    this.apiKey = apiKey;
  }

  validate(): null | Error {
    if (!this.apiKey) {
      return new Error("API key is required");
    }

    // Remove baseURL validation since it's now optional
    return null;
  }

  applyDefaults(): null | Error {
    if (!this.baseURL) {
      this.baseURL = "https://api.finfree.app";
    }

    return null;
  }
}

function loadEnvironment(filename?: string): dotenv.DotenvConfigOutput {
  if (filename) {
    return dotenv.config({ path: filename, override: true });
  } else {
    return dotenv.config({ debug: false });
  }
}

type ValidationFunc = (config: LaplaceConfiguration) => null | Error;

function validationFuncRegular(config: LaplaceConfiguration): null | Error {
  return config.validate();
}

export function loadGlobal(
  filename?: string,
  validationFunc: ValidationFunc = validationFuncRegular
): LaplaceConfiguration {
  const envLoadResult = loadEnvironment(filename);
  if (envLoadResult.error) {
    throw envLoadResult.error;
  }

  const env = envalid.cleanEnv(process.env, {
    BASE_URL: str({ default: "https://api.finfree.app" }),
    API_KEY: str(),
  });

  const config = new LaplaceConfiguration({
    baseURL: env.BASE_URL,
    apiKey: env.API_KEY,
  });

  const defaultError = config.applyDefaults();
  if (defaultError) {
    throw defaultError;
  }

  if (validationFunc) {
    const validationError = validationFunc(config);
    if (validationError) {
      throw validationError;
    }
  }

  return config;
}
