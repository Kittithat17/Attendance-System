import { Page, Route } from "@playwright/test";

export interface MockUser {
  id: string;
  email: string;
  password: string;
  fullName?: string;
  hasFace: boolean;
}

export const MOCK_USERS = {
  withFace: {
    id: "user-with-face",
    email: "testd5@gmail.com",
    password: "hello1234",
    fullName: "Test User",
    hasFace: true,
  },
  withoutFace: {
    id: "user-no-face",
    email: "noface@gmail.com",
    password: "12345678",
    fullName: "No Face User",
    hasFace: false,
  },
  newUser: {
    id: "new-user",
    email: "newuser@gmail.com",
    password: "NewPass123!",
    fullName: "New User",
    hasFace: false,
  },
};

export async function mockAuthRoutes(page: Page) {
  await page.route("**/*", async (route: Route) => {
    const url = route.request().url();

    // Mock login
    if (url.includes("/auth/v1/token")) {
      const body = route.request().postData();
      const isLoginRequest = body?.includes("email");

      if (isLoginRequest) {
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
              email: "testd5@gmail.com",
            },
          }),
        });
      }
    }

    // Mock profile fetch
    if (url.includes("/rest/v1/profiles")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "123",
            face_descriptor: [0.1, 0.2, 0.3],
          },
        ]),
      });
    }

    // Mock attendance
    if (url.includes("/rest/v1/attendance")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    }

    return route.continue();
  });
}

export async function mockAuthRoutesWithoutFace(page: Page) {
  await page.route("**/*", async (route: Route) => {
    const url = route.request().url();

    if (url.includes("/auth/v1/token")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          access_token: "fake-token",
          refresh_token: "fake-refresh",
          token_type: "bearer",
          expires_in: 3600,
          user: {
            id: "456",
            email: "noface@gmail.com",
          },
        }),
      });
    }

    if (url.includes("/rest/v1/profiles")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    }

    if (url.includes("/rest/v1/attendance")) {
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      });
    }

    return route.continue();
  });
}

export async function mockAuthError(page: Page) {
  await page.route("**/*auth*", async (route: Route) => {
    const url = route.request().url();

    if (url.includes("/auth/v1/token")) {
      return route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          error: "invalid_grant",
          error_description: "Invalid credentials",
        }),
      });
    }

    return route.continue();
  });
}
