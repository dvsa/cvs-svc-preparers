const AWS = require('aws-sdk')
const generateConfig = require('../config/generateConfig')
const config = generateConfig()
const dbClient = new AWS.DynamoDB.DocumentClient(config.DYNAMODB_DOCUMENTCLIENT_PARAMS)

class PreparersDAO {
  constructor () {
    this.tableName = config.DYNAMODB_TABLE_NAME
  }

  getAll () {
    return dbClient.scan({ TableName: this.tableName }).promise()
  }

  createMultiple (preparerItems) {
    var params = this.generatePartialParams()

    preparerItems.forEach(preparerItem => {
      params.RequestItems[this.tableName].push(
        {
          PutRequest:
            {
              Item: preparerItem
            }
        })
    })

    return dbClient.batchWrite(params).promise()
  }

  deleteMultiple (primaryKeysToBeDeleted) {
    var params = this.generatePartialParams()

    primaryKeysToBeDeleted.forEach(key => {
      params.RequestItems[this.tableName].push(
        {
          DeleteRequest:
            {
              Key:
                {
                  preparerId: key
                }
            }
        }
      )
    })

    return dbClient.batchWrite(params).promise()
  }

  generatePartialParams () {
    return {
      RequestItems:
        {
          [this.tableName]: []
        }
    }
  }
}

module.exports = PreparersDAO
