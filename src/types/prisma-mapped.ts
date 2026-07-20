// src/types/prisma-mapped.ts

// ── Common / Shared ──────────────────────────────────────────

export interface DropdownOption {
  id: string | number;
  code?: string;
  name: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

// ── Branch ───────────────────────────────────────────────────

export interface Branch {
  id: number;
  code?: string;
  name: string;
  status?: string;
}

// ── Address removed ──
// ── Warehouse ────────────────────────────────────────────────
// API: Warehouse only has departmentId and divisionId

export interface Warehouse {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  departmentId: number | null;
  divisionId: number | null;
  createdAt: string;
  updatedAt: string;
  // Optional relations
  department?: Department;
  division?: Division;
}

export interface CreateWarehousePayload {
  code?: string;
  name: string;
  description?: string;
  departmentId?: number;
  divisionId?: number;
}

// ── Locker ───────────────────────────────────────────────────

export interface Locker {
  id: string;
  code: string;
  name: string | null;
  description: string | null;
  status: string;
  warehouseId: string | null;
  createdAt: string;
  updatedAt: string;
  // Optional relation
  warehouse?: Warehouse;
}

export interface CreateLockerPayload {
  code: string;
  name?: string;
  description?: string;
  warehouseId?: string;
}

// ── Shelf ────────────────────────────────────────────────────

export interface Shelf {
  id: string;
  code: string;
  name: string;
  description: string | null;
  status: string;
  maxQty: number;
  lockerId: string;
  createdAt: string;
  updatedAt: string;
  // Optional relation
  locker?: Locker;
}

export interface CreateShelfPayload {
  code?: string;
  name: string;
  description?: string;
  maxQty: number;
  lockerId: string;
}

// ── Folder / Kono ────────────────────────────────────────────

export interface Folder {
  id: string;
  code: string;
  name: string;
  status: string;
  qrCode: string;
  description?: string | null;
  locationRef: string | null;
  shelfId: string;
  createdAt: string;
  updatedAt: string;
  // Optional relation
  shelf?: Shelf;
}

export interface CreateFolderPayload {
  code?: string;
  name: string;
  qrCode?: string;
  description?: string;
  shelfId: string;
}

export interface Kono {
  id: string;
  name: string;
  folderId: string;
  ownerId?: string | null;
  status: 'AVAILABLE' | 'IN_USE';
}

// ── Document Type ────────────────────────────────────────────

export interface DocumentType {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentTypePayload {
  code?: string;
  name: string;
  description?: string;
  isActive?: boolean;
}

// ── Attachment ───────────────────────────────────────────────

export interface Attachment {
  id: string;
  documentId: string;
  filePath: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  createdAt: string;
  updatedAt: string;
}

// ── Sub-Document ──────────────────────────────────────────────

export interface SubDocument {
  id: string;
  subDocNo: string;
  subDocDate: string;
  documentId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSubDocumentPayload {
  subDocNo: string;
  subDocDate: string;
  subDocuments?: { subDocNo: string; subDocDate: string }[];
}

export interface UpdateSubDocumentPayload {
  subDocNo?: string;
  subDocDate?: string;
}

// ── Document ─────────────────────────────────────────────────

export interface Document {
  id: string;
  docNo: string;
  shortName: string | null;
  docDate: string;
  subDocNo: string | null;
  subDocDate: string | null;
  title: string;
  description: string | null;
  docExpire: string | null;
  qrCode: string | null;
  userId: string;
  folderId: string;
  documentTypeId: string;
  isContractBound: boolean;
  retentionStatus: string;
  departmentId?: number | null;
  divisionId?: number | null;
  createdAt: string;
  updatedAt: string;
  attachments: Attachment[];
  subDocuments?: SubDocument[];

  // Optional relations
  folder?: Folder;
  documentType?: DocumentType;
  department?: Department;
  division?: Division;
  user?: any; // To be mapped properly if User type exists
  warehouse?: Warehouse;
  locker?: Locker;
  shelf?: Shelf;
}

export interface CreateDocumentPayload {
  docNo: string;
  shortName?: string;
  docDate: string;
  subDocuments?: { subDocNo: string; subDocDate?: string }[];
  title: string;
  description?: string;
  docExpire?: string;
  qrCode?: string;
  folderId: string;
  documentTypeId: string;
  isContractBound: boolean;
  departmentId?: number;
  divisionId?: number;
  files?: File[];
}

export interface UpdateDocumentPayload {
  docNo?: string;
  shortName?: string;
  docDate?: string;
  subDocuments?: { subDocNo: string; subDocDate?: string }[];
  title?: string;
  description?: string;
  docExpire?: string;
  qrCode?: string;
  folderId?: string;
  documentTypeId?: string;
  isContractBound?: boolean;
  departmentId?: number;
  divisionId?: number;
}

// ── Document Borrow ──────────────────────────────────────────

export interface DocumentBorrow {
  id: string;
  documentId: string | null;
  folderId: string | null;
  documentIds?: string[];
  folderIds?: string[];
  borrower: string;
  phone?: string | null;
  purpose: string | null;
  toDivisionId: number | null;
  toLocation: string | null;
  note: string | null;
  dueDate?: string | null;
  borrowedAt?: string | null;
  createdAt: string;
  returnedAt: string | null;
  createdById?: string;
  status?: string | null;

  // Optional relations
  document?: Document;
  folder?: Folder;
  toDivision?: Division;
  createdBy?: any; // or specify a User type if you have one
}

export interface CreateDocumentBorrowPayload {
  documentIds?: string[];
  folderIds?: string[];
  borrower: string;
  phone?: string;
  purpose?: string;
  toDivisionId?: number;
  toLocation?: string;
  note?: string;
  dueDate?: string;
}

// ── Global Search ────────────────────────────────────────────

export interface GlobalSearchEntityResult<T = unknown> {
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
  data: T[];
}

export interface GlobalSearchResult {
  documents?: GlobalSearchEntityResult<Document>;
  folders?: GlobalSearchEntityResult<Folder>;
  warehouses?: GlobalSearchEntityResult<Warehouse>;
  lockers?: GlobalSearchEntityResult<Locker>;
  shelves?: GlobalSearchEntityResult<Shelf>;
  users?: GlobalSearchEntityResult<unknown>;
  departments?: GlobalSearchEntityResult<unknown>;
  divisions?: GlobalSearchEntityResult<unknown>;
}

// ── QR Code Lookup ───────────────────────────────────────────

export interface QRLookupResult {
  type: 'folder' | 'document';
  data: (Folder | Document) & {
    shelf?: Shelf;
    locker?: Locker;
    warehouse?: Warehouse;
  };
}

// ── Audit Log ────────────────────────────────────────────────

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  details?: string | null;
}

export interface DocumentHistory {
  id: string;
  documentId: string;
  action: string;
  userId: string;
  timestamp: string;
  details?: string | null;
}

// ── HRM: Department ──────────────────────────────────────────

export interface Department {
  id: number;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  status: string;
}

// ── HRM: Division ────────────────────────────────────────────

export interface Division {
  id: number;
  code: string;
  name: string;
  shortName?: string;
  status: string;
  departmentId: number;
  branchId?: number;
}

// ── HRM: Office ──────────────────────────────────────────────

export interface Office {
  id: number;
  code: string;
  name: string;
  status: string;
  divisionId?: number;
}

// ── HRM: Unit ────────────────────────────────────────────────

export interface Unit {
  id: number;
  code: string;
  name: string;
  type?: string;
  status: string;
  officeId?: number | null;
  divisionId?: number;
}
