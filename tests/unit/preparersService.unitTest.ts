/* global describe context it */
import PreparersService from '../../src/services/PreparersService';
import HTTPError from '../../src/models/HTTPError';
import preparers from '../resources/preparers.json';

describe('getPreparersList', () => {
  describe('when database is on', () => {
    context('database call returns valid data', () => {
      it('should return the expected data', () => {
        const MockPreparersDAO = jest.fn().mockImplementation(() => {
          return {
            getAll: () => {
              return Promise.resolve({ Items: [...preparers], Count: 29, ScannedCount: 29 });
            }
          };
        });
        const preparersService = new PreparersService(new MockPreparersDAO());

        return preparersService.getPreparersList().then((returnedRecords) => {
          expect(returnedRecords).toHaveLength(29);
        });
      });
    });
    context('database call returns empty data', () => {
      it('should return error 404', async () => {
        const MockPreparersDAO = jest.fn().mockImplementation(() => {
          return {
            getAll: () => {
              return Promise.resolve({ Items: [...preparers], Count: 0, ScannedCount: 0 });
            }
          };
        });
        const preparersService = new PreparersService(new MockPreparersDAO());

        try {
          expect(await preparersService.getPreparersList()).toThrowError();
        } catch (errorResponse) {
          expect(errorResponse).toBeInstanceOf(HTTPError);
          expect(errorResponse.statusCode).toEqual(404);
          expect(errorResponse.body).toEqual('No resources match the search criteria.');
        }
      });
    });
  });

  describe('when database is off', () => {
    it('should return error 500', async () => {
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          getAll: () => {
            return Promise.reject({ Items: [...preparers], Count: 29, ScannedCount: 29 });
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      try {
        expect(await preparersService.getPreparersList()).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual('Internal Server Error');
      }
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});

describe('insertPreparerList', () => {
  context('when db does not return response', () => {
    it('should throw 500-Internal Server Error', async () => {
      const mockData = [preparers[0]];
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.reject(new HTTPError(500, 'Internal Server Error'));
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      try {
        expect(await preparersService.insertPreparerList(mockData)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual('Internal Server Error');
      }
    });
  });

  context('when db does not return response OR an error', () => {
    it('should still throw 500-Internal Server Error', async () => {
      const mockData = [preparers[0]];
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.reject();
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      try {
        expect(await preparersService.insertPreparerList(mockData)).toThrowError();
      } catch (errorResponse) {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual('Internal Server Error');
      }
    });
  });

  context('when insert a valid preparers array', () => {
    it('should return 200', () => {
      const mockData = [preparers[0]];
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.resolve({ UnprocessedItems: {} });
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      return preparersService.insertPreparerList(mockData).then((result: any) => {
        expect(Object.keys(result).length).toEqual(0);
        expect(result.constructor).toEqual(Object);
      });
    });
  });

  context('when insert a valid preparers array with unprocessed items', () => {
    it('should return 200', () => {
      const mockData = [preparers[0]];
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.resolve({ UnprocessedItems: [{ failed: 'something' }] });
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      return preparersService.insertPreparerList(mockData).then((result: any) => {
        expect(result.length).toEqual(1);
      });
    });
  });

  context('DAO returns incorrect object', () => {
    it('returns nothing, no error', () => {
      const mockData = [preparers[0]];
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          createMultiple: () => {
            return Promise.resolve({ WrongThing: [{ test: 'rhubarb' }] });
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      return preparersService.insertPreparerList(mockData).then((result: any) => {
        expect(result).toBeUndefined();
      });
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});

describe('deletePreparerList', () => {
  context('when DAO throws an error', () => {
    it('should return 500-Internal Server Error', () => {
      const mockData = [preparers[0].preparerId];
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.reject(new HTTPError(500, 'Internal Server Error'));
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      return preparersService.deletePreparerList(mockData).catch((errorResponse) => {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual('Internal Server Error');
      });
    });
  });

  context('when db throws an error with no body', () => {
    it('should return 500-Internal Server Error', () => {
      const mockData = [preparers[0].preparerId];
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.reject();
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      return preparersService.deletePreparerList(mockData).catch((errorResponse) => {
        expect(errorResponse).toBeInstanceOf(HTTPError);
        expect(errorResponse.statusCode).toEqual(500);
        expect(errorResponse.body).toEqual('Internal Server Error');
      });
    });
  });

  context('when deleting a valid preparers array', () => {
    it('should return 200', () => {
      const mockData = [preparers[0].preparerId];
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.resolve({ UnprocessedItems: {} });
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      return preparersService.deletePreparerList(mockData).then((result: any) => {
        expect(Object.keys(result).length).toEqual(0);
        expect(result.constructor).toEqual(Object);
      });
    });
  });

  context('DAO returns incorrect object', () => {
    it('returns nothing, no error', () => {
      const mockData = [preparers[0].preparerId];
      const MockPreparersDAO = jest.fn().mockImplementation(() => {
        return {
          deleteMultiple: () => {
            return Promise.resolve({ WrongThing: [{ test: 'rhubarb' }] });
          }
        };
      });
      const preparersService = new PreparersService(new MockPreparersDAO());

      return preparersService.deletePreparerList(mockData).then((result: any) => {
        expect(result).toBeUndefined();
      });
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
