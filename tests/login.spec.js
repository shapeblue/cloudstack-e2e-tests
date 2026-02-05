import { test, expect } from '@playwright/test';

/**
 * CloudStack UI Login Tests
 */
test.describe('CloudStack Login', () => {
  
  test('should display login page', async ({ page }) => {
    // Navigate to CloudStack UI
    await page.goto('/client');
    
    // Check if login form is visible
    await expect(page.locator('input[name="username"]')).toBeVisible();
    await expect(page.locator('input[name="password"]')).toBeVisible();
    await expect(page.locator('button[type="submit"]')).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Navigate to CloudStack UI
    await page.goto('/client');
    
    // Fill in credentials (env vars will be used on real tests)
    await page.fill('input[name="username"]', process.env.CS_USERNAME || 'admin');
    await page.fill('input[name="password"]', process.env.CS_PASSWORD || 'password');
    
    // Optional: Select domain if needed
    // await page.fill('input[name="domain"]', '/');
    
    // Click login button
    await page.click('button[type="submit"]');
    
    // Wait for dashboard to load (selector will be adjusted)
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Verify user is logged in (check for logout button or user menu)
    // await expect(page.locator('[data-testid="user-menu"]')).toBeVisible();
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/client');
    
    // Try invalid credentials
    await page.fill('input[name="username"]', 'invalid_user');
    await page.fill('input[name="password"]', 'wrong_password');
    await page.click('button[type="submit"]');
    
    // Check for error message (selector will be adjusted)
    // await expect(page.locator('.error-message')).toBeVisible();
  });
  
});
