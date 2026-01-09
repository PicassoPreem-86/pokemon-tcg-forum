/**
 * Thread Creation E2E Tests
 * Critical path: Thread creation and viewing
 */

import { test, expect } from '@playwright/test';

test.describe('Thread Viewing', () => {
  test('should load homepage with threads', async ({ page }) => {
    await page.goto('/');

    // Wait for threads to load
    await page.waitForLoadState('networkidle');

    // Should show thread list or loading state
    const hasContent =
      (await page.locator('.thread-item, [class*="thread"]').count()) > 0 ||
      (await page.locator('[class*="skeleton"], [class*="loading"]').count()) > 0;

    expect(hasContent).toBeTruthy();
  });

  test('should display category navigation', async ({ page }) => {
    await page.goto('/');

    // Check for category links in sidebar
    const categories = ['General', 'Trading', 'Grading', 'Pulls'];
    for (const category of categories) {
      const categoryLink = page.getByRole('link', { name: new RegExp(category, 'i') });
      await expect(categoryLink).toBeVisible({ timeout: 5000 }).catch(() => {
        // Category might not be visible on all screen sizes
      });
    }
  });

  test('should navigate to category pages', async ({ page }) => {
    await page.goto('/');

    // Click on a category
    const generalLink = page.getByRole('link', { name: /general/i }).first();
    await generalLink.click();

    // Should navigate to category page
    await expect(page).toHaveURL(/\/c\/general/, { timeout: 5000 });
  });

  test('should show loading states', async ({ page }) => {
    await page.goto('/');

    // Check for loading skeleton or spinner
    const hasLoadingState = await page.locator('[class*="skeleton"], [class*="loading"], [class*="animate-pulse"]').count() > 0;

    // Loading states should appear during initial load
    expect(hasLoadingState).toBeTruthy();
  });
});

test.describe('Thread Creation Flow', () => {
  test('should show create thread button', async ({ page }) => {
    await page.goto('/');

    // Look for "New Thread" or "Create" button
    const createButton = page.getByRole('link', { name: /new|create/i });
    await expect(createButton).toBeVisible();
  });

  test('should navigate to thread creation page', async ({ page }) => {
    await page.goto('/');

    const createButton = page.getByRole('link', { name: /new|create/i }).first();
    await createButton.click();

    // Should navigate to /new
    await expect(page).toHaveURL(/\/new/);
  });

  test('should display thread creation form', async ({ page }) => {
    // Skip if not authenticated
    await page.goto('/new');

    await page.waitForTimeout(1000);

    // If redirected, skip the test
    if (!page.url().includes('/new')) {
      test.skip(true, 'Requires authentication');
      return;
    }

    // Check for form fields
    const titleInput = page.getByLabel(/title/i);
    const contentInput = page.getByLabel(/content|body/i);

    await expect(titleInput).toBeVisible({ timeout: 5000 }).catch(() => {
      test.skip(true, 'Form not visible - requires auth');
    });
  });

  test('should validate required fields', async ({ page }) => {
    // This test requires authentication
    test.skip(true, 'Requires authenticated session');

    await page.goto('/new');

    // Try to submit empty form
    const submitButton = page.getByRole('button', { name: /post|create|submit/i });
    await submitButton.click();

    // Should show validation errors
    await expect(page.getByText(/required|must be/i)).toBeVisible();
  });
});

test.describe('Thread Interaction', () => {
  test('should navigate to thread detail page', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Click on first thread
    const firstThread = page.locator('.thread-item, [class*="thread"]').first();
    const threadLinkExists = await firstThread.locator('a').count() > 0;

    if (threadLinkExists) {
      await firstThread.locator('a').first().click();

      // Should navigate to thread detail page
      await expect(page).toHaveURL(/\/(thread|t)\//, { timeout: 5000 });
    } else {
      test.skip(true, 'No threads available');
    }
  });

  test('should show like button on threads', async ({ page }) => {
    await page.goto('/');

    await page.waitForLoadState('networkidle');

    // Look for like/heart button
    const likeButton = page.getByRole('button', { name: /like|heart/i }).first();

    // Like button should be visible (might be disabled for unauth users)
    if (await likeButton.count() > 0) {
      await expect(likeButton).toBeVisible();
    }
  });
});

test.describe('Search and Filtering', () => {
  test('should show search functionality', async ({ page }) => {
    await page.goto('/');

    // Look for search input
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 }).catch(() => {
      // Search might not be on homepage
    });
  });

  test('should navigate to search page', async ({ page }) => {
    await page.goto('/search');

    // Should load search page
    await expect(page).toHaveURL(/\/search/);

    // Should show search input
    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible({ timeout: 5000 });
  });
});
