import { Configuration } from '../../src/utils/Configuration';
import { IDBConfig } from '../../src/models';
import { ERRORS } from '../../src/assets/Enums';

describe('ConfigurationUtil', () => {
  const branch = process.env.BRANCH;
  context('when calling getConfig', () => {
    it('returns the full config object', () => {
      const conf = Configuration.getInstance().getConfig();
      expect(conf).toHaveProperty('dynamodb');
      expect(conf.dynamodb).toHaveProperty('local');
      expect(conf.dynamodb).toHaveProperty('local-global');
      expect(conf.dynamodb).toHaveProperty('remote');
    });
  });

  context('when calling the getDynamoDBConfig()', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    context('the config is empty', () => {
      process.env.BRANCH = 'local';
      const emptyConfig: Configuration = new Configuration(
        '../../tests/resources/EmptyConfig.yml'
      );
      it('should throw error', () => {
        try {
          expect(emptyConfig.getDynamoDBConfig()).toThrowError();
        } catch (e) {
          expect(e.message).toEqual(ERRORS.DynamoDBConfigNotDefined);
        }
      });
    });
    context('the BRANCH environment variable is local', () => {
      process.env.BRANCH = 'local';
      const dbConfig: IDBConfig = Configuration.getInstance().getDynamoDBConfig();
      it('should return the local invoke config', () => {
        expect(dbConfig).toHaveProperty('params');
        expect(dbConfig).toHaveProperty('table');
        expect(dbConfig.table).toEqual('cvs-local-preparers');
      });
    });

    context('the BRANCH environment variable is local', () => {
      process.env.BRANCH = 'local-global';
      const dbConfig: IDBConfig = Configuration.getInstance().getDynamoDBConfig();
      it('should return the local invoke config', () => {
        expect(dbConfig).toHaveProperty('params');
        expect(dbConfig).toHaveProperty('table');
        expect(dbConfig).not.toHaveProperty('keys');
        expect(dbConfig.table).toEqual('cvs-local-global-preparers');
        expect(dbConfig.params).toHaveProperty('region');
        expect(dbConfig.params).toHaveProperty('endpoint');
      });
    });

    context("the BRANCH environment variable is 'develop'", () => {
      it('should return the remote invoke config', () => {
        process.env.BRANCH = 'develop';
        // Switch to mockedConfig to simplify environment mocking
        const dbConfig: IDBConfig = getMockedConfig().getDynamoDBConfig();
        expect(dbConfig).toHaveProperty('params');
        expect(dbConfig).toHaveProperty('table');
        expect(dbConfig).not.toHaveProperty('keys');
        expect(dbConfig.table).toEqual('cvs-develop-preparers');
        expect(dbConfig.params).toStrictEqual({});
      });
    });

    context('the BRANCH environment variable is not defined', () => {
      it('should throw error', () => {
        process.env.BRANCH = '';
        try {
          expect(getMockedConfig().getDynamoDBConfig()).toThrowError();
        } catch (e) {
          expect(e.message).toEqual(ERRORS.NoBranch);
        }
      });
    });
  });

  afterAll(() => {
    process.env.BRANCH = branch;
  });
});

/**
 * Configuration does the token replacement for ${BRANCH} on instantiation, so in order to
 * catch this early enough, need to use jest.resetModules() and a "require" import
 * of Configuration again
 */
const getMockedConfig: () => Configuration = () => {
  jest.resetModules();
  const ConfImp = require('../../src/utils/Configuration');
  return ConfImp.Configuration.getInstance();
};
