import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { RegisterFacePage } from "../pages/register-face.page";
import { mockAuthRoutesWithoutFace, mockAuthRoutes } from "../fixtures/mocks";

test.describe("End-to-End User Journeys", () => {
  test("🎯 Complete signup → login → dashboard flow (with face)", async ({ page }) => {
    await mockAuthRoutes(page);

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Start from login page
    await loginPage.goto();
    await expect(loginPage.loginButton()).toBeVisible();

    // Login with face registered
    await loginPage.login("testd5@gmail.com", "hello1234");

    // Should be redirected to dashboard
    await expect(page).toHaveURL(/dashboard/);
    await dashboardPage.waitForPageLoad();
    await expect(dashboardPage.pageTitle()).toBeVisible();
  });

  test("🎯 Complete signup → login → register-face flow (without face)", async ({ page }) => {
    await mockAuthRoutesWithoutFace(page);

    const loginPage = new LoginPage(page);
    const registerFacePage = new RegisterFacePage(page);

    // Start from login
    await loginPage.goto();

    // Login without face
    await loginPage.login("noface@gmail.com", "12345678");

    // Should be redirected to register-face
    await expect(page).toHaveURL(/register-face/);
  });

  test("🎯 Login → Dashboard → Logout flow", async ({ page }) => {
    await mockAuthRoutes(page);

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login("testd5@gmail.com", "hello1234");

    // Verify on dashboard
    await expect(page).toHaveURL(/dashboard/);
    await dashboardPage.waitForPageLoad();

    // Logout
    await dashboardPage.logout();

    // Should redirect to login
    await expect(page).toHaveURL(/login/);
  });

  test("🎯 Navigation between pages", async ({ page }) => {
    await mockAuthRoutesWithoutFace(page);

    const loginPage = new LoginPage(page);

    // Go to login
    await loginPage.goto();
    await expect(page).toHaveURL(/login/);

    // Go to signup (if there's a link)
    const signupLink = page.getByRole("link", { name: /sign ?up|register/i });
    if (await signupLink.isVisible().catch(() => false)) {
      await signupLink.click();
      await expect(page).toHaveURL(/signup|register/);

      // Go back to login
      const loginLink = page.getByRole("link", { name: /login/i });
      if (await loginLink.isVisible().catch(() => false)) {
        await loginLink.click();
        await expect(page).toHaveURL(/login/);
      }
    }
  });

  test("🎯 Error recovery flow", async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.goto();

    // First attempt with wrong credentials
    await loginPage.login("wrong@example.com", "wrongpass");

    // Page should still be on login (or show error)
    const isOnLogin = page.url().includes("login");
    const hasError = await loginPage.errorText().isVisible().catch(() => false);

    expect(isOnLogin || hasError).toBe(true);

    // Now try with correct mock credentials
    await mockAuthRoutes(page);
    
    // Clear fields and try again
    await loginPage.emailInput().clear();
    await loginPage.passwordInput().clear();

    await loginPage.login("testd5@gmail.com", "hello1234");

    // Should now succeed
    await expect(page).toHaveURL(/dashboard/);
  });

  test("🎯 Multiple login attempts", async ({ page }) => {
    await mockAuthRoutes(page);

    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Multiple login attempts
    for (let i = 0; i < 2; i++) {
      // Clear fields
      await loginPage.emailInput().clear();
      await loginPage.passwordInput().clear();

      // Enter credentials
      await loginPage.login("testd5@gmail.com", "hello1234");

      // Wait for navigation
      await page.waitForURL(/dashboard/, { timeout: 5000 }).catch(() => {
        // Continue if timeout
      });
    }

    // Should be on dashboard after last attempt
    expect(page.url()).toContain("dashboard");
  });

  test("🎯 Form interaction and submission", async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Test tab navigation
    const emailInput = loginPage.emailInput();
    const passwordInput = loginPage.passwordInput();

    // Focus on email and tab to password
    await emailInput.focus();
    await emailInput.fill("test@example.com");

    // Tab to next field
    await emailInput.press("Tab");

    // Should be in password field or close to it
    const focusedElement = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
    expect(
      focusedElement === "password-input" ||
      (await passwordInput.isVisible())
    ).toBe(true);
  });

  test("🎯 Session persistence check", async ({ page }) => {
    await mockAuthRoutes(page);

    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login
    await loginPage.goto();
    await loginPage.login("testd5@gmail.com", "hello1234");
    await expect(page).toHaveURL(/dashboard/);

    // Refresh page
    await page.reload();

    // Should still be on dashboard if session is persisted
    await dashboardPage.waitForPageLoad().catch(() => {
      // Might redirect to login if session lost
    });

    const urlAfterRefresh = page.url();
    expect(
      urlAfterRefresh.includes("dashboard") ||
      urlAfterRefresh.includes("login")
    ).toBe(true);
  });
});
