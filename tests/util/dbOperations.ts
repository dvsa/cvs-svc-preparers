import PreparersDAO from '../../src/models/PreparersDAO';
import preparers from '../resources/preparers.json';
import * as _ from 'lodash';

export const populateDatabase = async () => {
  const preparersMockDB = _.cloneDeep(preparers);
  const preparersDAO = new PreparersDAO();

  const batches = [];
  while (preparersMockDB.length > 0) {
    batches.push(preparersMockDB.splice(0, 25));
  }

  for (const batch of batches) {
    await preparersDAO.createMultiple(batch);
  }
};

export const emptyDatabase = async () => {
  const ids = _.cloneDeep(preparers).map((prep) => prep.preparerId);
  const preparersDAO = new PreparersDAO();

  const batches = [];
  while (ids.length > 0) {
    batches.push(ids.splice(0, 25));
  }

  for (const batch of batches) {
    await preparersDAO.deleteMultiple(batch);
  }
};
