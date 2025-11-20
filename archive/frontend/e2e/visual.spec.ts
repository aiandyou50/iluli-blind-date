import { test, expect } from '@playwright/test';

/**
 * Visual Regression Tests for Iluli Dating Service
 * 
 * These tests capture screenshots of key pages and compare them against baselines
 * to detect unintended UI changes.
 * 
 * To update baselines: npx playwright test --update-snapshots
 */

test.describe('Visual Regression Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Set viewport to a consistent size
    await page.setViewportSize({ width: 1280, height: 720 });
  });

  test('Login Page - Desktop View', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for the logo to be visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Wait for language selector to be visible
    await expect(page.getByRole('button', { name: /🇰🇷|English|繁體中文|简体中文/ })).toBeVisible();
    
    // Take a screenshot
    await expect(page).toHaveScreenshot('login-page-desktop.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Login Page - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    
    // Navigate to login page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for the logo to be visible
    await expect(page.locator('h1')).toBeVisible();
    
    // Take a screenshot
    await expect(page).toHaveScreenshot('login-page-mobile.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });

  test('Login Page - Google Button Rendering', async ({ page }) => {
    // Navigate to login page
    await page.goto('/');
    
    // Wait for the page to be fully loaded
    await page.waitForLoadState('networkidle');
    
    // Wait for the Google sign-in button container
    const googleButton = page.locator('#google-signin-button');
    await expect(googleButton).toBeVisible();
    
    // Wait a bit for Google script to potentially render the button
    await page.waitForTimeout(2000);
    
    // Take a screenshot of the login card
    const loginCard = page.locator('div.bg-white.dark\\:bg-gray-800').first();
    await expect(loginCard).toHaveScreenshot('login-card-with-google-button.png', {
      animations: 'disabled',
    });
  });

  // Note: The following tests would require authentication
  // They are provided as examples but would need a way to mock/bypass auth in tests
  
  test.skip('Feed Page - with mock data', async ({ page: _page }) => {
    // This test would need to:
    // 1. Mock the authentication
    // 2. Mock the feed API response
    // 3. Navigate to /feed
    // 4. Wait for photos to load
    // 5. Take screenshot
    
    // Example implementation (requires auth setup):
    // await _page.goto('/feed');
    // await _page.waitForLoadState('networkidle');
    // await expect(_page.locator('[data-testid="photo-card"]').first()).toBeVisible();
    // await expect(_page).toHaveScreenshot('feed-page.png', {
    //   fullPage: true,
    //   animations: 'disabled',
    // });
  });

  test.skip('Profile Page - with mock data', async ({ page: _page }) => {
    // This test would need to:
    // 1. Mock the authentication
    // 2. Mock the profile API response
    // 3. Navigate to /profile
    // 4. Wait for profile data to load
    // 5. Take screenshot
    
    // Example implementation (requires auth setup):
    // await _page.goto('/profile');
    // await _page.waitForLoadState('networkidle');
    // await expect(_page.getByText('기본 정보')).toBeVisible();
    // await expect(_page).toHaveScreenshot('profile-page.png', {
    //   fullPage: true,
    //   animations: 'disabled',
    // });
  });

  test.skip('Matching Page - with mock data', async ({ page: _page }) => {
    // This test would need to:
    // 1. Mock the authentication
    // 2. Mock the matching deck API response
    // 3. Navigate to /matching
    // 4. Wait for card to load
    // 5. Take screenshot
    
    // Example implementation (requires auth setup):
    // await _page.goto('/matching');
    // await _page.waitForLoadState('networkidle');
    // await expect(_page.locator('button[aria-label="좋아요"]')).toBeVisible();
    // await expect(_page).toHaveScreenshot('matching-page.png', {
    //   fullPage: true,
    //   animations: 'disabled',
    // });
  });
});

test.describe('Accessibility Tests', () => {
  test('Login Page - Keyboard Navigation', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Tab through interactive elements
    await page.keyboard.press('Tab');
    
    // Language selector should be focused
    const languageSelector = page.getByRole('button', { name: /🇰🇷|English|繁體中文|简体中文/ });
    await expect(languageSelector).toBeFocused();
    
    // Tab again to reach the Google sign-in area
    await page.keyboard.press('Tab');
    
    // Check that focus outline is visible (basic check)
    await page.screenshot({ path: 'test-results/keyboard-navigation.png' });
  });

  test('Login Page - Color Contrast', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Get computed styles of key text elements
    const title = page.locator('h1').first();
    const titleColor = await title.evaluate((el) => {
      return window.getComputedStyle(el).color;
    });
    
    // This is a basic check - you'd want to calculate actual contrast ratios
    expect(titleColor).toBeTruthy();
  });
});

test.describe('Dark Mode Tests', () => {
  test('Login Page - Dark Mode', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Add dark class to html element to enable dark mode
    await page.evaluate(() => {
      document.documentElement.classList.add('dark');
    });
    
    // Wait a moment for styles to apply
    await page.waitForTimeout(500);
    
    // Take screenshot in dark mode
    await expect(page).toHaveScreenshot('login-page-dark-mode.png', {
      fullPage: true,
      animations: 'disabled',
    });
  });
});
