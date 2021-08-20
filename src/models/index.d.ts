interface IInvokeConfig {
  params: { apiVersion: string; endpoint?: string };
  functions: { testResults: { name: string }; techRecords: { name: string; mock: string } };
}

interface IDBConfig {
  params: { region: string; endpoint: string; convertEmptyValues: boolean };
  table: string;
}

export { IInvokeConfig, IDBConfig };
