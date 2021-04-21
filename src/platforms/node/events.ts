import {Options, Action, Response, Request, Field} from '../../types';

import {subscriptionMap} from '../../maps';
import {processMessage} from '../../message/process-message';
import {invalidateCollection, invalidateSubscription} from '../../invalidate';
import {ProxySubscriptionCollection} from '../../proxy-subscription-collection';
import {VERSION} from '../..';
import { Worker, MessageChannel } from 'worker_threads';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import {getApiUrl, getFactsetApiKey, getMdgCredentials} from '../../env';
import { resolveDataPointGet } from '../../data-point';

const DATA_MONITOR_S3 = "http://localhost:8006/api/v1/node-worker";
const dmPath = path.resolve(__dirname, './data-monitor.js')
//const localPath = '../../dm-node-worker/bundle/data-monitor.node.js';
const localPath = '../../dm-client/packages/dm-node-worker/dist/lib-common/index.js';

const download = async() => {
  return axios({
    method: 'get',
    url: DATA_MONITOR_S3,
    responseType: 'stream',
  }).then(res => {
    res.data.pipe(fs.createWriteStream(dmPath));

    // return a promise and resolve when download finishes
    return new Promise<void>((resolve, reject) => {
      res.data.on('end', () => {
        resolve()
      })

      res.data.on('error', () => {
        reject()
      })
    })
  })
}

const worker = new Worker(localPath, {
  workerData: {
    path: localPath,
    factsetApiKey: getFactsetApiKey(),
    baseUrl: getApiUrl(),
    mdgCredentials: getMdgCredentials(),
  }
});

export function sendDataPointGet(actionId: string, fields: Field[] | undefined) {
  const {port1, port2} = new MessageChannel();

  port1.on('message', (response: any) => {
    resolveDataPointGet(actionId, response.resolvedFields);

    port1.close();
    port2.close();
  })

  worker.postMessage({port: port2, action: 'dataPointGet', data: {
    fields
  }}, [port2]);
}

export function sendDataPointRegister(fields: Field[]) {
  const {port1, port2} = new MessageChannel();

  port1.on('message', (response: any) => {
    console.log(response);

    port1.close();
    port2.close();
  })

  worker.postMessage({port: port2, action: 'dataPointRegister', data: {
    fields
  }}, [port2]);
}

export function sendOnce(collection: ProxySubscriptionCollection, fields: Field[], options?: Options) {
  const {port1, port2} = new MessageChannel();

  port1.on('message', (response: any) => {
    handleComplete({
      ...response,
      collectionId: collection.id,
    });

    if (response.error?.length) {
      handleError({
        ...response,
        subscriptionIdMap: collection.idMap,
      })
    }
    
    port1.close();
    port2.close();
  });

  worker.postMessage({ port: port2, action: 'once', data: {
    symbols: Object.values(collection.idMap),
    fields,
    options,
  }}, [port2]);
}

function handleError({subscriptionIdMap, error}: Response) {
  const entry = subscriptionMap.get(Object.keys(subscriptionIdMap!)[0]);
  if (error && entry?.error && entry?.subscription) {
    entry.error(JSON.parse(error), entry.subscription);
  }
}

function handleComplete({collectionId, message, error}: Response) {
  const entry = subscriptionMap.get(collectionId!);
  if (!entry) {
    return;
  }

  console.log(subscriptionMap, message, error, collectionId);

  if (message && entry.complete && entry.collection) {
    const errorResponse = error && JSON.parse(error);
    Object.keys(message).forEach(symbol => {
      const subscription = entry.collection!.subscriptions.get(symbol)!;
      message[symbol] = processMessage(message[symbol], entry.fields, subscription, entry.options);
    });

    entry.complete(errorResponse, message, entry.collection);
  }

  if (entry.collection) {
    invalidateCollection(entry.collection);
  }
}

// function handleDataPointGet({actionId, fields}: Response) {
//   if (actionId && fields) {
//     resolveDataPointGet(actionId, fields as string);
//   }
// }

// function handlePing() {
//   initialized = true;
//   flushBuffer();
//   loadPromiseResolver();
// }

// export function sendCancel(subscriptionIdMap: Record<string, string>) {
//   send({
//     source: 'dataMonitor',
//     action: Action.CANCEL,
//     subscriptionIdMap,
//   });
// }

// export function sendPause(subscriptionIdMap: Record<string, string>) {
//   send({
//     source: 'dataMonitor',
//     action: Action.PAUSE,
//     subscriptionIdMap,
//   });
// }

// export function sendResume(subscriptionIdMap: Record<string, string>) {
//   send({
//     source: 'dataMonitor',
//     action: Action.RESUME,
//     subscriptionIdMap,
//   });
// }



// export function sendDataPointRegister(fields: Field[]) {
//   send({
//     source: 'dataMonitor',
//     action: Action.DATA_POINT_REGISTER,
//     fields,
//   });
// }

// export function sendPing() {
//   send({
//     source: 'dataMonitor',
//     action: Action.PING,
//     sdkVersion: VERSION,
//   });
// }

// export function sendInit(initOptions: Options) {
//   send({
//     source: 'dataMonitor',
//     action: Action.INIT,
//     initOptions,
//   });
// }

// export function send(request: Request) {
//   if (!initialized && request.action !== Action.PING) {
//     queueTask(request);
//     return;
//   }

//   if (frame) {
//     frame.contentWindow!.postMessage(request, '*');
//   }
// }
export function createWorker() {
  return null;
}

export function sendInit(option: any) {
  return null;
}

export async function createIframe(frameUrl: string) {
  return null;
}

export {sendOnce as sendOn}