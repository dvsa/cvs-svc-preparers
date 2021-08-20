// @ts-ignore
import * as yml from 'node-yaml';
import { IInvokeConfig, IDBConfig } from '../models';
import { ERRORS } from '../assets/Enums';
import { Handler } from 'aws-lambda';

/**
 * Configuration class for retrieving project config
 */

enum HTTPMethods {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  DELETE = 'DELETE'
}

interface IFunctionEvent {
  name: string;
  method: HTTPMethods;
  path: string;
  function: Handler;
}

class Configuration {
  private static instance: Configuration;
  private readonly config: any;

  constructor(configPath: string) {
    if (!process.env.BRANCH) {
      throw new Error(ERRORS.NoBranch);
    }

    const config = yml.readSync(configPath);
    // Replace environment variable references
    let stringifiedConfig: string = JSON.stringify(config);
    const envRegex: RegExp = /\${(\w+\b):?(\w+\b)?}/g;
    const matches: RegExpMatchArray | null = stringifiedConfig.match(envRegex);

    if (matches) {
      matches.forEach((match: string) => {
        envRegex.lastIndex = 0;
        const captureGroups: RegExpExecArray = envRegex.exec(match) as RegExpExecArray;
        // Insert the environment variable if available. If not, insert placeholder. If no placeholder, leave it as is.
        stringifiedConfig = stringifiedConfig.replace(
          match,
          process.env[captureGroups[1]] || captureGroups[2] || captureGroups[1]
        );
      });
    }
    this.config = JSON.parse(stringifiedConfig);
  }

  /**
   * Retrieves the singleton instance of Configuration
   * @returns Configuration
   */
  public static getInstance(): Configuration {
    if (!this.instance) {
      this.instance = new Configuration('../config/config.yml');
    }

    return Configuration.instance;
  }

  /**
   * Retrieves the entire config as an object
   * @returns any
   */
  public getConfig(): any {
    return this.config;
  }

  /**
   * Retrieves the DynamoDB config
   * @returns any
   */
  public getDynamoDBConfig(): IDBConfig {
    if (!this.config.dynamodb) {
      throw new Error(ERRORS.DynamoDBConfigNotDefined);
    }

    // Not defining BRANCH will default to remote
    let env;
    switch (process.env.BRANCH) {
      case 'local':
        env = 'local';
        break;
      case 'local-global':
        env = 'local-global';
        break;
      default:
        env = 'remote';
    }

    return this.config.dynamodb[env];
  }
}

export { Configuration, IFunctionEvent };
