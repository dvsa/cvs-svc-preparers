/* global describe context it */

const PreparersDAOMock = require('../models/PreparersDAOMock')
const PreparersService = require('../../src/services/PreparersService')
const HTTPError = require('../../src/models/HTTPError')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')

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

describe('insertPreparerList', () => {
  const preparersDAOMock = new PreparersDAOMock()

  context('when db does not return response', () => {
    it('should return 500-Internal Server Error', () => {
      preparersDAOMock.isDatabaseOn = false
      const preparersService = new PreparersService(preparersDAOMock)
      const preparersData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/preparers.json'), 'utf8'))
      const mockData = [preparersData[0]]

      return preparersService.insertPreparerList(mockData)
        .catch((errorResponse) => {
          expect(errorResponse).to.be.instanceOf(HTTPError)
          expect(errorResponse.statusCode).to.be.equal(500)
          expect(errorResponse.body).to.equal('Internal Server Error')
        })
    })
  })

  context('when insert a valid preparers array', () => {
    it('should return 200', () => {
      preparersDAOMock.isDatabaseOn = true
      const preparersService = new PreparersService(preparersDAOMock)
      const preparersData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/preparers.json'), 'utf8'))
      const mockData = preparersData[0]

      return preparersService.insertPreparerList(mockData)
        .then((result) => {
          expect(Object.keys(result).length).to.equal(0)
          expect(result.constructor).to.equal(Object)
        })
    })
  })
})

describe('deletePreparerList', () => {
  const preparersDAOMock = new PreparersDAOMock()

  context('when db does not return response', () => {
    it('should return 500-Internal Server Error', () => {
      preparersDAOMock.isDatabaseOn = false
      const preparersService = new PreparersService(preparersDAOMock)
      const preparersData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/preparers.json'), 'utf8'))
      const mockData = [preparersData[0]].id

      return preparersService.deletePreparerList(mockData)
        .catch((errorResponse) => {
          expect(errorResponse).to.be.instanceOf(HTTPError)
          expect(errorResponse.statusCode).to.be.equal(500)
          expect(errorResponse.body).to.equal('Internal ServerError')
        })
    })
  })

  context('when deleting a valid preparers array', () => {
    it('should return 200', () => {
      preparersDAOMock.isDatabaseOn = true
      const preparersService = new PreparersService(preparersDAOMock)
      const preparersData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/preparers.json'), 'utf8'))
      const mockData = preparersData[0].id

      return preparersService.deletePreparerList(mockData)
        .then((result) => {
          expect(Object.keys(result).length).to.equal(0)
          expect(result.constructor).to.equal(Object)
        })
    })
  })
})
