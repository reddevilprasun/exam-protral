import { convexAuthNextjsMiddleware, createRouteMatcher, nextjsMiddlewareRedirect } from "@convex-dev/auth/nextjs/server";
 
const isSignInPage = createRouteMatcher(["/signIn", "/signUp"]);
const isProtectedRoute = createRouteMatcher(["/dashboard(.*)", "/admin(.*)", "/profile(.*)", "/settings(.*)", "create-university(.*)", "/create-course(.*)", "/create-batch(.*)", "/create-assignment(.*)", "/create-exam(.*)", "/create-question(.*)"]);
 
export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  if (isSignInPage(request) && (await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/dashboard");
  }
  if (isProtectedRoute(request) && !(await convexAuth.isAuthenticated())) {
    return nextjsMiddlewareRedirect(request, "/signIn");
  }
});
 
export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};