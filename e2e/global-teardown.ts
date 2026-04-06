/**
 * Global teardown for Playwright E2E tests
 *
 * This runs after all tests complete and can:
 * - Clean up test data
 * - Stop services
 * - Generate final reports
 */
async function globalTeardown() {
  // Log test completion
  console.log('🏁 Playwright E2E Tests complete');
}

export default globalTeardown;
