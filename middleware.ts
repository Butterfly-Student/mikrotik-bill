import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Define protected routes and their required permissions
const protectedRoutes = {
	"/dashboard/admin": "users.view", // Admin dashboard requires basic admin access
	"/dashboard/admin/users": "users.view",
	"/dashboard/admin/roles": "roles.view",
	"/dashboard/admin/permissions": "permissions.view",
	"/dashboard/admin/settings": "settings.write",
	"/dashboard/pppoe": "pppoe.view", // PPPoE main page requires basic PPPoE access
	"/dashboard/pppoe/users": "pppoe.manage_users",
	"/dashboard/pppoe/active": "pppoe.view_active",
	"/dashboard/pppoe/profiles": "pppoe.manage_profiles",
};

export async function middleware(request: NextRequest) {
	const { pathname } = request.nextUrl;

	// Allow access to public pages and API routes
	if (
		pathname === "/login" ||
		pathname === "/register" ||
		pathname === "/unauthorized" ||
		pathname.startsWith("/api/") ||
		pathname.startsWith("/_next/") ||
		pathname === "/favicon.ico" ||
		pathname === '/test'||
		pathname === "/"
	) {
		return NextResponse.next();
	}

	// Check if user is authenticated
	const token = await getToken({
		req: request,
		secret: process.env.NEXTAUTH_SECRET,
	});

	if (!token) {
		// Redirect to login if not authenticated
		const loginUrl = new URL("/login", request.url);
		return NextResponse.redirect(loginUrl);
	}

	// Check if the route requires specific permissions
	const requiredPermission =
		protectedRoutes[pathname as keyof typeof protectedRoutes];

	if (requiredPermission) {
		// Get user permissions from token (we'll need to add this to JWT)
		const userPermissions = (token as any).permissions || [];
		const hasPermission = userPermissions.some(
			(p: any) => p.name === requiredPermission
		);

		if (!hasPermission) {
			console.log(
				`Access denied to ${pathname}. Required: ${requiredPermission}`
			);
			const unauthorizedUrl = new URL("/unauthorized", request.url);
			return NextResponse.redirect(unauthorizedUrl);
		}
	}

	return NextResponse.next();
}

export const config = {
	matcher: [
		/*
		 * Match all request paths except for the ones starting with:
		 * - api (API routes)
		 * - _next/static (static files)
		 * - _next/image (image optimization files)
		 * - favicon.ico (favicon file)
		 */
		"/((?!api|_next/static|_next/image|favicon.ico).*)",
	],
};
