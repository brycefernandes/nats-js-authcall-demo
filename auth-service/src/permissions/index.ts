import defaultPermissions from "./defaultPermissions";
import { UserPermissions } from "../types";

// This function can be expanded to return different permission sets based on user ID or role
export function getPermissions(userId: string): UserPermissions["nats"] {
  // For now, we're always returning the default permissions
  // In the future, this could be adjusted based on user roles or other criteria
  return {
    ...defaultPermissions,
    pub: {
      ...defaultPermissions.pub,
      allow: defaultPermissions.pub.allow.map((subject) =>
        subject.replace("${userId}", userId),
      ),
    },
  };
}
