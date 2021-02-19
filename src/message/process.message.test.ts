import {processMessage} from './process-message';
import {ProxySubscription} from '../proxy-subscription';
import {FieldSet} from '../data-point/resolve-fields';
import {ComputedFieldDefinition, RoutedFieldDefinition} from '../types';

describe('processMessage', () => {
  const rawData = {
    routedField1: 1,
    routedField2: 2,
  };

  const computedField1: ComputedFieldDefinition = {
    id: 'computedField1',
    dependencies: ['routedField1'],
    computedFunction: () => 20,
  };

  const computedField2: ComputedFieldDefinition = {
    id: 'computedField2',
    dependencies: ['computedField1'],
    computedFunction: data => data.computedField1 + 20,
  };

  const routedField1: RoutedFieldDefinition = {id: 'routedField1', endpoint: 'bar', endpointProperty: 'baz'};
  const routedField2: RoutedFieldDefinition = {id: 'routedField2', endpoint: 'fizz', endpointProperty: 'buzz'};

  const fieldSet: FieldSet = {
    originalFields: [computedField2, routedField2],
    resolvedFields: [routedField1, routedField2, computedField1, computedField2],
    requestableFields: [routedField1, routedField2],
  };

  const subscription = new ProxySubscription('GE', fieldSet.originalFields);
  const options = {
    currency: 'JPY',
  };

  it('only returns fields that were explicitly requested', () => {
    const message = processMessage(rawData, fieldSet, subscription, options);
    expect(message.computedField2).toBeDefined();
    expect(message.routedField2).toBeDefined();
    expect(message.computedField1).not.toBeDefined();
    expect(message.routedField1).not.toBeDefined();
  });

  it('runs computed functions', () => {
    jest.spyOn(computedField2, 'computedFunction');
    jest.spyOn(computedField1, 'computedFunction');
    const message = processMessage(rawData, fieldSet, subscription, options);
    expect(computedField2.computedFunction).toHaveBeenCalled();
    expect(computedField1.computedFunction).toHaveBeenCalled();
    expect(message.computedField2).toBe(40);
  });
});
