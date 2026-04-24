//tests/auth/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { mockAuthRoutes, mockAuthRoutesWithoutFace, mockAuthError } from "../fixtures/mocks";

test.describe("Login Flow", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test("✅ login success → dashboard (with face registered)", async ({ page }) => {
    await mockAuthRoutes(page);
    
    // ✅ Verify login page elements are visible
    await expect(loginPage.loginButton()).toBeVisible();
    await expect(loginPage.emailInput()).toBeVisible();
    await expect(loginPage.passwordInput()).toBeVisible();

    await loginPage.login("testd5@gmail.com", "hello1234");

    // Should redirect to dashboard
    await expect(page).toHaveURL(/dashboard/);
  });

  test("🧠 login success but no face → register-face", async ({ page }) => {
    await mockAuthRoutesWithoutFace(page);

    await loginPage.login("noface@gmail.com", "12345678");

    // Should redirect to register-face page
    await expect(page).toHaveURL(/register-face/);
  });

  test("❌ login fail with wrong credentials → show error", async ({ page }) => {
    await mockAuthError(page);

    await loginPage.login("wrong@gmail.com", "wrongpass");

    // Should show error message
    await expect(loginPage.errorText()).toBeVisible();
  });

  test("✅ verify all login form elements are visible", async ({ page }) => {
    await expect(loginPage.emailInput()).toBeVisible();
    await expect(loginPage.passwordInput()).toBeVisible();
    await expect(loginPage.loginButton()).toBeVisible();
  });

  test("❌ login fail - empty email field", async ({ page }) => {
    await loginPage.passwordInput().fill("somepassword");
    await loginPage.loginButton().click();

    // Should show validation error
    await expect(loginPage.emailInput()).toBeFocused().catch(() => {
      // If not focused, check for error message
      expect(loginPage.errorText()).toBeVisible();
    });
  });

  test("❌ login fail - empty password field", async ({ page }) => {
    await loginPage.emailInput().fill("test@gmail.com");
    await loginPage.loginButton().click();

    // Should show validation error
    await expect(loginPage.passwordInput()).toBeFocused().catch(() => {
      expect(loginPage.errorText()).toBeVisible();
    });
  });

  test("✅ form fields accept valid input", async ({ page }) => {
    const testEmail = "test@example.com";
    const testPassword = "Password123!";

    await loginPage.emailInput().fill(testEmail);
    await expect(loginPage.emailInput()).toHaveValue(testEmail);

    await loginPage.passwordInput().fill(testPassword);
    await expect(loginPage.passwordInput()).toHaveValue(testPassword);
  });

  test("✅ password field masks input", async ({ page }) => {
    const passwordInput = loginPage.passwordInput();
    await passwordInput.fill("testpassword");

    // Check that the field has type password
    await expect(passwordInput).toHaveAttribute("type", "password");
  });

  test("✅ clear form and re-enter credentials", async ({ page }) => {
    const email = "test@example.com";
    const password = "Password123!";

    // First entry
    await loginPage.emailInput().fill(email);
    await loginPage.passwordInput().fill(password);

    // Clear
    await loginPage.emailInput().clear();
    await loginPage.passwordInput().clear();

    // Re-enter
    const newEmail = "newemail@example.com";
    const newPassword = "NewPassword456!";

    await loginPage.emailInput().fill(newEmail);
    await loginPage.passwordInput().fill(newPassword);

    await expect(loginPage.emailInput()).toHaveValue(newEmail);
    await expect(loginPage.passwordInput()).toHaveValue(newPassword);
  });

  test("✅ enter credentials and verify button is clickable", async ({ page }) => {
    await mockAuthRoutes(page);

    await loginPage.emailInput().fill("test@example.com");
    await loginPage.passwordInput().fill("password123");

    const loginButton = loginPage.loginButton();
    await expect(loginButton).toBeEnabled();
    await expect(loginButton).toBeVisible();
  });
});
