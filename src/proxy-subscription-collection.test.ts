import {ProxySubscriptionCollection} from './proxy-subscription-collection';
import {ProxySubscription} from './proxy-subscription';
import * as invalidate from './invalidate';
import * as events from './platforms/web/events';

jest.mock('./invalidate');
jest.mock('./events');

describe('Proxy Subscription Collection', () => {
  let collection: ProxySubscriptionCollection;
  const symbols = ['GE', 'AAPL'];
  const fields = [{id: 'testField', endpoint: 'foo', endpointProperty: 'bar'}];

  beforeEach(() => {
    jest.clearAllMocks();
    collection = new ProxySubscriptionCollection(symbols, fields);
  });

  test('creates subscription objects for all passed symbols', () => {
    expect(collection.subscriptions.size).toBe(2);
    expect(collection.subscriptions.get('GE')).toBeInstanceOf(ProxySubscription);
    expect(collection.subscriptions.get('AAPL')).toBeInstanceOf(ProxySubscription);
  });

  test('maintains a map of subscriptionIds to subscription symbols', () => {
    expect(Object.keys(collection.idMap).length).toBe(2);
    const AMZN = new ProxySubscription('AMZN', fields);
    collection.subscriptions.set('AMZN', AMZN);
    expect(Object.keys(collection.idMap).length).toBe(3);
    expect(collection.idMap[AMZN.id]).toBe('AMZN');
  });

  test('does not include invalidated subscriptions in its idmap', () => {
    const GE = collection.subscriptions.get('GE')!;
    GE.active = false;
    expect(collection.idMap[GE.id]).not.toBeDefined();
    expect(Object.keys(collection.idMap).length).toBe(1);
  });

  describe('events', () => {
    describe('cancel', () => {
      test('should invalidate the collection', () => {
        collection.cancel();
        expect(invalidate.invalidateCollection).toHaveBeenCalledWith(collection);
      });

      test('should send a cancellation request', () => {
        collection.cancel();
        expect(events.sendCancel).toHaveBeenCalledWith(collection.idMap);
      });

      test('should not be processed if collection is not active', () => {
        collection.active = false;
        collection.cancel();
        expect(events.sendCancel).not.toHaveBeenCalled();
      });
    });

    describe('pause', () => {
      test('should send a pause request', () => {
        collection.pause();
        expect(events.sendPause).toHaveBeenCalledWith(collection.idMap);
      });

      test('should not be processed if collection is not active', () => {
        collection.active = false;
        collection.pause();
        expect(events.sendPause).not.toHaveBeenCalled();
      });
    });

    describe('resume', () => {
      test('should send a cancellation request', () => {
        collection.resume();
        expect(events.sendResume).toHaveBeenCalledWith(collection.idMap);
      });

      test('should not be processed if collection is not active', () => {
        collection.active = false;
        collection.resume();
        expect(events.sendResume).not.toHaveBeenCalled();
      });
    });

    describe('update', () => {
      test('should send a cancellation request', () => {
        const options = {currency: 'JPY'};
        collection.update(options);
        expect(events.sendUpdate).toHaveBeenCalledWith(collection.idMap, options);
      });

      test('should not be processed if collection is not active', () => {
        collection.active = false;
        collection.update({currency: 'JPY'});
        expect(events.sendUpdate).not.toHaveBeenCalled();
      });
    });
  });
});
