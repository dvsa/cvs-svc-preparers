import PreparersDAO from '../models/PreparersDAO';
import PreparersService from '../services/PreparersService';
import HTTPResponse from '../models/HTTPResponse';

const getPreparers = () => {
  const preparersDAO = new PreparersDAO();
  const preparersService = new PreparersService(preparersDAO);

  return preparersService
    .getPreparersList()
    .then((data: any) => {
      return new HTTPResponse(200, data);
    })
    .catch((error: any) => {
      return new HTTPResponse(error.statusCode, error.body);
    });
};

export default getPreparers;
