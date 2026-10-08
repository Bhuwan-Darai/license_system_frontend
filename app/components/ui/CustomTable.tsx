'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Input,
  Button,
  Space,
  Pagination,
  Dropdown,
  Checkbox,
  Tooltip,
  type TableProps,
  Table,
} from 'antd';
import {
  SearchOutlined,
  SettingOutlined,
} from '@ant-design/icons';

interface CustomTableProps<T> extends Omit<TableProps<T>, 'pagination' | 'columns'> {
  columns: any[];
  initialPageSize?: number;
  searchPlaceholder?: string;
  onSearch?: (value: string) => void;
  rowKey?: string | ((record: T) => React.Key);
  // Server-side pagination: when true, `dataSource` is assumed to already be
  // just the current page's rows (fetched from the server), so the table
  // skips its own client-side search/slice and instead reports page changes
  // via `onPageChange` and total-row-count via `total`.
  manualPagination?: boolean;
  total?: number;
  currentPage?: number;
  onPageChange?: (page: number, pageSize: number) => void;
}

// Generic fallback comparator used when a column doesn't define its own `sorter` function.
// This lets every column be sortable out of the box, instead of silently no-oping.
const defaultComparator = (key: string) => (a: any, b: any) => {
  const va = a?.[key];
  const vb = b?.[key];

  if (va == null && vb == null) return 0;
  if (va == null) return -1;
  if (vb == null) return 1;

  if (typeof va === 'number' && typeof vb === 'number') return va - vb;

  return String(va).localeCompare(String(vb), undefined, { numeric: true, sensitivity: 'base' });
};

// Wraps a cell so long content is cut off with an ellipsis. The full text is
// shown in a tooltip, but only when something is actually cut off.
const TruncatedCell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [full, setFull] = useState('');

  const check = () => {
    const el = ref.current;
    if (!el) return;
    const cut =
      el.scrollWidth > el.clientWidth ||
      Array.from(el.querySelectorAll<HTMLElement>('*')).some((c) => c.scrollWidth > c.clientWidth);
    setFull(cut ? (el.innerText || '').trim() : '');
  };

  return (
    <Tooltip title={full || undefined} placement="topLeft" styles={{ root: { maxWidth: 420, wordBreak: 'break-word' } }}>
      <div ref={ref} className="ct-trunc" onMouseEnter={check}>
        {children}
      </div>
    </Tooltip>
  );
};

// columns that must never be clipped (buttons) or that opt out explicitly
const isTruncatable = (col: any) =>
  col.ellipsis !== false && !col.fixed && col.key !== 'action' && col.title !== 'Action';

const DEFAULT_COLUMN_WIDTH = 160;

// Custom Table Component
const CustomTable = <T extends object = any>({
  columns: initialColumns,
  dataSource = [],
  initialPageSize = 10,
  searchPlaceholder = 'Search...',
  onSearch,
  rowKey = 'key',
  manualPagination = false,
  total: manualTotal,
  currentPage: controlledPage,
  onPageChange,
  ...tableProps
}: CustomTableProps<T>) => {
  const [searchText, setSearchText] = useState('');
  const [internalPage, setInternalPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortedInfo, setSortedInfo] = useState<any>({});
  const [visibleColumns, setVisibleColumns] = useState(
    initialColumns.map((col) => col.dataIndex || col.key)
  );

  // Column visibility management
  const columnOptions = initialColumns.map((col) => ({
    label: col.title as string,
    value: col.dataIndex || col.key,
  }));

  const displayedColumns = useMemo(() => {
    return initialColumns
      .filter((col) => {
        const key = col.dataIndex || col.key;
        return visibleColumns.includes(key);
      })
      .map((col) => {
        const key = col.dataIndex || col.key;
        const truncate = isTruncatable(col);

        // Every column gets a width so one long value cannot stretch the table;
        // the table scrolls sideways instead when the columns do not fit.
        const width = col.width !== undefined ? col.width : DEFAULT_COLUMN_WIDTH;

        // Cut long values with an ellipsis; the tooltip is handled by TruncatedCell.
        const baseRender = col.render;
        const render = truncate
          ? (text: any, record: any, index: number) => {
              const content = baseRender
                ? baseRender(text, record, index)
                : text === null || text === undefined || text === ''
                  ? '-'
                  : String(text);
              return <TruncatedCell>{content as React.ReactNode}</TruncatedCell>;
            }
          : baseRender;

        return {
          ...col,
          width,
          ellipsis: false,
          // Keep an explicit custom sorter if provided, otherwise fall back to a generic one
          // so every column is actually sortable rather than just showing a dead sort icon.
          sorter:
            typeof col.sorter === 'function'
              ? col.sorter
              : col.sorter === false
                ? false
                : defaultComparator(key),
          sortOrder: sortedInfo.columnKey === key ? sortedInfo.order : null,
          render,
        };
      });
  }, [initialColumns, visibleColumns, sortedInfo]);

  // Client-side search + sort + pagination
  const filteredData = useMemo(() => {
    let result = [...(dataSource as T[])];

    // In manual (server-side) pagination mode, `dataSource` is already just the
    // current page's rows filtered/searched by the server, so skip local search.
    if (manualPagination) return result;

    // Search filter
    if (searchText) {
      const lowerSearch = searchText.toLowerCase();
      result = result.filter((item) =>
        Object.values(item as any).some(
          (value) => value && String(value).toLowerCase().includes(lowerSearch)
        )
      );
    }

    // Sorting (client-side) — wrap with original index as a tiebreaker so the sort
    // is always stable. Array.prototype.sort only guarantees stability for truly
    // *equal* comparator results; if a custom sorter returns 0 inconsistently across
    // renders, rows can silently reshuffle between page visits. Tagging each item with
    // its pre-sort index and falling back to it removes that nondeterminism entirely.
    if (sortedInfo.order && sortedInfo.columnKey) {
      const column = displayedColumns.find(
        (col) => (col.dataIndex || col.key) === sortedInfo.columnKey
      );

      if (column && typeof column.sorter === 'function') {
        const sorterFn = column.sorter as (a: T, b: T) => number;
        const indexed = result.map((item, idx) => ({ item, idx }));
        indexed.sort((a, b) => {
          const cmp =
            sortedInfo.order === 'ascend' ? sorterFn(a.item, b.item) : sorterFn(b.item, a.item);
          return cmp !== 0 ? cmp : a.idx - b.idx;
        });
        result = indexed.map((entry) => entry.item);
      }
    }

    return result;
  }, [dataSource, searchText, sortedInfo, displayedColumns]);

  // Server-side mode: trust the caller's total/current page instead of deriving
  // them from `dataSource`, since dataSource only ever holds the current page's rows.
  const totalRecords = manualPagination ? (manualTotal ?? dataSource.length) : filteredData.length;
  const pageCount = Math.max(1, Math.ceil(totalRecords / pageSize));
  const safePage = manualPagination
    ? (controlledPage ?? 1)
    : Math.min(internalPage, pageCount);

  // Pagination data
  const paginatedData = useMemo(() => {
    if (manualPagination) return filteredData;
    const start = (safePage - 1) * pageSize;
    return filteredData.slice(start, start + pageSize);
  }, [filteredData, safePage, pageSize, manualPagination]);

  const handleTableChange: TableProps<T>['onChange'] = (_pagination, _filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setSortedInfo(s || {});
    if (
      !manualPagination &&
      ((s as any)?.order !== sortedInfo.order || (s as any)?.columnKey !== sortedInfo.columnKey)
    ) {
      setInternalPage(1);
    }
  };

  const handleSearch = (value: string) => {
    setSearchText(value);
    if (!manualPagination) setInternalPage(1); // Reset to first page on search
    onSearch?.(value);
  };

  const handlePaginationChange = (page: number, newPageSize?: number) => {
    const nextPageSize = newPageSize && newPageSize !== pageSize ? newPageSize : pageSize;

    if (manualPagination) {
      if (nextPageSize !== pageSize) setPageSize(nextPageSize);
      onPageChange?.(newPageSize && newPageSize !== pageSize ? 1 : page, nextPageSize);
      return;
    }

    if (newPageSize && newPageSize !== pageSize) {
      setPageSize(newPageSize);
      setInternalPage(1);
    } else {
      setInternalPage(page);
    }
  };

  const toggleColumnVisibility = (checkedValues: any[]) => {
    setVisibleColumns(checkedValues);
  };

  // Custom top toolbar
  const renderTopToolbar = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
        flexWrap: 'wrap',
        gap: 12,
      }}
    >
      <Input
        placeholder={searchPlaceholder}
        prefix={<SearchOutlined />}
        onChange={(e) => handleSearch(e.target.value)}
        style={{ width: 280 }}
        allowClear
      />

      <Space>
        <Dropdown
          trigger={['click']}
          menu={{
            items: [
              {
                key: 'columns',
                label: (
                  <Checkbox.Group
                    options={columnOptions}
                    value={visibleColumns}
                    onChange={toggleColumnVisibility}
                    style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
                  />
                ),
              },
            ],
          }}
        >
          <Tooltip title="Filter Columns">
            <Button icon={<SettingOutlined />} />
          </Tooltip>
        </Dropdown>
      </Space>
    </div>
  );

  // Custom pagination component (right aligned)
  const renderPagination = (position: 'top' | 'bottom') => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'flex-end',
        marginTop: position === 'top' ? 0 : 16,
        marginBottom: position === 'top' ? 16 : 0,
      }}
    >
      <Pagination
        current={safePage}
        pageSize={pageSize}
        total={totalRecords}
        onChange={handlePaginationChange}
        showSizeChanger
        showQuickJumper
        showTotal={(total) => `Total ${total} items`}
      />
    </div>
  );

  return (
    <div className="custom-table-wrapper" style={{ minWidth: 0, maxWidth: '100%' }}>
      {/* Scoped styles: tighter cell padding + blue header */}
      <style>{`
        .custom-table-wrapper .ant-table-thead > tr > th {
          background-color: #1677ff;
          color: #fff;
          padding: 8px 10px;
        }
        .custom-table-wrapper .ant-table-thead > tr > th::before {
          background-color: rgba(255, 255, 255, 0.3) !important;
        }
        .custom-table-wrapper .ant-table-thead > tr > th .anticon,
        .custom-table-wrapper .ant-table-column-sorter-up,
        .custom-table-wrapper .ant-table-column-sorter-down {
          color: rgba(255, 255, 255, 0.85);
        }
        .custom-table-wrapper .ant-table-column-sorter-up.active,
        .custom-table-wrapper .ant-table-column-sorter-down.active {
          color: #fff;
        }
        .custom-table-wrapper .ant-table-tbody > tr > td {
          padding: 6px 10px;
        }
        .custom-table-wrapper .ant-table-thead > tr > th:hover,
        .custom-table-wrapper .ant-table-thead > tr > th.ant-table-column-has-sorters:hover {
          background-color: #0958d9;
        }
        .custom-table-wrapper .ant-table-thead > tr > th,
        .custom-table-wrapper .ant-table-tbody > tr > td {
          white-space: nowrap;
        }
        .custom-table-wrapper .ct-trunc {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        .custom-table-wrapper .ct-trunc div,
        .custom-table-wrapper .ct-trunc p {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      {renderTopToolbar()}

      {totalRecords > 0 && renderPagination('top')}

      {/* Main Table — pagination is fully handled by our own <Pagination> above/below,
          so the Table's built-in pagination must be disabled to avoid double pagination. */}
      <Table
        tableLayout="fixed"
        scroll={{ x: 'max-content', ...tableProps.scroll }}
        {...tableProps}
        columns={displayedColumns}
        dataSource={paginatedData}
        rowKey={rowKey}
        onChange={handleTableChange}
        pagination={false}
        size="small"
        bordered
      />

      {totalRecords > 0 && renderPagination('bottom')}
    </div>
  );
};

export default CustomTable;