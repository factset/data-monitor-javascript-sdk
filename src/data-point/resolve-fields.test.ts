import {resolveFields, FieldSet} from './resolve-fields';
import {ComputedFieldDefinition, RoutedFieldDefinition} from '..';
import {FieldPayload} from '../types';
import {computedFieldStore} from './computed-field-store';

describe('Field resolution', () => {
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
    computedFieldStore.clear();
    computedFieldStore.set(computedField1.id, computedField1);
  });

  test('navigates the entire field dependency tree', () => {
    const fieldPayload: FieldPayload = [computedField2];
    const {resolvedFields} = resolveFields(fieldPayload);
    const resolvedFieldIds = resolvedFields.map(field => field.id);
    expect(resolvedFieldIds.indexOf(computedField1.id) > -1).toBeTruthy();
    expect(resolvedFieldIds.indexOf(routedField1.id) > -1).toBeTruthy();
  });

  test('ensures that the location of field dependencies are before the parent computed function', () => {
    const fieldPayload: FieldPayload = [computedField2, routedField1, routedField2];
    const {resolvedFields} = resolveFields(fieldPayload);
    const resolvedFieldIds = resolvedFields.map(field => field.id);
    expect(resolvedFieldIds.indexOf(computedField1.id) < resolvedFieldIds.indexOf(computedField2.id)).toBeTruthy();
    expect(resolvedFieldIds.indexOf(routedField1.id) < resolvedFieldIds.indexOf(computedField2.id)).toBeTruthy();
  });

  test('identifies the set of non locally defined computedFunctions', () => {
    const fieldPayload: FieldPayload = [computedField2, routedField2];
    const {requestableFields} = resolveFields(fieldPayload);
    const requestableFieldIds = requestableFields.map(field => field.id);
    expect(requestableFields.length).toBe(2);
    expect(requestableFieldIds.indexOf(routedField2.id) > -1).toBeTruthy();
    expect(requestableFieldIds.indexOf(routedField1.id) > -1).toBeTruthy();
  });
});
