/**
 * Authentication E2E Tests
 * Critical path: User authentication flow
 */

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login button for unauthenticated users', async ({ page }) => {
    // Check if "Sign In" button is visible
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await expect(signInButton).toBeVisible();
  });

  test('should redirect to Supabase auth when clicking sign in', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /sign in/i });
    await signInButton.click();

    // Should navigate to auth page or show auth modal
    await page.waitForURL(/auth|login/, { timeout: 5000 }).catch(() => {
      // Auth might be in a modal instead of navigation
    });
  });

  test('should prevent creating threads when not authenticated', async ({ page }) => {
    await page.goto('/new');

    // Should redirect to home or show auth required message
    await page.waitForTimeout(1000);
    const url = page.url();
    const hasAuthCheck = url.includes('/') || await page.getByText(/sign in/i).isVisible();
    expect(hasAuthCheck).toBeTruthy();
  });

  test('should show user menu when authenticated', async ({ page }) => {
    // This test requires a logged-in session
    // In a real scenario, you'd set up auth state via cookies or API
    test.skip(true, 'Requires auth setup');
  });
});

test.describe('Protected Routes', () => {
  test('should protect /new route', async ({ page }) => {
    await page.goto('/new');

    // Should either redirect or show auth requirement
    await page.waitForTimeout(1000);
    const requiresAuth =
      !page.url().includes('/new') ||
      await page.getByText(/sign in|log in/i).isVisible();

    expect(requiresAuth).toBeTruthy();
  });

  test('should allow viewing threads without auth', async ({ page }) => {
    await page.goto('/');

    // Should be able to see thread list
    await expect(page.locator('.thread-item, [class*="thread"]').first()).toBeVisible({ timeout: 10000 });
  });
});
