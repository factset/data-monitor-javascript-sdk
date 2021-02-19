import * as maps from './maps';
import {ProxySubscriptionCollection} from './proxy-subscription-collection';
import {invalidateCollection, invalidateSubscription} from './invalidate';

jest.mock('./maps');

describe('Invalidate', () => {
  let collection: ProxySubscriptionCollection;
  const symbols = ['GE', 'AAPL'];
  const fields = [{id: 'testField', endpoint: 'foo', endpointProperty: 'bar'}];

  beforeEach(() => {
    jest.clearAllMocks();
    collection = new ProxySubscriptionCollection(symbols, fields);
  });

  describe('collection', () => {
    test('removes the collection from memory', () => {
      invalidateCollection(collection);
      expect(maps.removeCollection).toHaveBeenCalledWith(collection);
      expect(collection.active).toBe(false);
    });

    test('invalidates its subscriptions', () => {
      const GE = collection.subscriptions.get('GE')!;
      invalidateCollection(collection);
      expect(GE.active).toBe(false);
    });
  });

  describe('subscription', () => {
    test('removes the subscription from memory', () => {
      const subscription = collection.subscriptions.get(symbols[0])!;
      invalidateSubscription(subscription);
      expect(maps.removeSubscription).toHaveBeenCalledWith(subscription);
      expect(subscription.active).toBe(false);
    });
  });
});
