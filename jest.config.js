module.exports = {
  collectCoverageFrom: [
    'src/**/{!(index|main),}.ts'
  ],
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
    'dist',
    'test'
  ],
  silent: false,
  verbose: false,
};
