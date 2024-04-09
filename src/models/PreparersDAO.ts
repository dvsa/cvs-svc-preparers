import { DynamoDBDocumentClient, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb';
import { IDBConfig } from '.';
import { Configuration } from '../utils/Configuration';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import AWSXRay from 'aws-xray-sdk';

/* workaround AWSXRay.captureAWS(...) call obscures types provided by the AWS sdk.
https://github.com/aws/aws-xray-sdk-node/issues/14
*/

class PreparersDAO {
  private tableName: string;
  private static docClient: DynamoDBDocumentClient;

  constructor() {
    const config: IDBConfig = Configuration.getInstance().getDynamoDBConfig();
    this.tableName = config.table;
    const client = new DynamoDBClient(config.params);

    if (process.env._X_AMZN_TRACE_ID) {
      PreparersDAO.docClient = AWSXRay.captureAWSv3Client(DynamoDBDocumentClient.from(client));
    } else {
      PreparersDAO.docClient = DynamoDBDocumentClient.from(client);
    }
  }

  public async getAll() {
    return await PreparersDAO.docClient.send(new ScanCommand({ TableName: this.tableName }));
  }

  public async createMultiple(preparerItems: any[]) {
    const params = this.generatePartialParams();

    preparerItems.forEach((preparerItem: any) => {
      params.RequestItems[this.tableName].push({
        PutRequest: {
          Item: preparerItem
        }
      });
    });

    return PreparersDAO.docClient.send(new BatchWriteCommand(params));
  }

  public async deleteMultiple(primaryKeysToBeDeleted: string[]) {
    const params = this.generatePartialParams();

    primaryKeysToBeDeleted.forEach((key) => {
      params.RequestItems[this.tableName].push({
        DeleteRequest: {
          Key: {
            preparerId: key
          }
        }
      });
    });

    return PreparersDAO.docClient.send(new BatchWriteCommand(params));
  }

  public generatePartialParams(): any {
    return {
      RequestItems: {
        [this.tableName]: []
      }
    };
  }
}

export default PreparersDAO;
