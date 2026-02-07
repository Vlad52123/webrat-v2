export type BuildHistoryItem = {
   id: string;
   name: string;
   version?: string;
   victims?: number;
   created?: string;
};

export type ActiveBuildState = {
   jobId: string;
   name: string;
   buildId: string;
   password: string;
   created: string;
};