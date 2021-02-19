// For a detailed explanation regarding each configuration property, visit:
// https://jestjs.io/docs/en/configuration.html

module.exports = {
  // A set of global variables that need to be available in all test environments
  globals: {
    'ts-jest': {},
  },

  preset: 'ts-jest',
  
  transform: {
    '^.+\\.(js|jsx)?$': 'babel-jest'
  },

  // The test environment that will be used for testing
  testEnvironment: 'node',
};
