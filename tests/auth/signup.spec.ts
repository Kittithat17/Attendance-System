import { test, expect } from "@playwright/test";
import { SignupPage } from "../pages/signup.page";
import { mockAuthRoutes } from "../fixtures/mocks";

test.describe("Signup Flow", () => {
  let signupPage: SignupPage;

  test.beforeEach(async ({ page }) => {
    signupPage = new SignupPage(page);
    await mockAuthRoutes(page);
    await signupPage.goto();
  });

  test("✅ signup success with valid data", async ({ page }) => {
    await expect(signupPage.signupButton()).toBeVisible();

    await signupPage.signup(
      "John Doe",
      "johndoe@gmail.com",
      "SecurePass123!",
      "SecurePass123!"
    );

    // Should redirect to login or dashboard after signup
    await expect(page).toHaveURL(/login|dashboard|register-face/);
  });

  test("❌ signup fail - password mismatch", async ({ page }) => {
    await signupPage.signup(
      "Jane Doe",
      "janedoe@gmail.com",
      "Password123!",
      "DifferentPass123!"
    );

    // Should show error about password mismatch
    await expect(signupPage.errorText()).toBeVisible();
  });

  test("❌ signup fail - invalid email format", async ({ page }) => {
    await signupPage.signup(
      "Test User",
      "invalidemail",
      "ValidPass123!",
      "ValidPass123!"
    );

    // Should show email validation error
    await expect(signupPage.errorText()).toBeVisible();
  });

  test("❌ signup fail - weak password", async ({ page }) => {
    await signupPage.signup(
      "Test User",
      "test@gmail.com",
      "weak",
      "weak"
    );

    // Should show password requirement error
    await expect(signupPage.errorText()).toBeVisible();
  });

  test("❌ signup fail - missing required fields", async ({ page }) => {
    // Try to submit without filling anything
    await signupPage.signupButton().click();

    // Should show validation error
    await expect(signupPage.errorText()).toBeVisible();
  });

  test("✅ verify all form fields are visible", async ({ page }) => {
    await expect(signupPage.fullNameInput()).toBeVisible();
    await expect(signupPage.emailInput()).toBeVisible();
    await expect(signupPage.passwordInput()).toBeVisible();
    await expect(signupPage.confirmPasswordInput()).toBeVisible();
    await expect(signupPage.signupButton()).toBeVisible();
  });

  test("✅ form fields accept valid input", async ({ page }) => {
    const testData = {
      name: "Valid User",
      email: "valid@example.com",
      password: "ValidPass123!",
    };

    await signupPage.fullNameInput().fill(testData.name);
    await expect(signupPage.fullNameInput()).toHaveValue(testData.name);

    await signupPage.emailInput().fill(testData.email);
    await expect(signupPage.emailInput()).toHaveValue(testData.email);

    await signupPage.passwordInput().fill(testData.password);
    await expect(signupPage.passwordInput()).toHaveValue(testData.password);

    await signupPage.confirmPasswordInput().fill(testData.password);
    await expect(signupPage.confirmPasswordInput()).toHaveValue(testData.password);
  });
});
