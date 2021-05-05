import {ProxySubscription} from './proxy-subscription';
import * as invalidate from './invalidate';
import * as events from './platform/web/events';

jest.mock('./invalidate');
jest.mock('./events');

describe('Proxy Subscription Collection', () => {
  let subscription: ProxySubscription;
  const symbol = 'GE';
  const fields = [{id: 'testField', endpoint: 'foo', endpointProperty: 'bar'}];

  beforeEach(() => {
    jest.clearAllMocks();
    subscription = new ProxySubscription(symbol, fields);
  });

  test('maintains a map of subscriptionIds to subscription symbols', () => {
    expect(subscription.idMap[subscription.id]).toBe(symbol);
  });

  describe('events', () => {
    describe('cancel', () => {
      test('should invalidate the subscription', () => {
        subscription.cancel();
        expect(invalidate.invalidateSubscription).toHaveBeenCalledWith(subscription);
      });

      test('should send a cancellation request', () => {
        subscription.cancel();
        expect(events.sendCancel).toHaveBeenCalledWith(subscription.idMap);
      });

      test('should not be processed if collection is not active', () => {
        subscription.active = false;
        subscription.cancel();
        expect(events.sendCancel).not.toHaveBeenCalled();
      });
    });

    describe('pause', () => {
      test('should send a pause request', () => {
        subscription.pause();
        expect(events.sendPause).toHaveBeenCalledWith(subscription.idMap);
      });

      test('should not be processed if collection is not active', () => {
        subscription.active = false;
        subscription.pause();
        expect(events.sendPause).not.toHaveBeenCalled();
      });
    });

    describe('resume', () => {
      test('should send a cancellation request', () => {
        subscription.resume();
        expect(events.sendResume).toHaveBeenCalledWith(subscription.idMap);
      });

      test('should not be processed if collection is not active', () => {
        subscription.active = false;
        subscription.resume();
        expect(events.sendResume).not.toHaveBeenCalled();
      });
    });

    describe('update', () => {
      test('should send a cancellation request', () => {
        const options = {currency: 'JPY'};
        subscription.update(options);
        expect(events.sendUpdate).toHaveBeenCalledWith(subscription.idMap, options);
      });

      test('should not be processed if collection is not active', () => {
        subscription.active = false;
        subscription.update({currency: 'JPY'});
        expect(events.sendUpdate).not.toHaveBeenCalled();
      });
    });
  });
});
