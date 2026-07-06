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
  role: string;
  gender: string;
  status: string;
  branch: Branch | null;
  department: Department | null;
  division: Division | null;
  office: any | null; // Using any for null payload, or could be a specific interface if known
  unit: Unit | null;
}

export interface AuthResponseData {
  accessToken: string;
  user: User;
}

export interface AuthResponse {
  message: string;
  data: AuthResponseData;
}
