'use client';

import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { ChevronUp, ChevronDown, ChevronsUpDown, ArrowLeft, ArrowRight, Activity } from 'lucide-react';

export type SortDirection = 'asc' | 'desc' | null;

interface Column<T> {
  key: keyof T;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T extends { id: string }> {
  data: T[];
  columns: Column<T>[];
  pageSize?: number;
  onRowClick?: (row: T) => void;
  className?: string;
}

/**
 * DataTable Component
 * 
 * Sortable, paginated data grid.
 */
export default function DataTable<T extends { id: string }>({
  data,
  columns,
  pageSize = 10,
  onRowClick,
  className = '',
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const handleSort = (key: keyof T) => {
    if (sortKey === key) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else if (sortDirection === 'desc') {
        setSortDirection(null);
        setSortKey(null);
      }
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
    setCurrentPage(1);
  };

  const sortedData = useMemo(() => {
    if (!sortKey || !sortDirection) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);
      }

      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [data, sortKey, sortDirection]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;
    return sortedData.slice(startIndex, startIndex + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedData.length / pageSize);

  const getSortIcon = (key: keyof T) => {
    if (sortKey !== key) {
      return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 transition-colors" />;
    }
    return sortDirection === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-slate-900 animate-bounce" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-slate-900 animate-bounce" />
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Grid Header Info */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <Activity className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 block leading-none">Data Grid</span>
            <span className="text-[12px] font-black uppercase tracking-tight text-slate-900">{data.length} items</span>
          </div>
        </div>
        
        {totalPages > 1 && (
          <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-full border border-slate-200">
             <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <span className="text-[10px] font-black uppercase tracking-widest px-2">{currentPage} / {totalPages}</span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition-all"
            >
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border-2 border-[#E5E7EB] rounded-[2.5rem] overflow-hidden shadow-[20px_20px_0px_0px_rgba(0,0,0,0.02)]">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-[#1F2937]">
                {columns.map((column) => (
                  <th
                    key={String(column.key)}
                    className={`h-16 px-6 text-left ${column.width ? column.width : ''}`}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => handleSort(column.key)}
                        className="group flex items-center gap-3 w-full outline-none"
                      >
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 group-hover:text-white transition-colors">
                          {column.label}
                        </span>
                        {getSortIcon(column.key)}
                      </button>
                    ) : (
                      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">
                        {column.label}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-6 py-20 text-center"
                  >
                    <div className="flex flex-col items-center gap-4 opacity-30">
                      <Activity className="w-12 h-12" />
                      <span className="text-xs font-black uppercase tracking-widest">No data found</span>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedData.map((row) => (
                  <tr
                    key={row.id}
                    className="group border-b border-[#F1F5F9] hover:bg-[#F8FAFC] transition-all"
                    onClick={() => onRowClick?.(row)}
                    style={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {columns.map((column) => (
                      <td
                        key={String(column.key)}
                        className="px-6 py-5"
                      >
                        <div className="text-[13px] font-black tracking-tight text-[#1F2937] uppercase">
                          {column.render
                            ? column.render(row[column.key], row)
                            : String(row[column.key])}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Grid Control */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 py-4">
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-10 h-10 rounded-2xl flex items-center justify-center text-[10px] font-black transition-all border-2 ${
                currentPage === i + 1
                  ? 'bg-slate-900 border-slate-900 text-white shadow-lg'
                  : 'bg-white border-slate-100 text-slate-400 hover:border-slate-300'
              }`}
            >
              {(i + 1).toString().padStart(2, '0')}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
