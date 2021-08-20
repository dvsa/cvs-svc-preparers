import AWS from 'aws-sdk';
import PreparerDAO from '../../src/models/PreparersDAO';
import HTTPError from '../../src/models/HTTPError';
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client';

describe('Preparers DAO', () => {
  afterAll(() => {
    jest.resetModules();
  });
  context('getAll', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('returns data on successful query', async () => {
      AWS.DynamoDB.DocumentClient.prototype.scan = jest
        .fn()
        .mockImplementation((params: DocumentClient.ScanInput) => {
          return {
            promise: () => Promise.resolve('success')
          };
        });
      const dao = new PreparerDAO();
      const output = await dao.getAll();
      expect(output).toEqual('success');
    });

    it('returns error on failed query', async () => {
      const myError = new HTTPError(418, 'It broke');
      AWS.DynamoDB.DocumentClient.prototype.scan = jest
        .fn()
        .mockImplementation((params: DocumentClient.ScanInput) => {
          return {
            promise: () => Promise.resolve(myError)
          };
        });
      const dao = new PreparerDAO();
      const output = await dao.getAll();
      expect(output).toEqual(myError);
    });
  });

  context('createMultiple', () => {
    beforeEach(() => {
      jest.resetModules();
    });

    it('builds correct query and returns data on successful query', async () => {
      let stub = null;
      AWS.DynamoDB.DocumentClient.prototype.batchWrite = jest
        .fn()
        .mockImplementation((params: DocumentClient.ScanInput) => {
          return {
            promise: () => {
              stub = params;
              return Promise.resolve('success');
            }
          };
        });
      const expectedParams = [
        {
          PutRequest: {
            Item: { item: 'testItem' }
          }
        }
      ];
      const dao = new PreparerDAO();
      const output = await dao.createMultiple([{ item: 'testItem' }]);
      expect(output).toEqual('success');
      expect(getRequestItemsBodyFromStub(stub)).toStrictEqual(expectedParams);
    });

    it('returns error on failed query', async () => {
      const myError = new HTTPError(418, 'It broke');
      let stub = null;
      AWS.DynamoDB.DocumentClient.prototype.batchWrite = jest
        .fn()
        .mockImplementation((params: DocumentClient.ScanInput) => {
          return {
            promise: () => {
              stub = params;
              return Promise.reject(myError);
            }
          };
        });
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
      // const stub = mockDocumentClientWithReturn("batchWrite", "success");
      let stub = null;
      AWS.DynamoDB.DocumentClient.prototype.batchWrite = jest
        .fn()
        .mockImplementation((params: DocumentClient.ScanInput) => {
          return {
            promise: () => {
              stub = params;
              return Promise.resolve('success');
            }
          };
        });
      const expectedParams = [
        {
          DeleteRequest: {
            Key: {
              preparerId: 'testItem'
            }
          }
        }
      ];
      const dao = new PreparerDAO();
      const output = await dao.deleteMultiple(['testItem']);
      expect(output).toEqual('success');
      expect(getRequestItemsBodyFromStub(stub)).toStrictEqual(expectedParams);
    });

    it('returns error on failed query', async () => {
      const myError = new HTTPError(418, 'It broke');
      AWS.DynamoDB.DocumentClient.prototype.batchWrite = jest
        .fn()
        .mockImplementation((params: DocumentClient.ScanInput) => {
          return {
            promise: () => Promise.reject(myError)
          };
        });
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
