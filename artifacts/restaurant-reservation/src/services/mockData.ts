export type ReservationStatus = "Pending" | "Confirmed" | "Checked In" | "Cancelled";
export type PaymentMethod = "CliQ" | "Pay Upon Arrival";
export type PaymentStatus = "Pending" | "Paid" | "Verified";
export type EmployeeRole = "Supervisor" | "Senior Staff" | "Host" | "Waiter";
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
  date: string;
  time: string;
  guests: number;
  specialRequests?: string;
  status: ReservationStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  createdAt: string;
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
}

export const mockCustomers: Customer[] = [
  { id: "c1", name: "Eleanor Vance", phone: "+962 6 555 0101" },
  { id: "c2", name: "Marcus Sterling", phone: "+962 6 555 0102" },
  { id: "c3", name: "Sophia Laurent", phone: "+962 6 555 0103" },
  { id: "c4", name: "James Holden", phone: "+962 6 555 0104" },
  { id: "c5", name: "Isabella Rossi", phone: "+962 6 555 0105" },
];

const today = new Date().toISOString().split("T")[0];
const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

export let mockReservations: Reservation[] = [
  {
    id: "r1",
    confirmationNumber: "#AUR-2025-0471",
    customer: mockCustomers[0],
    date: today,
    time: "19:00",
    guests: 2,
    specialRequests: "Window seat preferred. Anniversary dinner.",
    status: "Confirmed",
    paymentMethod: "CliQ",
    paymentStatus: "Verified",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "r2",
    confirmationNumber: "#AUR-2025-0472",
    customer: mockCustomers[1],
    date: today,
    time: "20:30",
    guests: 4,
    status: "Checked In",
    paymentMethod: "Pay Upon Arrival",
    paymentStatus: "Pending",
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "r3",
    confirmationNumber: "#AUR-2025-0473",
    customer: mockCustomers[2],
    date: today,
    time: "21:00",
    guests: 2,
    status: "Pending",
    paymentMethod: "CliQ",
    paymentStatus: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
  {
    id: "r4",
    confirmationNumber: "#AUR-2025-0474",
    customer: mockCustomers[3],
    date: tomorrow,
    time: "18:00",
    guests: 6,
    specialRequests: "Vegan options needed",
    status: "Confirmed",
    paymentMethod: "CliQ",
    paymentStatus: "Verified",
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: "r5",
    confirmationNumber: "#AUR-2025-0475",
    customer: mockCustomers[4],
    date: tomorrow,
    time: "19:30",
    guests: 2,
    status: "Cancelled",
    paymentMethod: "Pay Upon Arrival",
    paymentStatus: "Pending",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: "r6",
    confirmationNumber: "#AUR-2025-0476",
    customer: mockCustomers[0],
    date: tomorrow,
    time: "20:00",
    guests: 2,
    status: "Pending",
    paymentMethod: "CliQ",
    paymentStatus: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "r7",
    confirmationNumber: "#AUR-2025-0477",
    customer: mockCustomers[1],
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    time: "19:00",
    guests: 8,
    status: "Confirmed",
    paymentMethod: "Pay Upon Arrival",
    paymentStatus: "Pending",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
  },
  {
    id: "r8",
    confirmationNumber: "#AUR-2025-0478",
    customer: mockCustomers[2],
    date: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    time: "21:30",
    guests: 2,
    status: "Confirmed",
    paymentMethod: "CliQ",
    paymentStatus: "Verified",
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
  },
  {
    id: "r9",
    confirmationNumber: "#AUR-2025-0479",
    customer: mockCustomers[3],
    date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    time: "18:30",
    guests: 4,
    status: "Pending",
    paymentMethod: "CliQ",
    paymentStatus: "Pending",
    createdAt: new Date().toISOString(),
  },
  {
    id: "r10",
    confirmationNumber: "#AUR-2025-0480",
    customer: mockCustomers[4],
    date: new Date(Date.now() + 86400000 * 3).toISOString().split("T")[0],
    time: "20:00",
    guests: 2,
    status: "Confirmed",
    paymentMethod: "Pay Upon Arrival",
    paymentStatus: "Pending",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export const mockTables: Table[] = [
  { id: "t1", number: "11", capacity: 2, status: "Available" },
  { id: "t2", number: "12", capacity: 2, status: "Occupied", reservationId: "r2" },
  { id: "t3", number: "13", capacity: 2, status: "Available" },
  { id: "t4", number: "14", capacity: 4, status: "Reserved", reservationId: "r1" },
  { id: "t5", number: "21", capacity: 4, status: "Available" },
  { id: "t6", number: "22", capacity: 4, status: "Available" },
  { id: "t7", number: "23", capacity: 6, status: "Reserved" },
  { id: "t8", number: "24", capacity: 6, status: "Available" },
  { id: "t9", number: "31", capacity: 8, status: "Available" },
  { id: "t10", number: "32", capacity: 2, status: "Available" },
  { id: "t11", number: "41", capacity: 2, status: "Available" },
  { id: "t12", number: "42", capacity: 4, status: "Available" },
];

export const restaurantSettings = {
  name: "Aurum",
  phone: "+33 1 23 45 67 89",
  address: "14 Rue de Rivoli, 75001 Paris",
  openingHours: "Mon-Sun, 18:00 - 23:30",
  cliqType: "alias" as "alias" | "phone",
  cliqValue: "@aurum.restaurant",
  depositRequired: true,
  allowPayUponArrival: true,
};

export const mockEmployees: Employee[] = [
  {
    id: "e1",
    name: "Luca Moreau",
    username: "luca.m",
    phone: "+962 6 555 0201",
    role: "Supervisor",
    status: "Active",
    dateAdded: "2024-03-15",
  },
  {
    id: "e2",
    name: "Amara Diallo",
    username: "amara.d",
    phone: "+962 6 555 0202",
    role: "Senior Staff",
    status: "Active",
    dateAdded: "2024-05-02",
  },
  {
    id: "e3",
    name: "Theo Nakamura",
    username: "theo.n",
    phone: "+962 6 555 0203",
    role: "Host",
    status: "Active",
    dateAdded: "2024-07-19",
  },
  {
    id: "e4",
    name: "Celine Dupont",
    username: "celine.d",
    phone: "+962 6 555 0204",
    role: "Waiter",
    status: "Active",
    dateAdded: "2024-09-08",
  },
  {
    id: "e5",
    name: "Rafael Ortega",
    username: "rafael.o",
    phone: "+962 6 555 0205",
    role: "Waiter",
    status: "Inactive",
    dateAdded: "2024-11-22",
  },
  {
    id: "e6",
    name: "Priya Sharma",
    username: "priya.s",
    phone: "+962 6 555 0206",
    role: "Senior Staff",
    status: "Active",
    dateAdded: "2025-01-10",
  },
];

export const updateReservation = (id: string, updates: Partial<Reservation>) => {
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
    confirmationNumber: `#AUR-2025-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    createdAt: new Date().toISOString(),
  };
  mockReservations = [newRes, ...mockReservations];
  return newRes;
};
