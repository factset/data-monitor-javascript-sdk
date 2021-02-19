import {dataPoint, resolveDataPointGet, pendingRequests} from './';
import * as events from '../events';
import {ComputedFieldDefinition, RoutedFieldDefinition, Field} from '../types';
import {computedFieldStore} from './computed-field-store';

jest.mock('../events');

describe('DataPoint module', () => {
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

  beforeEach(() => {
    jest.clearAllMocks();
    computedFieldStore.clear();
  });

  describe('register', () => {
    test('sends a registration request for any non locally computed fields', () => {
      dataPoint.register([routedField2, computedField1]);
      expect(events.sendDataPointRegister).toHaveBeenCalledWith([routedField2]);
    });

    test('creates an entry for locally defined computedFunctions in the computed function store', () => {
      expect(computedFieldStore.get(computedField1.id)).not.toBeDefined();
      dataPoint.register([computedField1]);
      expect(computedFieldStore.get(computedField1.id)).toBe(computedField1);
    });
  });

  describe('get', () => {
    describe('request', () => {
      test('sends a get request for all non locally registered computed fields', () => {
        dataPoint.register(computedField1);
        dataPoint.get(['foo', computedField1]);
        const [actionId, fields] = (<jest.Mock>events.sendDataPointGet).mock.calls[0];
        const fieldIds = fields.map(({id}: Field) => id);
        expect(fieldIds.indexOf('foo') > -1).toBeTruthy();
        expect(fieldIds.indexOf(computedField1.id) > -1).toBeFalsy();
      });

      test('keeps track of the inflight request', () => {
        const fieldPayload = ['foo'];
        dataPoint.get(fieldPayload);
        const [actionId, fields] = (<jest.Mock>events.sendDataPointGet).mock.calls[0];
        const pendingRequest = pendingRequests.get(actionId);
        expect(pendingRequest).toBeDefined();
        expect(pendingRequest!.resolve).toBeDefined();
        expect(pendingRequest!.requestedFields.length).toBe(fieldPayload.length);
      });
    });

    describe('resolution', () => {
      const mockResponse = '[{"id":"foo","endpoint":"bar","endpointProperty":"baz","name":"Foo","type":"string"}]';

      test("resolves the consumer's promise", () => {
        dataPoint.get(['foo']);
        const [actionId] = (<jest.Mock>events.sendDataPointGet).mock.calls[0];
        const consumerPromise = pendingRequests.get(actionId)!;
        jest.spyOn(consumerPromise, 'resolve');
        resolveDataPointGet(actionId, mockResponse);
        expect(consumerPromise.resolve).toHaveBeenCalledWith(JSON.parse(mockResponse));
      });

      test('includes locally defined computedFunction definitions if requested', () => {
        dataPoint.register(computedField1);
        dataPoint.get(['foo', computedField1.id]);
        const [actionId] = (<jest.Mock>events.sendDataPointGet).mock.calls[0];
        const consumerPromise = pendingRequests.get(actionId)!;
        jest.spyOn(consumerPromise, 'resolve');
        resolveDataPointGet(actionId, mockResponse);
        expect(consumerPromise.resolve).toHaveBeenCalledWith([...JSON.parse(mockResponse), computedField1]);
      });
    });
  });
});
