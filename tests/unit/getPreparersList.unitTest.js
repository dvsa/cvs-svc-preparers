/* global describe it context */
const PreparersDAOMock = require('../models/PreparersDAOMock')
const PreparersService = require('../../src/services/PreparersService')
const HTTPError = require('../../src/models/HTTPError')
const expect = require('chai').expect

describe('getPreparersList', () => {
  var preparersDAOMock = new PreparersDAOMock()

  describe('when database is on', () => {
    context('database call returns valid data', () => {
      it('should return the expected data', () => {
        preparersDAOMock.preparersRecordsMock = require('../resources/preparers.json')
        preparersDAOMock.numberOfRecords = 29
        preparersDAOMock.numberOfScannedRecords = 29
        const preparersService = new PreparersService(preparersDAOMock)

        return preparersService.getPreparersList()
          .then((returnedRecords) => {
            expect(returnedRecords.length).to.equal(29)
          })
      })
    })
    context('database call returns empty data', () => {
      it('should return error 404', () => {
        preparersDAOMock.preparersRecordsMock = require('../resources/preparers.json')
        preparersDAOMock.numberOfRecords = 0
        preparersDAOMock.numberOfScannedRecords = 0
        const preparersService = new PreparersService(preparersDAOMock)

        return preparersService.getPreparersList()
          .then(() => {
            expect.fail()
          }).catch((errorResponse) => {
            expect(errorResponse).to.be.instanceOf(HTTPError)
            expect(errorResponse.statusCode).to.equal(404)
            expect(errorResponse.body).to.equal('No resources match the search criteria.')
          })
      })
    })
  })

  describe('when database is off', () => {
    it('should return error 500', () => {
      preparersDAOMock.preparersRecordsMock = require('../resources/preparers.json')
      preparersDAOMock.numberOfRecords = 29
      preparersDAOMock.numberOfScannedRecords = 29
      preparersDAOMock.isDatabaseOn = false
      const preparersService = new PreparersService(preparersDAOMock)

      return preparersService.getPreparersList()
        .then(() => {})
        .catch((errorResponse) => {
          expect(errorResponse).to.be.instanceOf(HTTPError)
          expect(errorResponse.statusCode).to.be.equal(500)
          expect(errorResponse.body).to.equal('Internal Server Error')
        })
    })
  })
})
