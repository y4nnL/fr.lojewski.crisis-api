module.exports = {
  globalSetup: './jest.setup.ts',
  moduleNameMapper: {
    "^@/(.*)": "<rootDir>/src/$1"
  },
  preset: 'ts-jest',
  testEnvironment: 'node',
  testPathIgnorePatterns: [
      'node_modules',
      'dist'
  ]
};
