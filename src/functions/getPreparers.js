
'use strict'
const PreparersDAO = require('../models/PreparersDAO')
const PreparersService = require('../services/PreparersService')
const HTTPResponse = require('../models/HTTPResponse')

const getPreparers = () => {
  const preparersDAO = new PreparersDAO()
  const preparersService = new PreparersService(preparersDAO)

  return preparersService.getPreparersList()
    .then((data) => {
      return new HTTPResponse(200, data)
    })
    .catch((error) => {
      return new HTTPResponse(error.statusCode, error.body)
    })
}

module.exports = getPreparers
