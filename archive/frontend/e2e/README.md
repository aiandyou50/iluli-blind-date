# E2E Visual Regression Tests

This directory contains end-to-end tests using Playwright for visual regression testing.

## Setup

The Playwright browsers are installed as part of the npm install process. If you need to install them manually:

```bash
npx playwright install
```

## Running Tests

### Run all E2E tests
```bash
npm run test:e2e
```

### Run tests with UI (interactive mode)
```bash
npm run test:e2e:ui
```

### Run tests in headed mode (see browser)
```bash
npm run test:e2e:headed
```

### Update visual snapshots (baselines)
```bash
npm run test:e2e:update-snapshots
```

## Test Files

- `visual.spec.ts` - Visual regression tests for key pages (Login, Feed, Profile, Matching)

## Visual Regression Testing

The visual tests capture screenshots of pages and compare them against baseline images stored in the `e2e/*.spec.ts-snapshots/` directory.

### How it works:

1. First run creates baseline screenshots
2. Subsequent runs compare against baselines
3. If differences are detected, the test fails
4. Review differences in the test report
5. Update baselines if changes are intentional

### Best Practices:

- Run tests in CI to catch unintended visual changes
- Always review visual diffs before updating baselines
- Use consistent viewport sizes for reliable comparisons
- Disable animations for stable screenshots
- Wait for network idle before capturing screenshots

## Test Coverage

Currently tested pages:
- ✅ Login Page (Desktop & Mobile views)
- ✅ Login Page Dark Mode
- ✅ Google Sign-in Button Rendering
- ⏭️ Feed Page (skipped - requires auth)
- ⏭️ Profile Page (skipped - requires auth)
- ⏭️ Matching Page (skipped - requires auth)

The skipped tests are provided as examples and would need authentication setup to run.

## Accessibility Tests

Basic accessibility tests are included:
- Keyboard navigation
- Color contrast checks

For comprehensive accessibility testing, consider using:
- `@axe-core/playwright` for automated accessibility audits
- Manual testing with screen readers

## CI Integration

The tests are configured to run in CI with:
- Automatic retries (2 retries on failure)
- Single worker (no parallel execution)
- HTML report generation
- Screenshots and traces on failure

## Configuration

See `playwright.config.ts` for detailed configuration including:
- Test directory
- Browser projects
- Timeouts
- Reporters
- Web server setup
