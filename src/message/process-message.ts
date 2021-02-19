import {hasAllDependencies} from './has-all-dependencies';
import {ProxySubscription} from '../proxy-subscription';
import {FieldSet} from '../data-point/resolve-fields';
import {Options} from '../types';
import {isComputedField} from '../type-guards';

export function processMessage(
  data: Record<string, any>,
  {originalFields, resolvedFields}: FieldSet,
  subscription: ProxySubscription,
  options: Options
): Record<string, any> {
  const message: Record<string, any> = {};
  const requestedFieldIds = new Set(originalFields.map(field => field.id));

  for (let i = 0, len = resolvedFields.length; i < len; i++) {
    const field = resolvedFields[i];

    // run the computed function and store it back in the source message
    if (isComputedField(field) && hasAllDependencies(data, field)) {
      data[field.id] = field.computedFunction(data, subscription, options);
    }

    // pair message down to explicitly requested fields
    if (requestedFieldIds.has(field.id) && data.hasOwnProperty(field.id)) {
      message[field.id] = data[field.id];
    }
  }

  return message;
}
