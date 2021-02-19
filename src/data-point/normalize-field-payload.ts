import {FieldPayload, Field} from '../types';

export function normalizeFieldPayload(fields?: FieldPayload): Field[] {
  const normalizedFields: Array<string | Field | undefined> = Array.isArray(fields) ? fields : [fields];
  return normalizedFields.map(field => (typeof field === 'string' ? {id: field} : field)) as Field[];
}
