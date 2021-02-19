import {ProxySubscriptionCollection} from './proxy-subscription-collection';
import {ProxySubscription} from './proxy-subscription';
import {SuccessCallback, ErrorCallback, CompleteCallback, Options} from './types';
import {FieldSet} from './data-point/resolve-fields';

export const subscriptionMap = new Map<string, SubscriptionMapEntry>();
export interface SubscriptionMapEntry {
  collection?: ProxySubscriptionCollection;
  subscription?: ProxySubscription;
  fields: FieldSet;
  options: Options;
  success?: SuccessCallback;
  complete?: CompleteCallback;
  error?: ErrorCallback;
}

export function populateSubscriptionMap(
  collection: ProxySubscriptionCollection,
  fields: FieldSet,
  callbacks: Record<string, Function>,
  options: Options = {},
  trackCollection: boolean = false
) {
  if (trackCollection) {
    subscriptionMap.set(collection.id, {collection, fields, options, ...callbacks});
  }

  collection.subscriptions.forEach(subscription => {
    subscriptionMap.set(subscription.id, {
      subscription,
      fields,
      options,
      ...callbacks,
    });
  });
}

export function removeSubscription(subscription: ProxySubscription) {
  subscriptionMap.delete(subscription.id);
}

export function removeCollection(collection: ProxySubscriptionCollection) {
  subscriptionMap.delete(collection.id);
}
