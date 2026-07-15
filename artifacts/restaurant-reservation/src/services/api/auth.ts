/**
 * API Service: Authentication
 *
 * This module is a typed stub for the future REST API integration.
 * Currently the frontend uses local mock state (StoreContext.tsx).
 *
 * REPLACEMENT STRATEGY:
 *   Replace the mock login functions in StoreContext.tsx with calls to
 *   the functions exported from this file. Store the returned JWT in
 *   memory (not localStorage) and attach it to every subsequent request.
 *
 * ─────────────────────────────────────────────────────────────────────
 * ENDPOINTS (to be implemented in backend)
 * ─────────────────────────────────────────────────────────────────────
 *
 *   POST /api/auth/owner/login
 *     Body:    { username: string; password: string }
 *     Returns: { token: string; user: { username: string } }
 *
 *   POST /api/auth/employee/login
 *     Body:    { username: string; password: string }
 *     Returns: { token: string; employee: { id, name, username, role } }
 *     Errors:  401 { error: "INVALID_CREDENTIALS" | "ACCOUNT_INACTIVE" }
 *
 *   GET /api/auth/me
 *     Headers: Authorization: Bearer <token>
 *     Returns: { type: "owner" | "employee"; user: OwnerUser | EmployeeUser }
 *
 *   POST /api/auth/logout
 *     Headers: Authorization: Bearer <token>
 *     Returns: { success: true }
 */

export interface OwnerLoginRequest {
  username: string;
  password: string;
}

export interface OwnerLoginResponse {
  token: string;
  user: { username: string };
}

export interface EmployeeLoginRequest {
  username: string;
  password: string;
}

export interface EmployeeLoginResponse {
  token: string;
  employee: {
    id: string;
    name: string;
    username: string;
    role: "Owner" | "Doorman" | "Waiter";
  };
}

export interface AuthError {
  error: "INVALID_CREDENTIALS" | "ACCOUNT_INACTIVE" | "UNAUTHORIZED";
  message: string;
}

// ─── Stub implementations (not connected) ────────────────────────────────────
// Replace these with real fetch() calls when the backend is ready.

export const authApi = {
  /**
   * Owner login — currently delegated to OwnerAuthState.login() in StoreContext.
   * Future: POST /api/auth/owner/login
   */
  ownerLogin: async (_req: OwnerLoginRequest): Promise<OwnerLoginResponse> => {
    throw new Error("authApi.ownerLogin: backend not yet connected");
  },

  /**
   * Employee login — currently delegated to EmployeeAuthState.login() in StoreContext.
   * Future: POST /api/auth/employee/login
   */
  employeeLogin: async (_req: EmployeeLoginRequest): Promise<EmployeeLoginResponse> => {
    throw new Error("authApi.employeeLogin: backend not yet connected");
  },

  /**
   * Get current session — not currently used (session is in localStorage).
   * Future: GET /api/auth/me
   */
  me: async (): Promise<OwnerLoginResponse["user"] | EmployeeLoginResponse["employee"]> => {
    throw new Error("authApi.me: backend not yet connected");
  },
};
