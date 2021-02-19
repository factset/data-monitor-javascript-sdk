import {ComputedFieldDefinition, Field, RoutedFieldDefinition} from './types';

export function isComputedField(field: Field): field is ComputedFieldDefinition {
  return (<ComputedFieldDefinition>field).computedFunction !== undefined;
}

export function isRoutedField(field: Field): field is RoutedFieldDefinition {
  return (<RoutedFieldDefinition>field).endpoint !== undefined;
}
