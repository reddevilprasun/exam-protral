import { Password } from "@convex-dev/auth/providers/Password";
import { DataModel } from "./_generated/dataModel";
 
export default Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      firstName: params.firstName as string,
      lastName: params.lastName as string,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      lastLogin: Date.now(),
    };
  },
  // Optional: Add custom password validation if needed
  validatePasswordRequirements: (password: string) => {
    if (password.length < 8) {
      throw new Error("Password must be at least 8 characters long");
    }
    // Add any other validation rules you want
  }
});