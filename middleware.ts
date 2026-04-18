//app/middleware.ts
import { createServerClient } from "@supabase/ssr";
import { NextResponse, NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isAuthPage =
    req.nextUrl.pathname.startsWith("/login") ||
    req.nextUrl.pathname.startsWith("/signup");

  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard");

  //ยังไม่ login → เข้า dashboard ไม่ได้
  if (!user && isDashboard) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  //login  ไม่ต้องกลับไป login/signup
  if (user && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return res;
}
export const config = {
    matcher: ["/dashboard/:path*", "/login", "/signup"],
  };