import {createIframe, createWorker, sendOn, sendOnce, sendInit} from './platform/node/events';
import {OnParams, OnceParams, InitOptions} from './types';
import {ProxySubscriptionCollection} from './proxy-subscription-collection';
import {populateSubscriptionMap, subscriptionMap} from './maps';
import {getIframeUrl, Platform, platform, setEnvironment} from './env';
import {resolveFields} from './data-point/resolve-fields';

export const VERSION = 'VERSION_REPLACED_DURING_PREPUBLISH';

export * from './types';
export {Environment} from './env';
export {dataPoint} from './data-point';

export async function init(options: InitOptions = {}, frameUrl?: string) {
  const {idpid, environment, globalOptions} = options;
  if (environment) {
    setEnvironment(environment);
  }

  if (globalOptions && Object.keys(globalOptions).length) {
    sendInit(globalOptions);
  }

  if (platform === Platform.WEB) {
    await createIframe(`${frameUrl || getIframeUrl()}${idpid ? `?idpid=${idpid}` : ''}`);
  }
}

export function on({symbols, fields, success, error, options}: OnParams): ProxySubscriptionCollection {
  if (success == null) {
    throw new Error("Invalid Usage: 'success' callback is required");
  }

  const callbacks = {
    success,
    ...(error ? {error} : {}),
  };

  const resolvedFields = resolveFields(fields);
  if (!resolvedFields.requestableFields.length) {
    throw new Error('Invalid Usage: field dependency tree contains no requestable fields');
  }

  const collection = new ProxySubscriptionCollection(symbols, resolvedFields.originalFields);
  populateSubscriptionMap(collection, resolvedFields, callbacks, options);
  sendOn(collection, resolvedFields.requestableFields, options);

  console.log(subscriptionMap);
  return collection;
}

export function once({symbols, fields, complete, success, error, options}: OnceParams): ProxySubscriptionCollection {
  if (complete == null && success == null) {
    throw new Error("Invalid Usage: at least one of the 'complete' or 'success' callbacks is required");
  }

  const callbacks = {
    ...(complete ? {complete} : {}),
    ...(success ? {success} : {}),
    ...(error ? {error} : {}),
  };

  const resolvedFields = resolveFields(fields);
  if (!resolvedFields.requestableFields.length) {
    throw new Error('Invalid Usage: field dependency tree contains no requestable fields');
  }
  
  const collection = new ProxySubscriptionCollection(symbols, resolvedFields.originalFields);
  populateSubscriptionMap(collection, resolvedFields, callbacks, options, true);
  sendOnce(collection, resolvedFields.requestableFields, options);
  return collection;
}
