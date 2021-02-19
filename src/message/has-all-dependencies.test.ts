import {hasAllDependencies} from './has-all-dependencies';

describe('hasAllDependencies', () => {
  const data = {
    foo: 1,
    bar: 2,
    baz: 3,
  };

  it('returns true when all dependencies are present in the data', () => {
    const field = {
      id: 'fizz',
      computedFunction: () => null,
      dependencies: ['foo', {id: 'bar'}, 'baz'],
    };
    expect(hasAllDependencies(data, field)).toBeTruthy();
  });

  it('understands a dependency is not required if marked optional', () => {
    const field = {
      id: 'fizz',
      computedFunction: () => null,
      dependencies: ['foo', {id: 'buzz', optional: true}],
    };
    expect(hasAllDependencies(data, field)).toBeTruthy();
  });

  it('assume a dependency is required if not marked optional', () => {
    const field = {
      id: 'fizz',
      computedFunction: () => null,
      dependencies: ['foo', 'buzz'],
    };
    expect(hasAllDependencies(data, field)).toBeFalsy();
  });
});
