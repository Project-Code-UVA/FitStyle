import { createClient } from "@/lib/supabase/server";
import { updateSession } from "@/lib/supabase/proxy";
import { NextResponse, NextRequest } from "next/server";
export default async function proxy(request: NextRequest) {
  const response = await updateSession(request);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    !public_sites.some((site) => request.nextUrl.pathname.startsWith(site))
  ) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  return response;
}

const public_sites = ["/auth", "/auth/*"];

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - images - .svg, .png, .jpg, .jpeg, .gif, .webp
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
