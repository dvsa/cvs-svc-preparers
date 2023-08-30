/* global describe context it before beforeEach after afterEach */
import supertest from 'supertest';
import { emptyDatabase, populateDatabase } from '../util/dbOperations';
import { HTTPRESPONSE } from '../../src/assets/Enums';
import preparersData from '../resources/preparers.json';

const url = 'http://localhost:3003/';
const request = supertest(url);

describe('preparers', () => {
  beforeAll(async () => {
    await emptyDatabase();
  });

  beforeEach(async () => {
    await populateDatabase();
  });

  afterEach(async () => {
    await emptyDatabase();
  });

  afterAll(async () => {
    await populateDatabase();
  });

  describe('getPreparers', () => {
    context('when database is populated', () => {
      it('should return all preparers in the database', (done) => {
        const expectedResponse = preparersData;

        request.get('preparers').end((err, res: any) => {
          if (err) {
            expect.assertions(0);
          }
          expect(res.statusCode).toEqual(200);
          expect(res.headers['access-control-allow-origin']).toEqual('*');
          expect(res.headers['access-control-allow-credentials']).toEqual('true');
          expect(res.body.length).toEqual(expectedResponse.length);
          done();
        });
      });
    });
  });

  describe('when database is empty', () => {
    beforeEach(async () => {
      await emptyDatabase();
    });

    /**
     * Due to open bug https://github.com/dherault/serverless-offline/issues/703,
     * Serverless Offline does not correctly return errors thrown by the Service.
     * exception path for code 404 cannot be tested directly and so assertion is indirect.
     * Workaround below asserts that correct errors are thrown, even if not caught in usual way.
     * The logic of test is strictly not correct but not an issue when this is deployed to AWS.
     */
    it('should return error code 404', async () => {
      const res = await request.get('preparers');
      expect(res.clientError).toBeTruthy();
      expect(res.notFound).toBeTruthy();
      expect(res.ok).toBeFalsy();
      expect(res.status).toEqual(404);
      expect(res.body).toEqual(HTTPRESPONSE.RESOURCE_NOT_FOUND);
    });
  });
});
