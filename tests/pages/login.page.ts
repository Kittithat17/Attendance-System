//tests/pages/login.page.ts
import { Page } from "@playwright/test";

export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/login");
  }

  // ✅ ใช้ label (เสถียร)
  emailInput = () => this.page.getByTestId("email-input");
  passwordInput = () => this.page.getByTestId("password-input");

  //ใช้ role (ดีที่สุด)
  loginButton = () => this.page.getByRole("button", { name: /login/i });

  // ✅ error flexible (เพราะ backend message เปลี่ยนได้)
  errorText = () => this.page.locator("text=/login|invalid|error/i");

  async login(email: string, password: string) {
    await this.emailInput().fill(email);
    await this.passwordInput().fill(password);
    await this.loginButton().click();
  }
}
