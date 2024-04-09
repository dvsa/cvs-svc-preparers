import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { IDBConfig } from '.';
import { Configuration } from '../utils/Configuration';
import { DynamoDBClient, ScanCommand, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';

/* workaround AWSXRay.captureAWS(...) call obscures types provided by the AWS sdk.
https://github.com/aws/aws-xray-sdk-node/issues/14
*/

class PreparersDAO {
  private tableName: string;
  private static docClient: DynamoDBDocumentClient;

  constructor() {
    const config: IDBConfig = Configuration.getInstance().getDynamoDBConfig();
    this.tableName = config.table;
    if (!PreparersDAO.docClient) {
      const client = new DynamoDBClient(config.params);
      PreparersDAO.docClient = DynamoDBDocumentClient.from(client);
    }
  }

  public async getAll() {
    return PreparersDAO.docClient.send(new ScanCommand({ TableName: this.tableName }));
  }

  public async createMultiple(preparerItems: any[]) {
    const params = this.generatePartialParams();

    preparerItems.forEach((preparerItem: any) => {
      params.RequestItems[this.tableName].push({
        PutRequest: {
          Item: marshall(preparerItem)
        }
      });
    });

    return PreparersDAO.docClient.send(new BatchWriteItemCommand(params));
  }

  public async deleteMultiple(primaryKeysToBeDeleted: string[]) {
    const params = this.generatePartialParams();

    primaryKeysToBeDeleted.forEach((key) => {
      params.RequestItems[this.tableName].push({
        DeleteRequest: {
          Key: {
            preparerId: marshall(key)
          }
        }
      });
    });

    return PreparersDAO.docClient.send(new BatchWriteItemCommand(params));
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
