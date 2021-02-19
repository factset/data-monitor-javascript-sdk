import {Field, DependencyFieldDefinition} from '../types';

export function hasAllDependencies(data: Record<string, any>, field: Field) {
  const dependencies = field.dependencies;
  if (dependencies?.length) {
    for (let i = 0, iLen = dependencies.length; i < iLen; i++) {
      const dependency = (typeof dependencies[i] === 'string'
        ? {id: dependencies[i]}
        : dependencies[i]) as DependencyFieldDefinition;
      if (!dependency.optional && !data.hasOwnProperty(dependency.id)) {
        return false;
      }
    }
  }

  return true;
}
