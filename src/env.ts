export enum Environment {
  PROD = 'PROD',
  STG = 'STAGING',
}

const environments = Object.values(Environment);
let env: Environment = seedEnvironment();

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

export function setEnvironment(environment: Environment) {
  env = environment;
}

function seedEnvironment(): Environment {
  if (typeof process === 'undefined') {
    return Environment.PROD;
  }

  const {DATA_MONITOR_ENV} = process.env;
  return DATA_MONITOR_ENV && environments.includes(DATA_MONITOR_ENV as Environment)
    ? (DATA_MONITOR_ENV as Environment)
    : Environment.PROD;
}
