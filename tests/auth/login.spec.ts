//tests/auth/login.spec.ts
import { test, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";

test.describe("Login Flow", () => {
  test("✅ login success → dashboard", async ({ page }) => {
    const login = new LoginPage(page);
    //mock login (supabase)
    await page.route("**/*", async (route) => {
      const url = route.request().url();

      // mock login
      if (url.includes("/auth/v1/token")) {
        console.log("✅ MOCK LOGIN HIT");

        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({
            access_token: "fake-token",
            refresh_token: "fake-refresh",
            token_type: "bearer",
            expires_in: 3600,
            user: {
              id: "123",
              email: "test@gmail.com",
            },
          })
        });
      }
      if (url.includes("/rest/v1/profiles")) {
        console.log("✅ MOCK PROFILE HIT");

        return route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify([
            {
              face_descriptor: [0.1, 0.2, 0.3],
            },
          ]),
        });
      }

      return route.continue();
    });

    await login.goto();

    // ✅ เช็คก่อนว่าปุ่มมีจริง
    await expect(login.loginButton()).toBeVisible();

    await login.login("testd5@gmail.com", "hello1234");

    await expect(page).toHaveURL(/dashboard/);
  });

  test("🧠 login success but no face → register-face", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login("noface@gmail.com", "12345678");

    await expect(page).toHaveURL(/register-face/);
  });

  test("❌ login fail → show error", async ({ page }) => {
    const login = new LoginPage(page);

    await login.goto();
    await login.login("wrong@gmail.com", "wrongpass");

    await expect(login.errorText()).toBeVisible();
  });
});
