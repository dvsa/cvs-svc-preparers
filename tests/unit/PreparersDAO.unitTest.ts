import { mockClient } from 'aws-sdk-client-mock';
import HTTPError from '../../src/models/HTTPError';
import PreparerDAO from '../../src/models/PreparersDAO';
import {
  DynamoDBDocumentClient,
  ScanCommand,
  ScanCommandOutput,
  BatchWriteCommand,
  BatchWriteCommandOutput
} from '@aws-sdk/lib-dynamodb';

const client = mockClient(DynamoDBDocumentClient);

describe('Preparers DAO', () => {
  afterAll(() => {
    jest.resetModules();
  });
  context('getAll', () => {
    beforeEach(() => {
      client.reset();
    });

    it('returns data on successful query', async () => {
      client.on(ScanCommand).resolves('success' as unknown as ScanCommandOutput);
      const dao = new PreparerDAO();
      const output = await dao.getAll();
      expect(output).toEqual('success');
    });

    it('returns error on failed query', async () => {
      const myError = new HTTPError(418, 'It broke');
      client.on(ScanCommand).resolves(myError as unknown as ScanCommandOutput);
      const dao = new PreparerDAO();
      const output = await dao.getAll();
      expect(output).toEqual(myError);
    });
  });

  context('createMultiple', () => {
    beforeEach(() => {
      client.reset();
    });

    it('builds correct query and returns data on successful query', async () => {
      client.on(BatchWriteCommand).resolves('success' as unknown as BatchWriteCommandOutput);
      const dao = new PreparerDAO();
      const output = await dao.createMultiple([{ item: 'testItem' }]);
      expect(output).toEqual('success');
    });
    it('returns error on failed query', async () => {
      const myError = new HTTPError(418, 'It broke');
      client.on(BatchWriteCommand).rejects(myError as unknown as BatchWriteCommandOutput);
      const dao = new PreparerDAO();
      try {
        expect(await dao.createMultiple(['testItem'])).toThrowError();
      } catch (err) {
        expect(err).toEqual(myError);
      }
    });
  });

  context('deleteMultiple', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('builds correct query and returns data on successful query', async () => {
      client.on(BatchWriteCommand).resolves('success' as unknown as BatchWriteCommandOutput);
      const dao = new PreparerDAO();
      const output = await dao.deleteMultiple(['testItem']);
      expect(output).toEqual('success');
    });

    it('returns error on failed query', async () => {
      const myError = new HTTPError(418, 'It broke');
      client.on(BatchWriteCommand).rejects(myError as unknown as BatchWriteCommandOutput);
      const dao = new PreparerDAO();
      try {
        expect(await dao.deleteMultiple(['testItem'])).toThrowError();
      } catch (err) {
        expect(err).toEqual(myError);
      }
    });
  });
});

const getRequestItemsBodyFromStub = (input: any) => {
  const requestItems = input.RequestItems;
  const table = Object.keys(requestItems)[0];
  return requestItems[table];
};

// function mockDocumentClientWithReturn(method: "batchWrite" | "scan", retVal: any) {
//     const myStub = sinon.stub().callsFake(() => {
//         return {
//             promise: sinon.fake.resolves(retVal)
//         };
//     });
//     sandbox.replace(AWS.DynamoDB.DocumentClient.prototype, method, myStub);
//     return myStub;
// }
// function mockDocumentClientWithReject(method: "batchWrite" | "scan", retVal: any) {
//     const myStub = sinon.stub().callsFake(() => {
//         return {
//             promise: sinon.fake.rejects(retVal)
//         };
//     });
//     sandbox.replace(AWS.DynamoDB.DocumentClient.prototype, method, myStub);
//     return myStub;
// }
