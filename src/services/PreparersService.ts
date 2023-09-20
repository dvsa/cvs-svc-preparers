import HTTPError from '../models/HTTPError';
import PreparersDAO from '../models/PreparersDAO';

/**
 * Fetches the entire list of preparers from the database.
 * @returns Promise
 */
class PreparersService {
  private preparersDAO: PreparersDAO;

  constructor(preparersDAO: PreparersDAO) {
    this.preparersDAO = preparersDAO;
  }

  public getPreparersList() {
    return this.preparersDAO
      .getAll()
      .then((data) => {
        if (data.Count === 0) {
          throw new HTTPError(404, 'No resources match the search criteria.');
        }

        return data.Items;
      })
      .catch((error) => {
        if (!(error instanceof HTTPError)) {
          console.log(error);
          error.statusCode = 500;
          error.body = 'Internal Server Error';
        }

        throw new HTTPError(error.statusCode, error.body);
      });
  }

  public insertPreparerList(preparerItems: any[]) {
    return this.preparersDAO
      .createMultiple(preparerItems)
      .then((data) => {
        if (data.UnprocessedItems) {
          return data.UnprocessedItems;
        }
      })
      .catch((error) => {
        if (error) {
          console.error(error);
        } else {
          console.error(
            'An unknown error occurred during preparersDAO.createMultiple - promise rejected but no message returned'
          );
        }
        throw new HTTPError(500, 'Internal Server Error');
      });
  }

  public deletePreparerList(preparerItemKeys: string[]) {
    return this.preparersDAO
      .deleteMultiple(preparerItemKeys)
      .then((data) => {
        if (data.UnprocessedItems) {
          return data.UnprocessedItems;
        }
      })
      .catch((error) => {
        if (error) {
          console.error(error);
        } else {
          console.error(
            'An unknown error occurred during preparersDAO.deleteMultiple - promise rejected but no message returned'
          );
        }
        throw new HTTPError(500, 'Internal Server Error');
      });
  }
}

export default PreparersService;
