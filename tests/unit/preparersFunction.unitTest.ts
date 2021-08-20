import GetPreparersFunction from '../../src/functions/getPreparers';
import PreparersService from '../../src/services/PreparersService';
import HTTPError from '../../src/models/HTTPError';

jest.mock('../../src/services/PreparersService');

describe('getPreparers function', () => {
  context('on successful service call', () => {
    it('should return data from service', async () => {
      const retData = { testData: true };
      PreparersService.prototype.getPreparersList = jest.fn().mockImplementation(() => {
        return Promise.resolve(retData);
      });

      const res = await GetPreparersFunction();
      expect(res.body).toEqual(JSON.stringify(retData));
      expect(res.statusCode).toEqual(200);
    });
  });

  context('on error from service call', () => {
    it('should return data from service', async () => {
      const retData = { testData: true };
      PreparersService.prototype.getPreparersList = jest.fn().mockImplementation(() => {
        return Promise.reject(new HTTPError(418, 'It broke'));
      });

      const res = await GetPreparersFunction();
      expect(res.body).toEqual(JSON.stringify('It broke'));
      expect(res.statusCode).toEqual(418);
    });
  });

  afterAll(() => {
    jest.restoreAllMocks();
  });
});
