/**
 * API Services — barrel export
 *
 * All API modules are typed stubs. None are connected to a backend yet.
 * The frontend prototype continues to use local mock state in StoreContext.tsx.
 *
 * When the backend is ready:
 *   1. Implement the stub functions in each module using fetch() + JWT headers.
 *   2. Replace the corresponding local operations in StoreContext.tsx and
 *      reservationOperations.ts with calls to these modules.
 *   3. Remove the BOOMCLUB_owner_session and BOOMCLUB_employee_session
 *      localStorage keys — JWT should be stored in memory only.
 *
 * See FRONTEND_BACKEND_INTEGRATION_MAP.md for a file-by-file replacement guide.
 */

export * from "./auth";
export * from "./reservations";
export * from "./tables";
export * from "./employees";
export * from "./dashboard";
