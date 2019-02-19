const supertest = require('supertest')
const expect = require('chai').expect
const fs = require('fs')
const path = require('path')
const url = 'http://localhost:3003/'
const request = supertest(url)
const PreparersService = require('../../src/services/PreparersService')
const PreparersDAO = require('../../src/models/PreparersDAO')

describe('preparers', () => {
  describe('getPreparers', () => {
    context('when database is populated', () => {
      let preparersService = null
      const preparersData = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../resources/preparers.json'), 'utf8'))
      let preparersDAO = null

      before((done) => {
        preparersDAO = new PreparersDAO()
        preparersService = new PreparersService(preparersDAO)
        let mockBuffer = preparersData.slice()

        let batches = []
        while (mockBuffer.length > 0) {
          batches.push(mockBuffer.splice(0, 25))
        }

        batches.forEach((batch) => {
          preparersService.insertPreparerList(batch)
        })

        done()
      })

      it('should return all preparers in the database', (done) => {
        let expectedResponse = JSON.parse(JSON.stringify(preparersData));

        request.get('preparers')
          .end((err, res) => {
            console.log()
            if (err) { expect.fail(err) }
            expect(res.statusCode).to.equal(200)
            expect(res.headers['access-control-allow-origin']).to.equal('*')
            expect(res.headers['access-control-allow-credentials']).to.equal('true')
            expect(res.body.length).to.equal(expectedResponse.length)
            done()
          })
      })

      after((done) => {
        let dataBuffer = preparersData

        let batches = []
        while (dataBuffer.length > 0) {
          batches.push(dataBuffer.splice(0, 25))
        }

        batches.forEach((batch) => {
          preparersService.deletePreparerList(
            batch.map((item) => {
              return item.preparerId
            })
          )
        })

        done()
      })
    })
  })

  context('when database is empty', () => {
    it('should return error code 404', (done) => {
      request.get('preparers').expect(404, done)
    })
  })

  beforeEach((done) => {
    setTimeout(done, 500)
  })
  afterEach((done) => {
    setTimeout(done, 500)
  })
})
