import { Page } from "@playwright/test";

export class RegisterFacePage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/register-face");
  }

  // Video element
  videoElement = () => this.page.locator("video");

  // Capture/Register button
  captureButton = () => this.page.getByRole("button", { name: /capture|register|scan|detect/i });

  // Cancel/Go Back button
  cancelButton = () => this.page.getByRole("button", { name: /cancel|go back|back/i });

  // Success message
  successMessage = () => this.page.locator("text=/success|registered|complete/i");

  // Error message
  errorMessage = () => this.page.locator("text=/error|failed|camera|permission/i");

  // Loading state
  loadingIndicator = () => this.page.locator("[role='status'], .spinner, [data-testid='loading']");

  // Face detection status
  faceDetectionStatus = () => this.page.locator("text=/detecting|detected|no face|face found/i");

  // Instructions text
  instructions = () => this.page.locator("text=/position|face|camera|light/i");

  async waitForVideoReady() {
    await this.videoElement().waitFor({ state: "visible" });
    // Give video time to load
    await this.page.waitForTimeout(1000);
  }

  async captureFace() {
    await this.captureButton().click();
  }

  async cancel() {
    await this.cancelButton().click();
  }

  async isLoading() {
    return await this.loadingIndicator().isVisible().catch(() => false);
  }
}
