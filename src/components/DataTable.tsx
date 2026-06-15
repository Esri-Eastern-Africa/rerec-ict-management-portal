import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';
import { Table, Box, Text, LoadingOverlay, ActionIcon, Group, Tooltip } from '@mantine/core';
import { IconChevronUp, IconChevronDown, IconSelector, IconEdit, IconTrash } from '@tabler/icons-react';

interface DataTableProps<T extends object> {
  data: T[];
  columns: ColumnDef<T>[];
  loading?: boolean;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}

export default function DataTable<T extends object>({
  data,
  columns,
  loading = false,
  onEdit,
  onDelete,
}: DataTableProps<T>) {
  const [sorting, setSorting] = useState<SortingState>([]);

  const allColumns: ColumnDef<T>[] = [
    ...columns,
    ...(onEdit || onDelete
      ? [
          {
            id: 'actions',
            header: 'Actions',
            cell: ({ row }: { row: { original: T } }) => (
              <Group gap={6}>
                {onEdit && (
                  <Tooltip label="Edit">
                    <ActionIcon
                      variant="light"
                      color="blue"
                      size="sm"
                      onClick={() => onEdit(row.original)}
                    >
                      <IconEdit size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
                {onDelete && (
                  <Tooltip label="Delete">
                    <ActionIcon
                      variant="light"
                      color="red"
                      size="sm"
                      onClick={() => onDelete(row.original)}
                    >
                      <IconTrash size={14} />
                    </ActionIcon>
                  </Tooltip>
                )}
              </Group>
            ),
          } as ColumnDef<T>,
        ]
      : []),
  ];

  const table = useReactTable({
    data,
    columns: allColumns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <Box style={{ position: 'relative' }}>
      <LoadingOverlay visible={loading} zIndex={10} overlayProps={{ blur: 2 }} />
      <Box style={{ overflowX: 'auto', borderRadius: 8, border: '1px solid #e9ecef' }}>
        <Table striped highlightOnHover withColumnBorders={false} style={{ minWidth: 600 }}>
          <Table.Thead style={{ background: '#f8f9fa' }}>
            {table.getHeaderGroups().map((headerGroup) => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <Table.Th
                    key={header.id}
                    style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default', userSelect: 'none', whiteSpace: 'nowrap' }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    <Group gap={4} wrap="nowrap">
                      <Text size="sm" fw={600} c="#495057">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                      </Text>
                      {header.column.getCanSort() && (
                        header.column.getIsSorted() === 'asc' ? (
                          <IconChevronUp size={14} color="#868e96" />
                        ) : header.column.getIsSorted() === 'desc' ? (
                          <IconChevronDown size={14} color="#868e96" />
                        ) : (
                          <IconSelector size={14} color="#ced4da" />
                        )
                      )}
                    </Group>
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {table.getRowModel().rows.length === 0 && !loading ? (
              <Table.Tr>
                <Table.Td colSpan={allColumns.length} style={{ textAlign: 'center', padding: '40px 0' }}>
                  <Text c="dimmed" size="sm">No records found</Text>
                </Table.Td>
              </Table.Tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <Table.Tr key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <Table.Td key={cell.id}>
                      <Text size="sm">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </Text>
                    </Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </Box>
    </Box>
  );
}
