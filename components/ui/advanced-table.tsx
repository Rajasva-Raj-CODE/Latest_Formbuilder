import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { Button, Input, Select, Badge } from './index';
import {
  ChevronDown,
  ChevronUp,
  ChevronRight,
  ChevronLeft,
  MoreHorizontal,
  Download,
  Filter,
  Search,
  Eye,
  EyeOff,
  Settings,
  ArrowUpDown,
  X,
  RefreshCw,
} from 'lucide-react';

export interface Column<T = any> {
  key: string;
  header: string;
  accessor: (item: T) => any;
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  render?: (value: any, item: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  className?: string;
  sticky?: boolean;
  visible?: boolean;
}

export interface AdvancedTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (itemsPerPage: number) => void;
  };
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
  };
  sorting?: {
    sortBy: string;
    sortOrder: 'asc' | 'desc';
    onSort: (key: string) => void;
  };
  filtering?: {
    filters: Record<string, any>;
    onFilterChange: (key: string, value: any) => void;
    onClearFilters: () => void;
  };
  selection?: {
    selectedItems: Set<string>;
    onSelectionChange: (selectedItems: Set<string>) => void;
    getItemId: (item: T) => string;
  };
  actions?: {
    onExport?: () => void;
    onRefresh?: () => void;
    customActions?: React.ReactNode;
  };
  className?: string;
  emptyMessage?: string;
  showColumnVisibility?: boolean;
  showSearch?: boolean;
  showFilters?: boolean;
  showPagination?: boolean;
  showActions?: boolean;
  virtualScroll?: boolean;
  maxHeight?: string;
}

export function AdvancedTable<T = any>({
  data,
  columns,
  loading = false,
  pagination,
  search,
  sorting,
  filtering,
  selection,
  actions,
  className = '',
  emptyMessage = 'No data available',
  showColumnVisibility = true,
  showSearch = true,
  showFilters = true,
  showPagination = true,
  showActions = true,
  virtualScroll = false,
  maxHeight = '600px',
}: AdvancedTableProps<T>) {
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.filter(col => col.visible !== false).map(col => col.key))
  );
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});
  const [showFiltersPanel, setShowFiltersPanel] = useState(false);
  const tableRef = useRef<HTMLDivElement>(null);

  // Filter visible columns
  const visibleColumnsList = useMemo(() => {
    return columns.filter(col => visibleColumns.has(col.key));
  }, [columns, visibleColumns]);

  // Handle column visibility toggle
  const toggleColumnVisibility = useCallback((columnKey: string) => {
    setVisibleColumns(prev => {
      const newSet = new Set(prev);
      if (newSet.has(columnKey)) {
        newSet.delete(columnKey);
      } else {
        newSet.add(columnKey);
      }
      return newSet;
    });
  }, []);

  // Handle column resizing
  const handleResizeStart = useCallback((columnKey: string, e: React.MouseEvent) => {
    e.preventDefault();
    setResizingColumn(columnKey);
  }, []);

  const handleResizeMove = useCallback((e: MouseEvent) => {
    if (!resizingColumn) return;
    
    const table = tableRef.current;
    if (!table) return;

    const rect = table.getBoundingClientRect();
    const newWidth = e.clientX - rect.left;
    
    setColumnWidths(prev => ({
      ...prev,
      [resizingColumn]: Math.max(100, newWidth)
    }));
  }, [resizingColumn]);

  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
  }, []);

  useEffect(() => {
    if (resizingColumn) {
      document.addEventListener('mousemove', handleResizeMove);
      document.addEventListener('mouseup', handleResizeEnd);
      return () => {
        document.removeEventListener('mousemove', handleResizeMove);
        document.removeEventListener('mouseup', handleResizeEnd);
      };
    }
  }, [resizingColumn, handleResizeMove, handleResizeEnd]);

  // Handle selection
  const handleSelectAll = useCallback(() => {
    if (!selection) return;
    
    const allIds = new Set(data.map(item => selection.getItemId(item)));
    selection.onSelectionChange(allIds);
  }, [selection, data]);

  const handleSelectItem = useCallback((item: T) => {
    if (!selection) return;
    
    const itemId = selection.getItemId(item);
    const newSelection = new Set(selection.selectedItems);
    
    if (newSelection.has(itemId)) {
      newSelection.delete(itemId);
    } else {
      newSelection.add(itemId);
    }
    
    selection.onSelectionChange(newSelection);
  }, [selection]);

  const isAllSelected = useMemo(() => {
    if (!selection || data.length === 0) return false;
    return data.every(item => selection.selectedItems.has(selection.getItemId(item)));
  }, [selection, data]);

  const isIndeterminate = useMemo(() => {
    if (!selection || data.length === 0) return false;
    const selectedCount = selection.selectedItems.size;
    return selectedCount > 0 && selectedCount < data.length;
  }, [selection, data]);

  // Render sort icon
  const renderSortIcon = (columnKey: string) => {
    if (!sorting || sorting.sortBy !== columnKey) {
      return <ArrowUpDown className="w-4 h-4 text-gray-400" />;
    }
    return sorting.sortOrder === 'asc' 
      ? <ChevronUp className="w-4 h-4 text-blue-600" />
      : <ChevronDown className="w-4 h-4 text-blue-600" />;
  };

  // Render cell content
  const renderCell = (column: Column<T>, item: T) => {
    const value = column.accessor(item);
    
    if (column.render) {
      return column.render(value, item);
    }

    if (value === null || value === undefined) {
      return <span className="text-gray-400 italic">-</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <Badge variant={value ? 'success' : 'secondary'}>
          {value ? 'Yes' : 'No'}
        </Badge>
      );
    }

    if (typeof value === 'string') {
      return <span className="truncate">{value}</span>;
    }

    if (typeof value === 'number') {
      return <span className="font-mono">{value.toLocaleString()}</span>;
    }

    if (value instanceof Date) {
      return <span>{value.toLocaleDateString()}</span>;
    }

    return <span>{String(value)}</span>;
  };

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Table Header Controls */}
      {(showSearch || showFilters || showActions) && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">
            {/* Search */}
            {showSearch && search && (
              <div className="flex-1 relative min-w-0">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder={search.placeholder || "Search..."}
                  value={search.value}
                  onChange={(e) => search.onChange(e.target.value)}
                  className="pl-10"
                />
                {search.value && (
                  <button
                    onClick={() => search.onChange("")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            )}

            {/* Filters Toggle */}
            {showFilters && filtering && (
              <Button
                variant="outline"
                onClick={() => setShowFiltersPanel(!showFiltersPanel)}
                className="flex items-center space-x-2"
              >
                <Filter className="w-4 h-4" />
                <span>Filters</span>
                {Object.keys(filtering.filters).length > 0 && (
                  <Badge variant="secondary" className="ml-1">
                    {Object.keys(filtering.filters).length}
                  </Badge>
                )}
              </Button>
            )}

            {/* Column Visibility */}
            {showColumnVisibility && (
              <div className="relative">
                <Button
                  variant="outline"
                  onClick={() => setShowColumnMenu(!showColumnMenu)}
                  className="flex items-center space-x-2"
                >
                  <Settings className="w-4 h-4" />
                  <span>Columns</span>
                </Button>

                {showColumnMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50 border border-gray-200">
                    <div className="py-1">
                      {columns.map(column => (
                        <button
                          key={column.key}
                          onClick={() => toggleColumnVisibility(column.key)}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {visibleColumns.has(column.key) ? (
                            <Eye className="w-4 h-4 mr-2" />
                          ) : (
                            <EyeOff className="w-4 h-4 mr-2" />
                          )}
                          {column.header}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Actions */}
            {showActions && actions && (
              <div className="flex items-center space-x-2">
                {actions.onRefresh && (
                  <Button
                    variant="outline"
                    onClick={actions.onRefresh}
                    disabled={loading}
                  >
                    <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
                  </Button>
                )}
                
                {actions.onExport && (
                  <Button
                    variant="outline"
                    onClick={actions.onExport}
                    className="text-green-600 hover:text-green-700"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export
                  </Button>
                )}
                
                {actions.customActions}
              </div>
            )}
          </div>

          {/* Filters Panel */}
          {showFiltersPanel && filtering && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {columns
                  .filter(col => col.filterable)
                  .map(column => (
                    <div key={column.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {column.header}
                      </label>
                      <Input
                        placeholder={`Filter ${column.header}...`}
                        value={filtering.filters[column.key] || ''}
                        onChange={(e) => filtering.onFilterChange(column.key, e.target.value)}
                        className="w-full"
                      />
                    </div>
                  ))}
              </div>
              <div className="mt-4 flex justify-end">
                <Button
                  variant="outline"
                  onClick={filtering.onClearFilters}
                  className="text-red-600 hover:text-red-700"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div 
        ref={tableRef}
        className="relative overflow-auto"
        style={{ maxHeight: virtualScroll ? maxHeight : 'auto' }}
      >
        <table className="w-full border-collapse">
          <thead className="bg-gray-50 sticky top-0 z-10">
            <tr>
              {/* Selection Checkbox */}
              {selection && (
                <th className="sticky left-0 bg-gray-50 z-20 p-4 border-b border-gray-200">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isIndeterminate;
                    }}
                    onChange={handleSelectAll}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                </th>
              )}

              {/* Column Headers */}
              {visibleColumnsList.map((column, index) => (
                <th
                  key={column.key}
                  className={`
                    p-4 border-b border-gray-200 text-left font-medium text-gray-900
                    ${column.sticky ? 'sticky left-0 bg-gray-50 z-20' : ''}
                    ${column.align === 'center' ? 'text-center' : ''}
                    ${column.align === 'right' ? 'text-right' : ''}
                    ${column.className || ''}
                  `}
                  style={{
                    width: columnWidths[column.key] || column.width,
                    minWidth: column.minWidth || '120px',
                    maxWidth: column.maxWidth,
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {column.sortable && sorting ? (
                        <button
                          onClick={() => sorting.onSort(column.key)}
                          className="flex items-center space-x-1 hover:text-blue-600 transition-colors"
                        >
                          <span>{column.header}</span>
                          {renderSortIcon(column.key)}
                        </button>
                      ) : (
                        <span>{column.header}</span>
                      )}
                    </div>
                    
                    {/* Resize Handle */}
                    <div
                      className="w-1 h-full bg-gray-300 cursor-col-resize hover:bg-blue-500 transition-colors"
                      onMouseDown={(e) => handleResizeStart(column.key, e)}
                    />
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {loading ? (
              <tr>
                <td
                  colSpan={visibleColumnsList.length + (selection ? 1 : 0)}
                  className="p-8 text-center"
                >
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    <span className="text-gray-600">Loading...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td
                  colSpan={visibleColumnsList.length + (selection ? 1 : 0)}
                  className="p-8 text-center text-gray-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              data.map((item, rowIndex) => (
                <tr
                  key={rowIndex}
                  className="hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  {/* Selection Checkbox */}
                  {selection && (
                    <td className="sticky left-0 bg-white z-20 p-4">
                      <input
                        type="checkbox"
                        checked={selection.selectedItems.has(selection.getItemId(item))}
                        onChange={() => handleSelectItem(item)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                  )}

                  {/* Data Cells */}
                  {visibleColumnsList.map((column, colIndex) => (
                    <td
                      key={column.key}
                      className={`
                        p-4
                        ${column.sticky ? 'sticky left-0 bg-white z-20' : ''}
                        ${column.align === 'center' ? 'text-center' : ''}
                        ${column.align === 'right' ? 'text-right' : ''}
                        ${column.className || ''}
                      `}
                    >
                      {renderCell(column, item)}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {showPagination && pagination && (
        <div className="p-4 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>

            <div className="flex items-center space-x-4">
              {/* Items per page */}
              {pagination.onItemsPerPageChange && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Show:</span>
                  <Select
                    value={pagination.itemsPerPage.toString()}
                    onChange={(e) => pagination.onItemsPerPageChange!(Number(e.target.value))}
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </Select>
                </div>
              )}

              {/* Page navigation */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                  <ChevronLeft className="w-4 h-4 -ml-3" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>

                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <Button
                        key={page}
                        variant={pagination.currentPage === page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => pagination.onPageChange(page)}
                        className="px-3 py-2 min-w-[40px]"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => pagination.onPageChange(pagination.totalPages)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                  <ChevronRight className="w-4 h-4 -ml-3" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 