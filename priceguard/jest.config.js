module.exports = {
  testEnvironment: "node",
  testMatch: ["**/__tests__/**/*.test.js"],
  // Coverage is scoped to pure business logic. email.js and supabase.js are
  // thin wrappers around external APIs (Resend, Supabase) — better suited
  // to integration tests than unit-test coverage targets.
  collectCoverageFrom: ["lib/mockPriceFeed.js"],
  coverageThreshold: {
    global: {
      lines: 70,
    },
  },
};
