// Utility to decode JWT and extract userId
import { jwtDecode } from "jwt-decode";

export function getUserIdFromToken(token: string): string | null {
  try {
    const decoded: any = jwtDecode(token);
    // Adjust the property name based on your backend's JWT payload
    return decoded.id || decoded._id || null;
  } catch (e) {
    return null;
  }
}

