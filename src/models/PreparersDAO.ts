import { IDBConfig } from '.';
import { Configuration } from '../utils/Configuration';
import { DynamoDBClient, ScanCommand, BatchWriteItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb'

/* workaround AWSXRay.captureAWS(...) call obscures types provided by the AWS sdk.
https://github.com/aws/aws-xray-sdk-node/issues/14
*/

class PreparersDAO {
  private tableName: string;
  private static docClient: DynamoDBClient;

  constructor() {
    const config: IDBConfig = Configuration.getInstance().getDynamoDBConfig();
    this.tableName = config.table;
    if (!PreparersDAO.docClient) {
      PreparersDAO.docClient = new DynamoDBClient(config.params);
    }
  }

  public getAll() {
    return PreparersDAO.docClient.send(new ScanCommand({ TableName: this.tableName }));
  }

  public createMultiple(preparerItems: any[]) {
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

  public deleteMultiple(primaryKeysToBeDeleted: string[]) {
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
