export default {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  collectCoverageFrom: [
    "db-schema.js",
    "db-services.js",
    "item-services.js",
    "message-services.js",
    "auth-middleware.js"
  ]
};
