// Utility to decode JWT and extract userId
import jwt_decode from "jwt-decode";

export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded: any = jwt_decode(token);
    // Adjust the property name based on your backend's JWT payload
    return decoded.id || decoded._id || null;
  } catch (e) {
    return null;
  }
}
