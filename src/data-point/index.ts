import {sendDataPointGet, sendDataPointRegister} from '../platforms/web/events';
import {Field, FieldPayload} from '../types';
import {normalizeFieldPayload} from './normalize-field-payload';
import {computedFieldStore} from './computed-field-store';
import {isComputedField} from '../type-guards';

interface PendingRequest {
  resolve: (fields: Field[]) => void;
  requestedFields: Field[];
}

export const pendingRequests = new Map<string, PendingRequest>();

let actionCounter = 0;

class DataPoint {
  public get(fields?: FieldPayload): Promise<Field[]> {
    const actionId = `dataPoint:${++actionCounter}`;
    const normalizedFields = normalizeFieldPayload(fields || []);

    // remove any locally known computedFunctions from the request
    const predicate = (field: Field) => !computedFieldStore.has(field.id);
    const response = new Promise<Field[]>(resolve => {
      pendingRequests.set(actionId, {
        resolve,
        requestedFields: normalizedFields,
      });
    });

    const requiredFields = this.filterFields(normalizedFields, predicate);
    sendDataPointGet(actionId, requiredFields.length ? requiredFields : undefined);
    return response;
  }

  public register(fields: FieldPayload): void {
    const normalizedFields = normalizeFieldPayload(fields);
    const predicate = (field: Field) => {
      // store the computed functions locally while filtering them out of the request
      if (isComputedField(field)) {
        computedFieldStore.set(field.id, field);
        return false;
      }

      return true;
    };

    const requiredFields = this.filterFields(normalizedFields, predicate);
    sendDataPointRegister(requiredFields);
  }

  private filterFields(fields: Field[], predicate: (field: Field) => boolean): Field[] {
    return fields.reduce((requiredFields: Field[], field: Field) => {
      if (predicate(field)) {
        requiredFields.push(field);
      }

      return requiredFields;
    }, []);
  }
}

export const dataPoint = new DataPoint();

export function resolveDataPointGet(actionId: string, response: string) {
  const {resolve, requestedFields} = pendingRequests.get(actionId) || {};
  if (resolve) {
    const responseFields = JSON.parse(response) as Field[];

    // pad the response with any locally registered computed fields
    requestedFields!.forEach(field => {
      if (computedFieldStore.has(field.id)) {
        responseFields.push(computedFieldStore.get(field.id)!);
      }
    });

    resolve(responseFields);
    pendingRequests.delete(actionId);
  }
}
