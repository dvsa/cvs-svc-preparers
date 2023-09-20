import PreparersDAO from '../models/PreparersDAO';
import PreparersService from '../services/PreparersService';
import HTTPResponse from '../models/HTTPResponse';

const getPreparers = () => {
  const preparersDAO = new PreparersDAO();
  const preparersService = new PreparersService(preparersDAO);

  return preparersService
    .getPreparersList()
    .then((data: any) => new HTTPResponse(200, data))
    .catch((error: any) => new HTTPResponse(error.statusCode, error.body));
};

export default getPreparers;
