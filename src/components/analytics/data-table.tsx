"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { TableData } from "@/types";

interface DataTableProps {
  data: TableData;
  maxRows?: number;
}

export function DataTable({ data, maxRows = 10 }: DataTableProps) {
  const displayRows = data.rows.slice(0, maxRows);
  const hasMore = data.rows.length > maxRows;

  return (
    <div className="space-y-2">
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {data.columns.map((col) => (
                <TableHead key={col.key} className="font-medium">
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayRows.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {data.columns.map((col) => (
                  <TableCell key={col.key}>
                    {formatCellValue(row[col.key])}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {hasMore && (
        <p className="text-sm text-muted-foreground">
          Showing {maxRows} of {data.rows.length} rows
        </p>
      )}
    </div>
  );
}

function formatCellValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "number") {
    // Check if it's a currency value (large numbers)
    if (value > 1000) {
      return `$${value.toLocaleString()}`;
    }
    return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
  }
  return String(value);
}
