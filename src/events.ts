import {Options, Action, Response, Request, Field} from './types';
import {subscriptionMap} from './maps';
import {ProxySubscriptionCollection} from './proxy-subscription-collection';
import {invalidateCollection} from './invalidate';
import {resolveDataPointGet} from './data-point';
import {flushBuffer, queueTask} from './buffer';
import {processMessage} from './message/process-message';
import {VERSION} from '.';

let frame: HTMLIFrameElement | undefined;
let loadPromise: Promise<void>;
let loadPromiseResolver: Function;
let initialized = false;

export function createIframe(frameUrl: string) {
  if (!loadPromise) {
    addWindowListener();
    loadPromise = new Promise((resolve, reject) => {
      loadPromiseResolver = resolve;
      frame = document.createElement('iframe');
      frame.src = frameUrl;
      frame.style.display = 'none';
      frame.addEventListener('load', function() {
        sendPing();
      });
      frame.addEventListener('error', function() {
        reject();
      });

      document.body.appendChild(frame);
    });
  }

  return loadPromise;
}

function addWindowListener() {
  window.addEventListener('message', (e: MessageEvent) => {
    handleMessage(e.data as Response);
  });
}

export function handleMessage(response: Response) {
  if (response.source === 'dataMonitor') {
    switch (response.action) {
      case Action.SUCCESS: {
        handleSuccess(response);
        break;
      }
      case Action.ERROR: {
        handleError(response);
        break;
      }
      case Action.COMPLETE: {
        handleComplete(response);
        break;
      }
      case Action.DATA_POINT_GET: {
        handleDataPointGet(response);
        break;
      }
      case Action.PING: {
        handlePing();
        break;
      }
      default:
        break;
    }
  }
}

function handleSuccess({subscriptionIdMap, message}: Response) {
  const entry = subscriptionMap.get(Object.keys(subscriptionIdMap!)[0]);
  if (message && entry?.success && entry?.subscription) {
    message.data = processMessage(message.data, entry.fields, entry.subscription, entry.options);
    entry.success(message, entry.subscription);
  }
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

function handleDataPointGet({actionId, fields}: Response) {
  if (actionId && fields) {
    resolveDataPointGet(actionId, fields as string);
  }
}

function handlePing() {
  initialized = true;
  flushBuffer();
  loadPromiseResolver();
}

export function sendOn(subscriptionIdMap: Record<string, string>, fields: Field[], options?: Options) {
  send({
    source: 'dataMonitor',
    action: Action.ON,
    subscriptionIdMap,
    fields,
    options,
  });
}

export function sendOnce(collection: ProxySubscriptionCollection, fields: Field[], options?: Options) {
  send({
    source: 'dataMonitor',
    action: Action.ONCE,
    subscriptionIdMap: collection.idMap,
    collectionId: collection.id,
    fields,
    options,
  });
}

export function sendUpdate(subscriptionIdMap: Record<string, string>, options: Options) {
  send({
    source: 'dataMonitor',
    action: Action.UPDATE,
    subscriptionIdMap,
    options,
  });
}

export function sendCancel(subscriptionIdMap: Record<string, string>) {
  send({
    source: 'dataMonitor',
    action: Action.CANCEL,
    subscriptionIdMap,
  });
}

export function sendPause(subscriptionIdMap: Record<string, string>) {
  send({
    source: 'dataMonitor',
    action: Action.PAUSE,
    subscriptionIdMap,
  });
}

export function sendResume(subscriptionIdMap: Record<string, string>) {
  send({
    source: 'dataMonitor',
    action: Action.RESUME,
    subscriptionIdMap,
  });
}

export function sendDataPointGet(actionId: string, fields: Field[] | undefined) {
  send({
    source: 'dataMonitor',
    action: Action.DATA_POINT_GET,
    actionId,
    fields,
  });
}

export function sendDataPointRegister(fields: Field[]) {
  send({
    source: 'dataMonitor',
    action: Action.DATA_POINT_REGISTER,
    fields,
  });
}

export function sendPing() {
  send({
    source: 'dataMonitor',
    action: Action.PING,
    sdkVersion: VERSION,
  });
}

export function sendInit(initOptions: Options) {
  send({
    source: 'dataMonitor',
    action: Action.INIT,
    initOptions,
  });
}

export function send(request: Request) {
  if (!initialized && request.action !== Action.PING) {
    queueTask(request);
    return;
  }

  if (frame) {
    frame.contentWindow!.postMessage(request, '*');
  }
}
