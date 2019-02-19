class PreparersDAOMock {
  constructor () {
    this.preparersRecordsMock = null
    this.numberOfRecords = null
    this.numberOfScannedRecords = null
    this.isDatabaseOn = true
  }

  getAll () {
    const responseObject = {
      Items: this.preparersRecordsMock,
      Count: this.numberOfRecords,
      ScannedCount: this.numberOfScannedRecords
    }

    if (!this.isDatabaseOn) { return Promise.reject(responseObject) }

    return Promise.resolve(responseObject)
  }
}

module.exports = PreparersDAOMock
