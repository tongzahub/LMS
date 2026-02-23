'use client';

import React, { useState } from 'react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from './Table';
import { Input } from './Input';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface DataTableColumn<T> {
  key: string;
  header: string;
  render?: (item: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  columns: DataTableColumn<T>[];
  data: T[];
  pageSize?: number;
  searchable?: boolean;
  searchPlaceholder?: string;
  onSearch?: (query: string) => void;
  getRowKey: (item: T) => string | number;
  className?: string;
  emptyMessage?: string;
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  pageSize = 10,
  searchable = false,
  searchPlaceholder = 'Search...',
  onSearch,
  getRowKey,
  className = '',
  emptyMessage = 'No data available',
}: DataTableProps<T>) {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const totalPages = Math.max(1, Math.ceil(data.length / pageSize));
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = data.slice(startIndex, startIndex + pageSize);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
    onSearch?.(e.target.value);
  };

  return (
    <div className={className}>
      {searchable && (
        <div className="mb-4">
          <Input
            type="search"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={handleSearch}
            aria-label={searchPlaceholder}
          />
        </div>
      )}

      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((col) => (
              <TableHead key={col.key}>{col.header}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length === 0 ? (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-8 text-gray-500">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            paginatedData.map((item) => (
              <TableRow key={getRowKey(item)}>
                {columns.map((col) => (
                  <TableCell key={col.key}>
                    {col.render ? col.render(item) : String(item[col.key] ?? '')}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <nav className="flex flex-wrap items-center justify-between gap-2 mt-4 px-2" aria-label="Table pagination">
          <span className="text-sm text-gray-600">
            Showing {startIndex + 1}–{Math.min(startIndex + pageSize, data.length)} of {data.length}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous page"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <span className="text-sm text-gray-600" aria-current="page">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next page"
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        </nav>
      )}
    </div>
  );
}

export { DataTable };
