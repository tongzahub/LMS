/**
 * CSV processing utilities for bulk user import/export.
 * Pure functions — no side effects — for testability.
 */

export interface UserImportRow {
  email: string;
  firstname: string;
  lastname: string;
  role: 'STUDENT' | 'TEACHER' | 'ADMIN';
  password?: string;
  cohort?: string;
  institution?: string;
  department?: string;
  phone?: string;
  language?: 'th' | 'en';
}

export interface CsvValidationError {
  row: number;
  column: string;
  value: string;
  message: string;
}

export interface CsvValidationResult {
  validRows: UserImportRow[];
  errors: CsvValidationError[];
  totalRows: number;
  validCount: number;
  errorCount: number;
}

const REQUIRED_COLUMNS = ['email', 'firstname', 'lastname', 'role'] as const;
const OPTIONAL_COLUMNS = ['password', 'cohort', 'institution', 'department', 'phone', 'language'] as const;
const ALL_COLUMNS = [...REQUIRED_COLUMNS, ...OPTIONAL_COLUMNS];
const VALID_ROLES = ['STUDENT', 'TEACHER', 'ADMIN'] as const;
const VALID_LANGUAGES = ['th', 'en'] as const;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Parse a CSV string into an array of string arrays. Handles quoted fields. */
export function parseCsvString(text: string): string[][] {
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '');
  return lines.map((line) => {
    const fields: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') {
          current += '"';
          i++;
        } else if (ch === '"') {
          inQuotes = false;
        } else {
          current += ch;
        }
      } else if (ch === '"') {
        inQuotes = true;
      } else if (ch === ',') {
        fields.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    fields.push(current.trim());
    return fields;
  });
}

/** Validate a CSV file for user import. */
export async function validateUserImportCsv(file: File): Promise<CsvValidationResult> {
  const text = await file.text();
  return validateUserImportCsvString(text);
}

/** Validate CSV text content for user import (pure function). */
export function validateUserImportCsvString(text: string): CsvValidationResult {
  const rows = parseCsvString(text);
  if (rows.length === 0) {
    return { validRows: [], errors: [], totalRows: 0, validCount: 0, errorCount: 0 };
  }

  const headerRow = rows[0].map((h) => h.toLowerCase().trim());
  const columnMap = new Map<string, number>();
  headerRow.forEach((col, idx) => columnMap.set(col, idx));

  // Check for missing required columns
  const missingColumns = REQUIRED_COLUMNS.filter((col) => !columnMap.has(col));
  if (missingColumns.length > 0) {
    return {
      validRows: [],
      errors: missingColumns.map((col) => ({
        row: 1,
        column: col,
        value: '',
        message: `Missing required column: ${col}`,
      })),
      totalRows: rows.length - 1,
      validCount: 0,
      errorCount: rows.length - 1,
    };
  }

  const dataRows = rows.slice(1);
  const validRows: UserImportRow[] = [];
  const errors: CsvValidationError[] = [];

  for (let i = 0; i < dataRows.length; i++) {
    const row = dataRows[i];
    const rowNum = i + 2; // 1-indexed, skip header
    const rowErrors: CsvValidationError[] = [];

    const getValue = (col: string): string => {
      const idx = columnMap.get(col);
      return idx !== undefined && idx < row.length ? row[idx].trim() : '';
    };

    const email = getValue('email');
    const firstname = getValue('firstname');
    const lastname = getValue('lastname');
    const role = getValue('role').toUpperCase();

    // Validate required fields
    if (!email) {
      rowErrors.push({ row: rowNum, column: 'email', value: email, message: 'Email is required' });
    } else if (!EMAIL_REGEX.test(email)) {
      rowErrors.push({ row: rowNum, column: 'email', value: email, message: 'Invalid email format' });
    }

    if (!firstname) {
      rowErrors.push({ row: rowNum, column: 'firstname', value: firstname, message: 'First name is required' });
    }

    if (!lastname) {
      rowErrors.push({ row: rowNum, column: 'lastname', value: lastname, message: 'Last name is required' });
    }

    if (!role) {
      rowErrors.push({ row: rowNum, column: 'role', value: role, message: 'Role is required' });
    } else if (!(VALID_ROLES as readonly string[]).includes(role)) {
      rowErrors.push({ row: rowNum, column: 'role', value: role, message: `Role must be one of: ${VALID_ROLES.join(', ')}` });
    }

    // Validate optional fields
    const language = getValue('language').toLowerCase();
    if (language && !(VALID_LANGUAGES as readonly string[]).includes(language)) {
      rowErrors.push({ row: rowNum, column: 'language', value: language, message: `Language must be one of: ${VALID_LANGUAGES.join(', ')}` });
    }

    if (rowErrors.length > 0) {
      errors.push(...rowErrors);
    } else {
      const importRow: UserImportRow = {
        email,
        firstname,
        lastname,
        role: role as UserImportRow['role'],
      };
      const password = getValue('password');
      const cohort = getValue('cohort');
      const institution = getValue('institution');
      const department = getValue('department');
      const phone = getValue('phone');

      if (password) importRow.password = password;
      if (cohort) importRow.cohort = cohort;
      if (institution) importRow.institution = institution;
      if (department) importRow.department = department;
      if (phone) importRow.phone = phone;
      if (language) importRow.language = language as 'th' | 'en';

      validRows.push(importRow);
    }
  }

  return {
    validRows,
    errors,
    totalRows: dataRows.length,
    validCount: validRows.length,
    errorCount: dataRows.length - validRows.length,
  };
}

/** Export user data to CSV string. */
export function generateUserExportCsv(
  users: ExportableUser[],
  fields: string[],
): string {
  if (fields.length === 0 || users.length === 0) return '';

  const header = fields.join(',');
  const rows = users.map((user) =>
    fields.map((field) => {
      const value = String((user as Record<string, unknown>)[field] ?? '');
      // Escape values containing commas, quotes, or newlines
      if (value.includes(',') || value.includes('"') || value.includes('\n')) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','),
  );

  return [header, ...rows].join('\n');
}

/** Subset of user fields available for export. */
export interface ExportableUser {
  id?: number;
  email?: string;
  firstname?: string;
  lastname?: string;
  role?: string;
  status?: string;
  lastLogin?: string | null;
  createdAt?: string;
  cohorts?: string[];
  institution?: string;
  department?: string;
  phone?: string;
  [key: string]: unknown;
}

/** All fields available for export selection. */
export const EXPORTABLE_FIELDS = [
  'email', 'firstname', 'lastname', 'role', 'status',
  'lastLogin', 'createdAt', 'cohorts', 'institution', 'department', 'phone',
] as const;

/** Generate a CSV template string with headers and an example row. */
export function generateImportTemplate(): string {
  const headers = ALL_COLUMNS.join(',');
  const example = 'user@example.com,John,Doe,STUDENT,password123,Cohort A,ECV,Engineering,+66812345678,en';
  return `${headers}\n${example}`;
}

/** Filter users for export based on criteria. */
export function filterUsersForExport(
  users: ExportableUser[],
  filters: {
    role?: string;
    status?: string;
    cohort?: string;
    dateRange?: { from: string; to: string };
  },
): ExportableUser[] {
  return users.filter((user) => {
    if (filters.role && user.role !== filters.role) return false;
    if (filters.status && user.status !== filters.status) return false;
    if (filters.cohort && !(user.cohorts ?? []).includes(filters.cohort)) return false;
    if (filters.dateRange && user.createdAt) {
      const created = new Date(user.createdAt).getTime();
      const from = new Date(filters.dateRange.from).getTime();
      const to = new Date(filters.dateRange.to).getTime();
      if (created < from || created > to) return false;
    }
    return true;
  });
}
