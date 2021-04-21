require('dotenv').config({path: '../.env'});
const {DATA_MONITOR_ENV} = process.env;

export enum Environment {
  PROD = 'PROD',
  STG = 'STAGING'
}

export enum Platform {
  WEB = 'web',
  NODE = 'node',
}

const environments = Object.values(Environment);

let env: Environment =
  DATA_MONITOR_ENV && environments.includes(DATA_MONITOR_ENV as Environment)
    ? (DATA_MONITOR_ENV as Environment)
    : Environment.PROD;

export function getIframeUrl() {
  switch (env) {
    case Environment.STG: {
      return 'https://my.staging-cauth.factset.com/services/data-monitor/api-frame';
    }
    case Environment.PROD:
    default: {
      return 'https://my.apps.factset.com/services/data-monitor/api-frame';
    }
  }
}

export function getApiUrl() {
  switch (env) {
    case Environment.STG: {
      return 'https://api.staging-cauth.factset.com/data-monitor/api/v1';
    }
    case Environment.PROD:
    default: {
      return 'https://api.factset.com/data-monitor/api/v1';
    }
  }
}

export function setEnvironment(environment: Environment) {
  env = environment;
}

export const platform = typeof window !== "undefined" ? Platform.WEB : Platform.NODE

export function getFactsetApiKey() {
  const username = process.env['DATA_MONITOR_API_USERNAME'];
  const password = process.env['DATA_MONITOR_API_PASSWORD'];
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

export function getMdgCredentials() {
  const idApp = process.env.MDG_ID_APP;
  const idUser = process.env.MDG_ID_USER;
  const credentials = process.env.MDG_CREDENTIALS;
    
  return {
    idApp,
    idUser,
    credentials
  }
}