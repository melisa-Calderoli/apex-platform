import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;

  // Skip proxy for non-protected paths to avoid any issues
  const isAuthRoute = path === "/login";
  const isProtected = path.startsWith("/admin") || path.startsWith("/client");

  if (!isAuthRoute && !isProtected) {
    return NextResponse.next();
  }

  let response = NextResponse.next({ request });

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) =>
              request.cookies.set(name, value)
            );
            response = NextResponse.next({ request });
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();

    if (!user && isProtected) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (user && isAuthRoute) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, company_id")
        .eq("id", user.id)
        .single();

      if (profile?.role === "admin") {
        return NextResponse.redirect(new URL("/admin/dashboard", request.url));
      } else if (profile?.company_id) {
        return NextResponse.redirect(
          new URL(`/client/${profile.company_id}/dashboard`, request.url)
        );
      }
    }
  } catch (err) {
    console.error("Proxy error:", err);
  }

  return response;
}

export const config = {
  matcher: [
    "/login",
    "/admin/:path*",
    "/client/:path*",
  ],
};
