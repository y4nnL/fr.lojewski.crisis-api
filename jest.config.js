module.exports = {
  globalSetup: './jest.setup.ts',
  globalTeardown: './jest.teardown.ts',
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/src/$1",
    "^~/(.*)": "<rootDir>/test/$1"
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
      'node_modules',
      'dist'
  ]
};
