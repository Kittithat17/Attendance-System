import { Page } from "@playwright/test";

export class DashboardPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto("/dashboard");
  }

  // Page title/header
  pageTitle = () => this.page.locator("h1, [role='heading']");

  // User greeting
  userGreeting = () => this.page.locator("text=/welcome|hello|hi|dashboard/i");

  // Logout button
  logoutButton = () => this.page.getByRole("button", { name: /logout|sign out/i });

  // Check-in form elements
  checkinButton = () => this.page.getByRole("button", { name: /check[- ]?in|attendance/i });

  // Attendance history/list
  attendanceList = () => this.page.locator("[data-testid='attendance-list'], table, [role='table']");

  attendanceItems = () => this.page.locator("[data-testid='attendance-item'], tbody tr");

  // Register face button
  registerFaceButton = () => this.page.getByRole("link", { name: /register.*face|face.*register|upload.*face/i });

  // User info
  userEmail = () => this.page.locator("text=/[a-z0-9._%+-]+@[a-z0-9.-]+/i");

  // Navigation links
  dashboardLink = () => this.page.getByRole("link", { name: /dashboard|home/i });

  async logout() {
    await this.logoutButton().click();
  }

  async waitForPageLoad() {
    await this.pageTitle().waitFor({ state: "visible" });
  }

  async getAttendanceCount() {
    const items = await this.attendanceItems();
    return await items.count();
  }
}
