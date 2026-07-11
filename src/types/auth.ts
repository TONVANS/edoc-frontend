export interface Branch {
  id: number;
  code: string;
  name: string;
  status: string;
}

export interface Department {
  id: number;
  code: string;
  name: string;
  phone: string;
  email: string;
  status: string;
}

export interface Division {
  id: number;
  code: string;
  name: string;
  shortName: string;
  status: string;
  departmentId: number;
  branchId: number;
}

export interface Unit {
  id: number;
  code: string;
  name: string;
  type: string;
  status: string;
  officeId: number | null;
  divisionId: number;
}

export interface User {
  id: string;
  empCode: string;
  firstNameLa: string;
  lastNameLa: string;
  email?: string | null;
  role: string;
  gender: string;
  status: string;
  addressId?: string | null;
  department: number | null;
  office: number | null;
  unit: number | null;
  departmentData: Department | null;
  divisions: Division[] | null;
  officeData: any | null; // Using any for null payload, or could be a specific interface if known
  unitData: Unit | null;
}

export interface AuthResponseData {
  accessToken: string;
  user: User;
}

export interface AuthResponse {
  message: string;
  data: AuthResponseData;
}
