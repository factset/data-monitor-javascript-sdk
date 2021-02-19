import {populateSubscriptionMap, subscriptionMap} from './maps';
import {ProxySubscriptionCollection} from './proxy-subscription-collection';
import {FieldSet} from './data-point/resolve-fields';
import {Field} from './types';

describe('Subscription Maps', () => {
  let collection: ProxySubscriptionCollection;
  const symbols = ['GE', 'FB'];
  const options = {currency: 'JPY'};
  const fields: Field[] = [{id: 'foo', endpoint: 'foo', endpointProperty: 'bar'}];
  const fieldSet: FieldSet = {
    originalFields: fields,
    resolvedFields: fields,
    requestableFields: fields,
  };
  const callbacks = {
    success: () => null,
  };

  beforeEach(() => {
    subscriptionMap.clear();
    collection = new ProxySubscriptionCollection(symbols, fields);
  });

  test('creates an entry for each subscription in the collection', () => {
    populateSubscriptionMap(collection, fieldSet, callbacks, options);
    expect(subscriptionMap.size).toBe(2);
    const subscriptionIds = Array.from(collection.subscriptions).map(([_, subscription]) => subscription.id);
    subscriptionIds.forEach(id => expect(subscriptionMap.get(id)).toBeDefined());
    expect(subscriptionMap.get(collection.id)).not.toBeDefined();
  });

  test('supports creating an entry for the subscription collection itself', () => {
    populateSubscriptionMap(collection, fieldSet, callbacks, options, true);
    expect(subscriptionMap.size).toBe(3);
    const collectionEntry = subscriptionMap.get(collection.id);
    expect(collectionEntry).toBeDefined();
    expect(collectionEntry!.collection).toBe(collection);
    expect(collectionEntry!.success).toBe(callbacks.success);
    expect(collectionEntry!.fields).toBe(fieldSet);
    expect(collectionEntry!.options).toBe(options);
  });
});
