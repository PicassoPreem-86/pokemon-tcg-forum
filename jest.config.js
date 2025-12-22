/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  // Use node for server actions, jsdom for React hooks
  testEnvironment: 'node',
  roots: ['<rootDir>/lib'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.test.tsx'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        jsx: 'react',
      },
    }],
  },
  collectCoverageFrom: [
    'lib/**/*.{ts,tsx}',
    '!lib/**/*.d.ts',
  ],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironmentOptions: {
    customExportConditions: [''],
  },
  // Use different environments for different test files
  projects: [
    {
      displayName: 'server',
      testEnvironment: 'node',
      testMatch: ['**/__tests__/**/*.test.ts'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            module: 'commonjs',
            esModuleInterop: true,
          },
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
    },
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: ['**/__tests__/**/*.test.tsx'],
      transform: {
        '^.+\\.tsx?$': ['ts-jest', {
          tsconfig: {
            module: 'commonjs',
            esModuleInterop: true,
            jsx: 'react',
            isolatedModules: true,
          },
        }],
      },
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/$1',
      },
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      globals: {
        'ts-jest': {
          tsconfig: {
            jsx: 'react',
          },
        },
      },
    },
  ],
};

module.exports = config;
