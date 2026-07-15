/**
 * API Service: Dashboard
 *
 * The Owner dashboard derives all its statistics from the already-loaded
 * reservations and floorTables arrays — no separate dashboard endpoint is
 * required as long as the frontend pre-loads both collections on startup.
 *
 * PREFERRED APPROACH:
 *   Load reservations + floorTables via their respective API modules on
 *   app mount. The DashboardOverview component computes all stats locally
 *   using useMemo(). This keeps the dashboard reactive to real-time Socket.IO
 *   updates without needing a dedicated polling endpoint.
 *
 * OPTIONAL BACKEND ENDPOINT (for initial load optimization only):
 *
 *   GET /api/dashboard/summary
 *     Returns: DashboardSummary (pre-computed counts, avoids two round-trips)
 *     Used by: DashboardOverview.tsx on first load only.
 *     Authorization: Owner only.
 *
 * This endpoint is NOT required for the MVP. Implement only if the separate
 * reservation + table loads become a performance concern.
 */

export interface DashboardSummary {
  reservations: {
    incoming: number;    // Pending + Confirmed
    waiting: number;     // Checked In
    seated: number;      // Seated
    completed: number;   // Completed
    cancelled: number;   // Cancelled
  };
  tables: {
    available: number;
    waiting: number;
    occupied: number;
    special: number;
    outOfService: number;
    total: number;
  };
}

// ─── Stub (not connected) ─────────────────────────────────────────────────────

export const dashboardApi = {
  /**
   * Optional summary endpoint — only implement if needed for performance.
   * Currently all stats are derived client-side from loaded data.
   */
  getSummary: async (): Promise<DashboardSummary> => {
    throw new Error("dashboardApi.getSummary: backend not yet connected (optional endpoint)");
  },
};
