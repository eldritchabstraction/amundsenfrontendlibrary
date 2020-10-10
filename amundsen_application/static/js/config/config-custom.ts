// This file should be used to add new config variables or overwrite defaults from config-default.ts

import { AppConfigCustom } from './config-types';

const configCustom: AppConfigCustom = {
  browse: {
    curatedTags: [],
    showAllTags: true,
  },
  google: {
    enabled: true,
    key: 'default-key',
    sampleRate: 100,
  },
  mailClientFeatures: {
    feedbackEnabled: true,
    notificationsEnabled: true,
  },
  indexDashboards: {
    enabled: false,
  },
  indexUsers: {
    enabled: false,
  },
  userIdLabel: 'email address',
  issueTracking: {
    enabled: true,
  },
  announcements: {
    enabled: true,
  },
  tableLineage: {
    iconPath: 'PATH_TO_ICON',
    isBeta: false,
    isEnabled: true,
    urlGenerator: (
      database: string,
      cluster: string,
      schema: string,
      table: string
    ) => {
      // return `https://localhost:7474/browser/?schema=${schema}&cluster=${cluster}&db=${database}&table=${table}`;
      return `http://localhost:7474/browser/?cmd=edit&arg=MATCH p=(tbl:Table {key:"${database}://${cluster}.${schema}/${table}")<-[r:DOWNSTREAM*]-(b) RETURN*UNION MATCH p=(tbl:Table {key:"${database}://${cluster}.${schema}/${table}"})-[r:DOWNSTREAM*]->(b) RETURN *`;
    },
  },
  upstreamDownstreamLink: {
    urlGenerator: (
      database: string,
      cluster: string,
      schema: string,
      table: string
    ) => {
      // return `https://localhost:7474/browser/?schema=${schema}&cluster=${cluster}&db=${database}&table=${table}`;
      return `http://localhost:5000/table_detail/${cluster}/${database}/${schema}/${table}`;
    },
  },
  tableProfile: {
    isBeta: false,
    isExploreEnabled: true,
    exploreUrlGenerator: (
      database: string,
      cluster: string,
      schema: string,
      table: string,
      partitionKey?: string,
      partitionValue?: string
    ) => {
      database = database.toUpperCase()
      cluster = cluster.toUpperCase()
      schema = schema.toUpperCase()
      table = table.toUpperCase()
      return `https://<snowflakeurl>/console#/data/tables/detail?databaseName=${cluster}&schemaName=${schema}&tableName=${table}`;
    },
  },
};

export default configCustom;
