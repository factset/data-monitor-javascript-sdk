import {ProxySubscriptionCollection} from './proxy-subscription-collection';
import {removeCollection, removeSubscription} from './maps';
import {ProxySubscription} from './proxy-subscription';

export function invalidateCollection(collection: ProxySubscriptionCollection) {
  removeCollection(collection);
  collection.subscriptions.forEach(subscription => invalidateSubscription(subscription));
  collection.active = false;
}

export function invalidateSubscription(subscription: ProxySubscription) {
  removeSubscription(subscription);
  subscription.active = false;
}
