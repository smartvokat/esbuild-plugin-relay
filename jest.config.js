export default {
  roots: ["<rootDir>/src"],
  testMatch: ["**/__tests__/**/*.+(ts)", "**/?(*.)+(spec|test).+(ts)"],
  transform: {
    "^.+\\.(ts)$": "ts-jest",
  },
};
