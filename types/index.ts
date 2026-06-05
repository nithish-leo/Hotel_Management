export interface Admin {
  admin_id: number;
  admin_name: string;
  email: string;
  password: string;
}

export interface Customer {
  customer_id: number;
  customer_name: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  id_proof: string;
}

export interface RoomType {
  type_id: number;
  type_name: string;
  price_per_day: number;
  capacity: number;
}

export interface Room {
  room_id: number;
  room_number: string;
  type_id: number;
  type_name?: string;
  price_per_day?: number;
  capacity?: number;
  status: string;
  floor: number;
}

export interface Booking {
  booking_id: number;
  customer_id: number;
  customer_name?: string;
  room_id: number;
  room_number?: string;
  booking_date: string;
  check_in: string;
  check_out: string;
  total_amount: number;
  booking_status: string;
  type_name?: string;
}

export interface Payment {
  payment_id: number;
  booking_id: number;
  customer_name?: string;
  room_number?: string;
  payment_date: string;
  amount: number;
  payment_method: string;
}

export interface Employee {
  employee_id: number;
  emp_name: string;
  role: string;
  salary: number;
  phone: string;
}

export interface Service {
  service_id: number;
  service_name: string;
  service_charge: number;
}

export interface Stats {
  total_rooms: number;
  available_rooms: number;
  total_bookings: number;
  total_customers: number;
  total_employees: number;
  total_revenue: number;
}
