# End-to-End Test Suite

This directory contains comprehensive Playwright end-to-end tests for the GitHub Profile Maker application.

## Test Structure

### Page Object Models (`pages/`)

- [`builder-page.ts`](pages/builder-page.ts) - Builder page interactions
- [`home-page.ts`](pages/home-page.ts) - Homepage interactions

### Test Files

| File                                                 | Description                           |
| ---------------------------------------------------- | ------------------------------------- |
| [`api.e2e.ts`](api.e2e.ts)                           | API integration tests                 |
| [`navigation.e2e.ts`](navigation.e2e.ts)             | Page navigation tests                 |
| [`visual.e2e.ts`](visual.e2e.ts)                     | Visual regression tests               |
| [`builder.e2e.ts`](builder.e2e.ts)                   | Builder workflow tests (positive)     |
| [`builder-negative.e2e.ts`](builder-negative.e2e.ts) | Builder edge cases and error handling |
| [`accessibility.e2e.ts`](accessibility.e2e.ts)       | WCAG compliance tests                 |
| [`responsive.e2e.ts`](responsive.e2e.ts)             | Responsive design tests               |
| [`cross-browser.e2e.ts`](cross-browser.e2e.ts)       | Cross-browser compatibility           |
| [`performance.e2e.ts`](performance.e2e.ts)           | Performance benchmarks                |

### Support Files

| File                                       | Description                 |
| ------------------------------------------ | --------------------------- |
| [`fixtures.ts`](fixtures.ts)               | Test fixtures and utilities |
| [`hooks.ts`](hooks.ts)                     | Custom test hooks           |
| [`global-setup.ts`](global-setup.ts)       | Global test setup           |
| [`global-teardown.ts`](global-teardown.ts) | Global test teardown        |

## Running Tests

### Run all tests

```bash
npm run e2e
```

### Run tests with UI

```bash
npm run e2e:ui
```

### Run tests in headed mode

```bash
npm run e2e:headed
```

### Run specific test file

```bash
npx playwright test e2e/builder.e2e.ts
```

### Run tests by tag

```bash
npx playwright test --grep "@positive"
```

### Generate HTML report

```bash
npm run e2e:report
```

## Browser Support

The test suite runs on the following browsers (configured in `playwright.config.ts`):

- Chromium (Desktop Chrome)
- Firefox (Desktop Firefox)
- WebKit (Desktop Safari)
- Mobile Chrome (Pixel 5)

## Test Coverage

### Critical User Workflows

- ✅ Homepage loading
- ✅ Builder page loading
- ✅ Username input handling
- ✅ Preview generation
- ✅ Markdown generation
- ✅ Theme switching
- ✅ Share functionality
- ✅ Templates dialog

### Negative Test Cases

- ✅ Invalid username handling
- ✅ Error handling
- ✅ Boundary conditions
- ✅ Race conditions
- ✅ Invalid state handling
- ✅ Performance under load

### Accessibility Tests

- ✅ Keyboard navigation
- ✅ Focus management
- ✅ ARIA attributes
- ✅ Color contrast
- ✅ Screen reader support
- ✅ Motion preferences

### Responsive Tests

- ✅ Mobile viewport (< 640px)
- ✅ Tablet viewport (640px - 1024px)
- ✅ Desktop viewport (> 1024px)
- ✅ Large desktop (> 1440px)
- ✅ Viewport transitions
- ✅ Touch interactions

### Performance Tests

- ✅ Page load times
- ✅ API response times
- ✅ Rendering performance
- ✅ Resource loading
- ✅ Memory management

## Best Practices

1. **Test Isolation**: Each test is independent and can run in parallel
2. **Proper Locators**: Use semantic locators (role, text) over CSS selectors
3. **Wait Strategies**: Use explicit waits over hardcoded timeouts
4. **Assertions**: Use specific, meaningful assertions
5. **Documentation**: Each test has clear description
6. **Page Objects**: Use POMs for reusable interactions

## CI/CD Integration

The tests are configured for CI/CD with:

- Retry logic for flaky tests (1 retry locally, 2 in CI)
- HTML and JSON reporters
- Screenshots on failure
- Video recording on failure
- Trace collection for debugging

## Notes

- Tests require the development server to be running
- Default timeout is 30 seconds per test
- Tests run sequentially (workers: 1) for stability
- Mobile tests use touch interactions
