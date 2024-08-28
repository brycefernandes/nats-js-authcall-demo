import { WorkspaceUser } from "./types";

export async function verifyMockToken(
  token: string,
): Promise<WorkspaceUser | null> {
  try {
    // Decode the token (which is base64 encoded JSON in this mock implementation)
    const decodedToken = decodeURIComponent(
      Array.prototype.map
        .call(atob(token), (c) => {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join(""),
    );

    // Parse the decoded token into a user object
    const user = JSON.parse(decodedToken);

    // Return a WorkspaceUser object
    return {
      id: user.id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
    };
  } catch (error) {
    // If there's any error in decoding or parsing, return null
    console.error("Error validating mock token:", error);
    return null;
  }
}
