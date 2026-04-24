import { Page } from "@playwright/test";

export class SignupPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/signup");
  }

  // Form fields using test IDs
  fullNameInput = () => this.page.getByTestId("fullname-input");
  emailInput = () => this.page.getByTestId("email-input");
  passwordInput = () => this.page.getByTestId("password-input");
  confirmPasswordInput = () => this.page.getByTestId("confirm-password-input");

  // Button using role
  signupButton = () => this.page.getByRole("button", { name: /Create Account/i });

  // Error message
  errorText = () => this.page.locator("text=/error|invalid|required|password|email/i");

  // Success redirect check
  async signup(fullName: string, email: string, password: string, confirmPassword: string) {
    await this.fullNameInput().fill(fullName);
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.confirmPasswordInput().fill(confirmPassword);
    await this.signupButton().click();
  }
}
