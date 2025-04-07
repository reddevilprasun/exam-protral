import { convexAuth } from "@convex-dev/auth/server";
import Password from "@/convex/customProfile"
//import { MutationCtx } from "./_generated/server";

export const { auth, signIn, signOut, store, isAuthenticated } = convexAuth({
  providers: [Password],
  
});
