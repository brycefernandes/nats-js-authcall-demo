import type { WorkspaceUser } from "../types";

export async function verifyMockToken(
  token: string,
): Promise<WorkspaceUser | null> {
  try {
    const decodedToken = decodeURIComponent(
      Array.prototype.map
        .call(atob(token), (c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    const user = JSON.parse(decodedToken);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
    };
  } catch (error) {
    return null;
  }
}
