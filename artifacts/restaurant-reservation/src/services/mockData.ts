export type ReservationStatus = "Pending" | "Confirmed" | "Checked In" | "Cancelled";
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

export let mockReservations: Reservation[] = [
  {
    id: "r1",
    confirmationNumber: "#AUR-0471",
    customer: mockCustomers[0],
    guests: 2,
    specialRequests: "Window seat preferred. Anniversary dinner.",
    status: "Confirmed",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
  {
    id: "r2",
    confirmationNumber: "#AUR-0472",
    customer: mockCustomers[1],
    guests: 4,
    status: "Checked In",
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: "r3",
    confirmationNumber: "#AUR-0473",
    customer: mockCustomers[2],
    guests: 2,
    specialRequests: "Nut allergy — please inform kitchen.",
    status: "Pending",
    createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString(),
  },
  {
    id: "r4",
    confirmationNumber: "#AUR-0474",
    customer: mockCustomers[3],
    guests: 6,
    specialRequests: "Vegan options needed for 2 guests.",
    status: "Confirmed",
    createdAt: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: "r5",
    confirmationNumber: "#AUR-0475",
    customer: mockCustomers[4],
    guests: 2,
    status: "Cancelled",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "r6",
    confirmationNumber: "#AUR-0476",
    customer: mockCustomers[0],
    guests: 2,
    status: "Pending",
    createdAt: new Date(Date.now() - 600000).toISOString(),
  },
  {
    id: "r7",
    confirmationNumber: "#AUR-0477",
    customer: mockCustomers[1],
    guests: 8,
    specialRequests: "Birthday cake prepared in advance.",
    status: "Confirmed",
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
  },
];

export const mockTables: Table[] = [
  { id: "t1", number: "11", capacity: 2, status: "Available" },
  { id: "t2", number: "12", capacity: 2, status: "Occupied", reservationId: "r2" },
  { id: "t3", number: "13", capacity: 2, status: "Available" },
  { id: "t4", number: "14", capacity: 4, status: "Reserved", reservationId: "r1" },
  { id: "t5", number: "21", capacity: 4, status: "Available" },
  { id: "t6", number: "22", capacity: 4, status: "Available" },
  { id: "t7", number: "23", capacity: 6, status: "Reserved", reservationId: "r4" },
  { id: "t8", number: "24", capacity: 6, status: "Available" },
  { id: "t9", number: "31", capacity: 8, status: "Available" },
  { id: "t10", number: "32", capacity: 2, status: "Available" },
];

export const restaurantSettings = {
  name: "BOOMCLUB",
  phone: "+962 790022006",
  address: "6th Cir., Amman",
  openingHours: "Tue-Mon, 22:00 - 03:30",
};

export const mockEmployees: Employee[] = [
  {
    id: "e1",
    name: "Luca Moreau",
    username: "luca.m",
    phone: "+962 6 555 0201",
    role: "Owner",
    status: "Active",
    dateAdded: "2024-03-15",
  },
  {
    id: "e2",
    name: "Amara Diallo",
    username: "amara.d",
    phone: "+962 6 555 0202",
    role: "Doorman",
    status: "Active",
    dateAdded: "2024-05-02",
  },
  {
    id: "e3",
    name: "Theo Nakamura",
    username: "theo.n",
    phone: "+962 6 555 0203",
    role: "Doorman",
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
    role: "Waiter",
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
    confirmationNumber: `#AUR-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0")}`,
    createdAt: new Date().toISOString(),
  };
  mockReservations = [newRes, ...mockReservations];
  return newRes;
};
