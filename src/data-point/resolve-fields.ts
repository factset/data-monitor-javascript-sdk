import {Field, FieldPayload} from '../types';
import {computedFieldStore} from './computed-field-store';
import {normalizeFieldPayload} from './normalize-field-payload';
import {isComputedField} from '../type-guards';

export interface FieldSet {
  originalFields: Field[];
  resolvedFields: Field[];
  requestableFields: Field[];
}

export function resolveFields(payload: FieldPayload): FieldSet {
  const normalizedFields = normalizeFieldPayload(payload);
  const {requestableFields, computedFields} = resolveDependencies(normalizedFields);
  return {
    originalFields: normalizedFields,
    resolvedFields: [...requestableFields, ...computedFields],
    requestableFields,
  };
}

function resolveDependencies(fields: Field[]) {
  const computedFields = new Map<string, Field>();
  const requestableFields = new Map<string, Field>();

  // recursively step through the field dependency tree in order to identify the full fieldset
  function _resolve(computed: Map<string, Field>, nonComputed: Map<string, Field>, dependency: Field[]) {
    let deps: Field[] = [];
    dependency.forEach(field => {
      const entry = computedFieldStore.get(field.id) || field;
      if (isComputedField(entry)) {
        computed.set(entry.id, entry);
      } else {
        nonComputed.set(entry.id, entry);
      }

      if (entry.dependencies) {
        deps = [...deps, ...normalizeFieldPayload(entry.dependencies as FieldPayload)];
      }
    });

    if (deps.length) {
      _resolve(computed, nonComputed, deps);
    }
  }

  _resolve(computedFields, requestableFields, fields);
  return {
    // reverse the computedFields to ensure a field's dependencies are processed first
    computedFields: Array.from(computedFields)
      .map(([_, field]) => field)
      .reverse(),
    requestableFields: Array.from(requestableFields).map(([_, field]) => field),
  };
}
