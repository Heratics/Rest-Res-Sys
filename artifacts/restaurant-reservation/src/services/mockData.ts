export type ReservationStatus = "Pending" | "Confirmed" | "Checked In" | "Seated" | "Completed" | "Cancelled";
export type EmployeeRole = "Owner" | "Doorman" | "Waiter";
export type EmployeeStatus = "Active" | "Inactive";

export interface Customer {
  id: string;
  name: string;
  phone: string;
}

export interface Reservation {
  id: string;
  confirmationNumber: string;
  customer: Customer;
  guests: number;
  specialRequests?: string;
  status: ReservationStatus;
  createdAt: string;
  // Operational timestamps
  assignedAt?: string;
  seatedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  // Assigned table info (denormalized for history — preserved after table is released)
  assignedTableId?: string;
  assignedTableNumber?: string;
  assignedFloor?: number;
}

export interface Table {
  id: string;
  number: string;
  capacity: number;
  status: "Available" | "Reserved" | "Occupied";
  reservationId?: string;
}

export interface Employee {
  id: string;
  name: string;
  username: string;
  phone: string;
  role: EmployeeRole;
  status: EmployeeStatus;
  dateAdded: string;
  password?: string; // mock only — backend will handle auth properly
}

export const mockCustomers: Customer[] = [
  { id: "c1", name: "Eleanor Vance",   phone: "+962 6 555 0101" },
  { id: "c2", name: "Marcus Sterling", phone: "+962 6 555 0102" },
  { id: "c3", name: "Sophia Laurent",  phone: "+962 6 555 0103" },
  { id: "c4", name: "James Holden",    phone: "+962 6 555 0104" },
  { id: "c5", name: "Isabella Rossi",  phone: "+962 6 555 0105" },
];

const _n = Date.now();

export let mockReservations: Reservation[] = [
  {
    id: "r1",
    confirmationNumber: "#AUR-0471",
    customer: mockCustomers[0],
    guests: 2,
    specialRequests: "Window seat preferred. Anniversary dinner.",
    status: "Checked In",
    createdAt: new Date(_n - 3600000 * 2).toISOString(),
    assignedAt: new Date(_n - 1800000).toISOString(),
    assignedTableId: "ft1_05",
    assignedTableNumber: "5",
    assignedFloor: 1,
  },
  {
    id: "r2",
    confirmationNumber: "#AUR-0472",
    customer: mockCustomers[1],
    guests: 4,
    status: "Seated",
    createdAt: new Date(_n - 3600000 * 3).toISOString(),
    assignedAt: new Date(_n - 5400000).toISOString(),
    seatedAt: new Date(_n - 5400000).toISOString(),
    assignedTableId: "ft1_03",
    assignedTableNumber: "3",
    assignedFloor: 1,
  },
  {
    id: "r3",
    confirmationNumber: "#AUR-0473",
    customer: mockCustomers[2],
    guests: 2,
    specialRequests: "Nut allergy — please inform kitchen.",
    status: "Pending",
    createdAt: new Date(_n - 3600000 * 0.5).toISOString(),
  },
  {
    id: "r4",
    confirmationNumber: "#AUR-0474",
    customer: mockCustomers[3],
    guests: 6,
    specialRequests: "Vegan options needed for 2 guests.",
    status: "Pending",
    createdAt: new Date(_n - 3600000 * 1).toISOString(),
  },
  {
    id: "r5",
    confirmationNumber: "#AUR-0475",
    customer: mockCustomers[4],
    guests: 2,
    status: "Cancelled",
    createdAt: new Date(_n - 3600000 * 5).toISOString(),
    cancelledAt: new Date(_n - 3600000 * 4.5).toISOString(),
    cancelledBy: "Amara Diallo",
  },
  {
    id: "r6",
    confirmationNumber: "#AUR-0476",
    customer: mockCustomers[0],
    guests: 2,
    status: "Checked In",
    createdAt: new Date(_n - 600000).toISOString(),
    assignedAt: new Date(_n - 900000).toISOString(),
    assignedTableId: "ft1_50",
    assignedTableNumber: "50",
    assignedFloor: 1,
  },
  {
    id: "r7",
    confirmationNumber: "#AUR-0477",
    customer: mockCustomers[1],
    guests: 8,
    specialRequests: "Birthday cake prepared in advance.",
    status: "Seated",
    createdAt: new Date(_n - 3600000 * 4).toISOString(),
    assignedAt: new Date(_n - 7200000).toISOString(),
    seatedAt: new Date(_n - 7200000).toISOString(),
    assignedTableId: "ft1_25",
    assignedTableNumber: "25",
    assignedFloor: 1,
  },
];

export const mockTables: Table[] = [
  { id: "t1",  number: "11", capacity: 2, status: "Available" },
  { id: "t2",  number: "12", capacity: 2, status: "Occupied",  reservationId: "r2" },
  { id: "t3",  number: "13", capacity: 2, status: "Available" },
  { id: "t4",  number: "14", capacity: 4, status: "Reserved",  reservationId: "r1" },
  { id: "t5",  number: "21", capacity: 4, status: "Available" },
  { id: "t6",  number: "22", capacity: 4, status: "Available" },
  { id: "t7",  number: "23", capacity: 6, status: "Reserved",  reservationId: "r4" },
  { id: "t8",  number: "24", capacity: 6, status: "Available" },
  { id: "t9",  number: "31", capacity: 8, status: "Available" },
  { id: "t10", number: "32", capacity: 2, status: "Available" },
];

export const restaurantSettings = {
  name: "BOOMCLUB",
  phone: "+962 79 002 2006",
  address: "6th Circle, Amman, Jordan",
  openingHours: "Tue – Mon, 22:00 – 03:30",
};

export const mockEmployees: Employee[] = [
  { id: "e1", name: "Luca Moreau",    username: "luca.m",   phone: "+962 6 555 0201", role: "Owner",   status: "Active",   dateAdded: "2024-03-15", password: "admin123" },
  { id: "e2", name: "Amara Diallo",   username: "amara.d",  phone: "+962 6 555 0202", role: "Doorman", status: "Active",   dateAdded: "2024-05-02", password: "staff123" },
  { id: "e3", name: "Theo Nakamura",  username: "theo.n",   phone: "+962 6 555 0203", role: "Doorman", status: "Active",   dateAdded: "2024-07-19", password: "staff123" },
  { id: "e4", name: "Celine Dupont",  username: "celine.d", phone: "+962 6 555 0204", role: "Waiter",  status: "Active",   dateAdded: "2024-09-08", password: "staff123" },
  { id: "e5", name: "Rafael Ortega",  username: "rafael.o", phone: "+962 6 555 0205", role: "Waiter",  status: "Inactive", dateAdded: "2024-11-22", password: "staff123" },
  { id: "e6", name: "Priya Sharma",   username: "priya.s",  phone: "+962 6 555 0206", role: "Waiter",  status: "Active",   dateAdded: "2025-01-10", password: "staff123" },
];

// ─── Floor Plan Types ─────────────────────────────────────────────────────────
export type FloorTableStatus = "Available" | "Waiting" | "Occupied" | "Special" | "OutOfService";
export type TableShape = "round" | "square" | "banquet";

export interface SpecialGuest {
  name: string;
  phone?: string;
  reason: string;
  reservedBy: string;
  reservedAt: string;
}

export interface FloorTable {
  id: string;
  number: string;
  floor: 1 | 2;
  shape: TableShape;
  capacity: number;
  status: FloorTableStatus;
  x: number;
  y: number;
  reservationId?: string;
  assignedWaiter?: string;
  assignedAt?: string;
  seatedAt?: string;
  specialGuest?: SpecialGuest;
  outOfService?: { reason: string; disabledBy: string; disabledAt: string };
  notes?: string;
}

export const mockFloorTables: FloorTable[] = [
  // ── Floor 1 · Left Wing – Column A (x=55) ──────────────────────────────
  { id:"ft1_01", number:"1",  floor:1, shape:"round",  capacity:4, status:"Available", x:55, y:65 },
  { id:"ft1_02", number:"2",  floor:1, shape:"round",  capacity:2, status:"Available", x:55, y:145 },
  { id:"ft1_03", number:"3",  floor:1, shape:"round",  capacity:4, status:"Occupied",  x:55, y:225, reservationId:"r2", seatedAt:new Date(_n-5400000).toISOString(), assignedWaiter:"Celine Dupont" },
  { id:"ft1_04", number:"4",  floor:1, shape:"round",  capacity:2, status:"Available", x:55, y:305 },
  { id:"ft1_05", number:"5",  floor:1, shape:"round",  capacity:4, status:"Waiting",   x:55, y:385, reservationId:"r1", assignedAt:new Date(_n-1800000).toISOString() },
  { id:"ft1_06", number:"6",  floor:1, shape:"round",  capacity:2, status:"Available", x:55, y:465 },
  { id:"ft1_07", number:"7",  floor:1, shape:"round",  capacity:4, status:"Available", x:55, y:545 },
  { id:"ft1_08", number:"8",  floor:1, shape:"round",  capacity:2, status:"Available", x:55, y:625 },
  // ── Floor 1 · Left Wing – Column B (x=145) ─────────────────────────────
  { id:"ft1_09", number:"9",  floor:1, shape:"round",  capacity:4, status:"Available", x:145, y:105 },
  { id:"ft1_10", number:"10", floor:1, shape:"round",  capacity:2, status:"Available", x:145, y:185 },
  { id:"ft1_11", number:"11", floor:1, shape:"round",  capacity:4, status:"Available", x:145, y:265 },
  { id:"ft1_12", number:"12", floor:1, shape:"round",  capacity:2, status:"Available", x:145, y:345 },
  { id:"ft1_13", number:"13", floor:1, shape:"round",  capacity:4, status:"Available", x:145, y:425 },
  { id:"ft1_14", number:"14", floor:1, shape:"round",  capacity:2, status:"Available", x:145, y:505 },
  { id:"ft1_15", number:"15", floor:1, shape:"round",  capacity:4, status:"Available", x:145, y:585 },
  // ── Floor 1 · Left Wing – Column C (x=235) ─────────────────────────────
  { id:"ft1_16", number:"16", floor:1, shape:"square", capacity:6, status:"Special",   x:235, y:65,  specialGuest:{ name:"Tariq Al-Rashid", reason:"VIP Birthday", reservedBy:"Luca Moreau", reservedAt:new Date(_n-3600000).toISOString() } },
  { id:"ft1_17", number:"17", floor:1, shape:"round",  capacity:4, status:"Available", x:235, y:155 },
  { id:"ft1_18", number:"18", floor:1, shape:"square", capacity:4, status:"Available", x:235, y:245 },
  { id:"ft1_19", number:"19", floor:1, shape:"round",  capacity:2, status:"Available", x:235, y:335 },
  { id:"ft1_20", number:"20", floor:1, shape:"square", capacity:6, status:"Available", x:235, y:425 },
  { id:"ft1_21", number:"21", floor:1, shape:"round",  capacity:4, status:"Available", x:235, y:515 },
  { id:"ft1_22", number:"22", floor:1, shape:"square", capacity:4, status:"Available", x:235, y:605 },
  { id:"ft1_23", number:"23", floor:1, shape:"round",  capacity:2, status:"Available", x:235, y:695 },
  // ── Floor 1 · Right Wing – Column D (x=965) ────────────────────────────
  { id:"ft1_24", number:"24", floor:1, shape:"round",  capacity:4, status:"Available",     x:965, y:65 },
  { id:"ft1_25", number:"25", floor:1, shape:"square", capacity:8, status:"Occupied",       x:965, y:145, reservationId:"r7", seatedAt:new Date(_n-7200000).toISOString(), assignedWaiter:"Priya Sharma" },
  { id:"ft1_26", number:"26", floor:1, shape:"round",  capacity:4, status:"Available",     x:965, y:225 },
  { id:"ft1_27", number:"27", floor:1, shape:"round",  capacity:2, status:"Available",     x:965, y:305 },
  { id:"ft1_28", number:"28", floor:1, shape:"round",  capacity:4, status:"Available",     x:965, y:385 },
  { id:"ft1_29", number:"29", floor:1, shape:"round",  capacity:2, status:"OutOfService",  x:965, y:465, outOfService:{ reason:"Broken Furniture", disabledBy:"Luca Moreau", disabledAt:new Date(_n-86400000).toISOString() } },
  { id:"ft1_30", number:"30", floor:1, shape:"round",  capacity:4, status:"Available",     x:965, y:545 },
  { id:"ft1_31", number:"31", floor:1, shape:"round",  capacity:2, status:"Available",     x:965, y:625 },
  // ── Floor 1 · Right Wing – Column E (x=1055) ───────────────────────────
  { id:"ft1_32", number:"32", floor:1, shape:"round",  capacity:4, status:"Available", x:1055, y:105 },
  { id:"ft1_33", number:"33", floor:1, shape:"round",  capacity:2, status:"Available", x:1055, y:185 },
  { id:"ft1_34", number:"34", floor:1, shape:"round",  capacity:4, status:"Available", x:1055, y:265 },
  { id:"ft1_35", number:"35", floor:1, shape:"round",  capacity:2, status:"Available", x:1055, y:345 },
  { id:"ft1_36", number:"36", floor:1, shape:"round",  capacity:4, status:"Available", x:1055, y:425 },
  { id:"ft1_37", number:"37", floor:1, shape:"round",  capacity:2, status:"Available", x:1055, y:505 },
  { id:"ft1_38", number:"38", floor:1, shape:"round",  capacity:4, status:"Available", x:1055, y:585 },
  // ── Floor 1 · Right Wing – Column F (x=1145) ───────────────────────────
  { id:"ft1_39", number:"39", floor:1, shape:"square", capacity:6, status:"Available", x:1145, y:65 },
  { id:"ft1_40", number:"40", floor:1, shape:"round",  capacity:4, status:"Available", x:1145, y:155 },
  { id:"ft1_41", number:"41", floor:1, shape:"square", capacity:4, status:"Available", x:1145, y:245 },
  { id:"ft1_42", number:"42", floor:1, shape:"round",  capacity:2, status:"Available", x:1145, y:335 },
  { id:"ft1_43", number:"43", floor:1, shape:"square", capacity:6, status:"Available", x:1145, y:425 },
  { id:"ft1_44", number:"44", floor:1, shape:"round",  capacity:4, status:"Available", x:1145, y:515 },
  { id:"ft1_45", number:"45", floor:1, shape:"square", capacity:4, status:"Available", x:1145, y:605 },
  { id:"ft1_46", number:"46", floor:1, shape:"round",  capacity:2, status:"Available", x:1145, y:695 },
  // ── Floor 1 · Front Row (y=28) ──────────────────────────────────────────
  { id:"ft1_47", number:"47", floor:1, shape:"round",  capacity:2, status:"Available", x:330, y:28 },
  { id:"ft1_48", number:"48", floor:1, shape:"round",  capacity:2, status:"Available", x:430, y:28 },
  { id:"ft1_49", number:"49", floor:1, shape:"round",  capacity:2, status:"Available", x:530, y:28 },
  { id:"ft1_50", number:"50", floor:1, shape:"round",  capacity:2, status:"Waiting",   x:600, y:28, reservationId:"r6", assignedAt:new Date(_n-900000).toISOString() },
  { id:"ft1_51", number:"51", floor:1, shape:"round",  capacity:2, status:"Available", x:670, y:28 },
  { id:"ft1_52", number:"52", floor:1, shape:"round",  capacity:2, status:"Available", x:770, y:28 },
  { id:"ft1_53", number:"53", floor:1, shape:"round",  capacity:2, status:"Available", x:870, y:28 },
  // ── Floor 1 · Back Wall Banquets (y=698) ────────────────────────────────
  { id:"ft1_54", number:"54", floor:1, shape:"banquet", capacity:8,  status:"Available", x:330, y:698 },
  { id:"ft1_55", number:"55", floor:1, shape:"banquet", capacity:10, status:"Available", x:490, y:698 },
  { id:"ft1_56", number:"56", floor:1, shape:"banquet", capacity:10, status:"Available", x:650, y:698 },
  { id:"ft1_57", number:"57", floor:1, shape:"banquet", capacity:8,  status:"Available", x:810, y:698 },
  { id:"ft1_58", number:"58", floor:1, shape:"banquet", capacity:8,  status:"Available", x:930, y:698 },
  // ── Floor 1 · VIP Side Spots ────────────────────────────────────────────
  { id:"ft1_59", number:"59", floor:1, shape:"square",  capacity:6,  status:"Available", x:330, y:625 },
  { id:"ft1_60", number:"60", floor:1, shape:"square",  capacity:6,  status:"Available", x:870, y:625 },

  // ── Floor 2 · Ring of 17 (center 450,380 radius 250) ───────────────────
  { id:"ft2_01", number:"201", floor:2, shape:"round",  capacity:4, status:"Available", x:450, y:130 },
  { id:"ft2_02", number:"202", floor:2, shape:"round",  capacity:4, status:"Available", x:540, y:147 },
  { id:"ft2_03", number:"203", floor:2, shape:"round",  capacity:4, status:"Available", x:618, y:195 },
  { id:"ft2_04", number:"204", floor:2, shape:"square", capacity:6, status:"Available", x:674, y:269 },
  { id:"ft2_05", number:"205", floor:2, shape:"round",  capacity:4, status:"Available", x:699, y:357 },
  { id:"ft2_06", number:"206", floor:2, shape:"round",  capacity:4, status:"Available", x:690, y:448 },
  { id:"ft2_07", number:"207", floor:2, shape:"square", capacity:6, status:"Available", x:650, y:530 },
  { id:"ft2_08", number:"208", floor:2, shape:"round",  capacity:4, status:"Available", x:581, y:593 },
  { id:"ft2_09", number:"209", floor:2, shape:"round",  capacity:4, status:"Available", x:496, y:626 },
  { id:"ft2_10", number:"210", floor:2, shape:"round",  capacity:4, status:"Available", x:404, y:626 },
  { id:"ft2_11", number:"211", floor:2, shape:"round",  capacity:4, status:"Available", x:319, y:593 },
  { id:"ft2_12", number:"212", floor:2, shape:"square", capacity:6, status:"Special",   x:250, y:530, specialGuest:{ name:"Nora Al-Farsi", phone:"+962 79 555 0099", reason:"Corporate Event", reservedBy:"Luca Moreau", reservedAt:new Date(_n-7200000).toISOString() } },
  { id:"ft2_13", number:"213", floor:2, shape:"round",  capacity:4, status:"Available", x:210, y:448 },
  { id:"ft2_14", number:"214", floor:2, shape:"round",  capacity:4, status:"Available", x:201, y:357 },
  { id:"ft2_15", number:"215", floor:2, shape:"square", capacity:6, status:"Available", x:226, y:269 },
  { id:"ft2_16", number:"216", floor:2, shape:"round",  capacity:4, status:"Available", x:282, y:195 },
  { id:"ft2_17", number:"217", floor:2, shape:"round",  capacity:4, status:"Available", x:360, y:147 },
];

export const updateReservationData = (id: string, updates: Partial<Reservation>) => {
  mockReservations = mockReservations.map((res) =>
    res.id === id ? { ...res, ...updates } : res
  );
  return mockReservations.find((res) => res.id === id);
};

export const createReservation = (
  data: Omit<Reservation, "id" | "confirmationNumber" | "createdAt">
) => {
  const newRes: Reservation = {
    ...data,
    id: `r${Math.floor(Math.random() * 10000)}`,
    confirmationNumber: `#AUR-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    createdAt: new Date().toISOString(),
  };
  mockReservations = [newRes, ...mockReservations];
  return newRes;
};
